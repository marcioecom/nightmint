// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface INightMintAuctionHouse {
    struct Auction {
        uint256 tokenId;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        address payable bidder;
        bool settled;
    }

    event AuctionCreated(uint256 indexed tokenId, uint256 startTime, uint256 endTime);
    event AuctionBid(uint256 indexed tokenId, address bidder, uint256 amount, bool extended);
    event AuctionExtended(uint256 indexed tokenId, uint256 endTime);
    event AuctionSettled(uint256 indexed tokenId, address winner, uint256 amount);

    error NightMintAuctionHouse__AuctionNotStarted();
    error NightMintAuctionHouse__AuctionAlreadySettled();
    error NightMintAuctionHouse__AuctionNotEnded();
    error NightMintAuctionHouse__AuctionExpired();
    error NightMintAuctionHouse__BidTooLow();
    error NightMintAuctionHouse__InvalidTokenId();
    error NightMintAuctionHouse__TransferFailed();

    /// @notice Create a bid for a token, with the value sent as ETH
    /// @param tokenId The ID of the token to bid on
    function createBid(uint256 tokenId) external payable;

    /// @notice Settle the current auction and create a new one
    function settleCurrentAndCreateNew() external;

    /// @notice Pause the auction house
    function pause() external;

    /// @notice Unpause the auction house (bootstraps first auction if needed)
    function unpause() external;

    /// @notice Set the auction duration
    /// @param duration The new duration in seconds
    function setDuration(uint256 duration) external;

    /// @notice Set the reserve price
    /// @param reservePrice The new reserve price in wei
    function setReservePrice(uint256 reservePrice) external;

    /// @notice Set the minimum bid increment percentage
    /// @param minBidIncrementPct The new percentage (e.g. 5 = 5%)
    function setMinBidIncrementPct(uint8 minBidIncrementPct) external;

    /// @notice Set the time buffer for anti-sniping
    /// @param timeBuffer The new time buffer in seconds
    function setTimeBuffer(uint256 timeBuffer) external;

    /// @notice Withdraw pending returns from failed refunds
    function withdraw() external;
}
