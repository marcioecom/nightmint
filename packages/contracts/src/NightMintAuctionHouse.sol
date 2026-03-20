// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {INightMintAuctionHouse} from "./interfaces/INightMintAuctionHouse.sol";
import {INightMintToken} from "./interfaces/INightMintToken.sol";

/// @title NightMintAuctionHouse
/// @notice The core auction protocol for NightMint daily NFT auctions
contract NightMintAuctionHouse is INightMintAuctionHouse, Ownable2Step, Pausable, ReentrancyGuard {
    /// @notice The NightMint token contract
    INightMintToken public immutable token;

    /// @notice The treasury address that receives auction proceeds
    address payable public immutable treasury;

    /// @notice The auction duration in seconds
    uint256 public duration;

    /// @notice The minimum price for the first bid
    uint256 public reservePrice;

    /// @notice The minimum bid increment percentage (e.g. 5 = 5%)
    uint8 public minBidIncrementPct;

    /// @notice The time buffer for anti-sniping in seconds
    uint256 public timeBuffer;

    /// @notice The current auction
    Auction public auction;

    /// @notice Pending returns for failed refunds
    mapping(address => uint256) public pendingReturns;

    constructor(
        address _token,
        address payable _treasury,
        uint256 _duration,
        uint256 _reservePrice,
        uint8 _minBidIncrementPct,
        uint256 _timeBuffer
    ) Ownable(msg.sender) {
        token = INightMintToken(_token);
        treasury = _treasury;
        duration = _duration;
        reservePrice = _reservePrice;
        minBidIncrementPct = _minBidIncrementPct;
        timeBuffer = _timeBuffer;

        _pause();
    }

    /// @inheritdoc INightMintAuctionHouse
    function createBid(uint256 tokenId) external payable nonReentrant whenNotPaused {
        Auction storage _auction = auction;

        if (_auction.startTime == 0) revert NightMintAuctionHouse__AuctionNotStarted();
        if (_auction.settled) revert NightMintAuctionHouse__AuctionAlreadySettled();
        if (block.timestamp >= _auction.endTime) revert NightMintAuctionHouse__AuctionExpired();
        if (tokenId != _auction.tokenId) revert NightMintAuctionHouse__InvalidTokenId();

        if (_auction.amount == 0) {
            if (msg.value < reservePrice) revert NightMintAuctionHouse__BidTooLow();
        } else {
            if (msg.value < _auction.amount + ((_auction.amount * minBidIncrementPct) / 100)) {
                revert NightMintAuctionHouse__BidTooLow();
            }
        }

        address payable lastBidder = _auction.bidder;
        uint256 lastAmount = _auction.amount;

        _auction.amount = msg.value;
        _auction.bidder = payable(msg.sender);

        // Refund the previous bidder (CEI: state already updated)
        if (lastBidder != address(0)) {
            (bool success,) = lastBidder.call{value: lastAmount}("");
            if (!success) {
                pendingReturns[lastBidder] += lastAmount;
            }
        }

        // Anti-sniping: extend if bid is in the last timeBuffer seconds
        bool extended = false;
        if (_auction.endTime - block.timestamp < timeBuffer) {
            _auction.endTime = block.timestamp + timeBuffer;
            extended = true;
            emit AuctionExtended(tokenId, _auction.endTime);
        }

        emit AuctionBid(tokenId, msg.sender, msg.value, extended);
    }

    /// @inheritdoc INightMintAuctionHouse
    function settleCurrentAndCreateNew() external nonReentrant whenNotPaused {
        _settleAuction();
        _createAuction();
    }

    /// @inheritdoc INightMintAuctionHouse
    function pause() external onlyOwner {
        _pause();
    }

    /// @inheritdoc INightMintAuctionHouse
    function unpause() external onlyOwner {
        _unpause();

        // Bootstrap the first auction if none exists
        if (auction.startTime == 0) {
            _createAuction();
        }
    }

    /// @inheritdoc INightMintAuctionHouse
    function setDuration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    /// @inheritdoc INightMintAuctionHouse
    function setReservePrice(uint256 _reservePrice) external onlyOwner {
        reservePrice = _reservePrice;
    }

    /// @inheritdoc INightMintAuctionHouse
    function setMinBidIncrementPct(uint8 _minBidIncrementPct) external onlyOwner {
        minBidIncrementPct = _minBidIncrementPct;
    }

    /// @inheritdoc INightMintAuctionHouse
    function setTimeBuffer(uint256 _timeBuffer) external onlyOwner {
        timeBuffer = _timeBuffer;
    }

    /// @inheritdoc INightMintAuctionHouse
    function withdraw() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        if (amount == 0) return;

        pendingReturns[msg.sender] = 0;

        (bool success,) = msg.sender.call{value: amount}("");
        if (!success) revert NightMintAuctionHouse__TransferFailed();
    }

    /// @notice Settle the current auction by transferring NFT and ETH
    function _settleAuction() internal {
        Auction storage _auction = auction;

        if (_auction.startTime == 0) revert NightMintAuctionHouse__AuctionNotStarted();
        if (_auction.settled) revert NightMintAuctionHouse__AuctionAlreadySettled();
        if (block.timestamp < _auction.endTime) revert NightMintAuctionHouse__AuctionNotEnded();

        _auction.settled = true;

        if (_auction.bidder == address(0)) {
            // No bids: send NFT to treasury
            IERC721(address(token)).transferFrom(address(this), treasury, _auction.tokenId);
        } else {
            // Has bids: send NFT to winner, ETH to treasury
            IERC721(address(token)).transferFrom(address(this), _auction.bidder, _auction.tokenId);

            (bool success,) = treasury.call{value: _auction.amount}("");
            if (!success) revert NightMintAuctionHouse__TransferFailed();
        }

        emit AuctionSettled(_auction.tokenId, _auction.bidder, _auction.amount);
    }

    /// @notice Create a new auction by minting an NFT and starting the timer
    function _createAuction() internal {
        uint256 tokenId = token.mint();

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        auction = Auction({
            tokenId: tokenId,
            amount: 0,
            startTime: startTime,
            endTime: endTime,
            bidder: payable(address(0)),
            settled: false
        });

        emit AuctionCreated(tokenId, startTime, endTime);
    }
}
