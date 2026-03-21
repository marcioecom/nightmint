// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseTest} from "./helpers/BaseTest.sol";
import {INightMintAuctionHouse} from "../src/interfaces/INightMintAuctionHouse.sol";

contract NightMintAuctionHouseTest is BaseTest {
    function setUp() public override {
        super.setUp();
        _unpauseAuction();
    }

    // -------------------------------------------------------------------------
    // createBid
    // -------------------------------------------------------------------------

    function test_firstBidSucceeds() public {
        _bidAs(bidder1, RESERVE_PRICE);

        (, uint256 amount,,, address bidder,) = auctionHouse.auction();
        assertEq(amount, RESERVE_PRICE);
        assertEq(bidder, bidder1);
    }

    function test_bidBelowReserveReverts() public {
        (uint256 tokenId,,,,,) = auctionHouse.auction();
        vm.prank(bidder1);
        vm.expectRevert(INightMintAuctionHouse.NightMintAuctionHouse__BidTooLow.selector);
        auctionHouse.createBid{value: RESERVE_PRICE - 1}(tokenId);
    }

    function test_bidBelowIncrementReverts() public {
        _bidAs(bidder1, RESERVE_PRICE);

        (uint256 tokenId,,,,,) = auctionHouse.auction();
        vm.prank(bidder2);
        vm.expectRevert(INightMintAuctionHouse.NightMintAuctionHouse__BidTooLow.selector);
        // Bid same amount (needs 5% more)
        auctionHouse.createBid{value: RESERVE_PRICE}(tokenId);
    }

    function test_bidWrongTokenIdReverts() public {
        vm.prank(bidder1);
        vm.expectRevert(INightMintAuctionHouse.NightMintAuctionHouse__InvalidTokenId.selector);
        auctionHouse.createBid{value: RESERVE_PRICE}(999);
    }

    function test_bidAfterExpiryReverts() public {
        _warpToAuctionEnd();

        (uint256 tokenId,,,,,) = auctionHouse.auction();
        vm.prank(bidder1);
        vm.expectRevert(INightMintAuctionHouse.NightMintAuctionHouse__AuctionExpired.selector);
        auctionHouse.createBid{value: RESERVE_PRICE}(tokenId);
    }

    function test_refundsPreviousBidder() public {
        _bidAs(bidder1, RESERVE_PRICE);
        uint256 balanceBefore = bidder1.balance;

        // Bidder2 outbids - bidder1 should get refunded
        _bidAs(bidder2, RESERVE_PRICE * 2);

        assertEq(bidder1.balance, balanceBefore + RESERVE_PRICE);
    }

    function test_antiSnipingExtendsEndTime() public {
        _bidAs(bidder1, RESERVE_PRICE);

        (,,, uint256 endTimeBefore,,) = auctionHouse.auction();

        // Warp to 1 second before anti-sniping window
        vm.warp(endTimeBefore - TIME_BUFFER + 1);

        _bidAs(bidder2, RESERVE_PRICE * 2);

        (,,, uint256 endTimeAfter,,) = auctionHouse.auction();
        assertEq(endTimeAfter, block.timestamp + TIME_BUFFER);
        assertGt(endTimeAfter, endTimeBefore);
    }

    // -------------------------------------------------------------------------
    // settleCurrentAndCreateNew
    // -------------------------------------------------------------------------

    function test_settleWithBids_NFTToWinner_ETHToTreasury() public {
        _bidAs(bidder1, 1 ether);

        uint256 treasuryBalBefore = treasury.balance;
        (uint256 tokenId,,,,,) = auctionHouse.auction();

        _warpToAuctionEnd();
        _settle();

        // NFT goes to winner
        assertEq(nftToken.ownerOf(tokenId), bidder1);
        // ETH goes to treasury
        assertEq(treasury.balance, treasuryBalBefore + 1 ether);
    }

    function test_settleNoBids_NFTToTreasury() public {
        (uint256 tokenId,,,,,) = auctionHouse.auction();

        _warpToAuctionEnd();
        _settle();

        // NFT goes to treasury
        assertEq(nftToken.ownerOf(tokenId), treasury);
    }

    function test_settleCreatesNewAuction() public {
        _warpToAuctionEnd();
        _settle();

        (uint256 tokenId,, uint256 startTime,,,) = auctionHouse.auction();
        assertEq(tokenId, 1); // second token
        assertGt(startTime, 0);
    }

    function test_settleRevertsIfAuctionStillActive() public {
        vm.expectRevert(INightMintAuctionHouse.NightMintAuctionHouse__AuctionNotEnded.selector);
        _settle();
    }

    // -------------------------------------------------------------------------
    // pause / unpause
    // -------------------------------------------------------------------------

    function test_pausePreventsBids() public {
        vm.prank(deployer);
        auctionHouse.pause();

        (uint256 tokenId,,,,,) = auctionHouse.auction();
        vm.prank(bidder1);
        vm.expectRevert();
        auctionHouse.createBid{value: RESERVE_PRICE}(tokenId);
    }

    function test_pausePreventsSettlement() public {
        _warpToAuctionEnd();

        vm.prank(deployer);
        auctionHouse.pause();

        vm.expectRevert();
        _settle();
    }

    // -------------------------------------------------------------------------
    // pendingReturns / withdraw
    // -------------------------------------------------------------------------

    function test_failedRefundStoredInPendingReturns() public {
        // Deploy a contract that rejects ETH to simulate failed refund
        RejectETH rejecter = new RejectETH();
        vm.deal(address(rejecter), 10 ether);

        // Rejecter bids
        (uint256 tokenId,,,,,) = auctionHouse.auction();
        vm.prank(address(rejecter));
        auctionHouse.createBid{value: RESERVE_PRICE}(tokenId);

        // Bidder2 outbids - rejecter's refund will fail
        _bidAs(bidder2, RESERVE_PRICE * 2);

        // Check pending returns
        assertEq(auctionHouse.pendingReturns(address(rejecter)), RESERVE_PRICE);
    }
}

/// @notice Helper contract that rejects ETH transfers (for testing failed refunds)
contract RejectETH {
    receive() external payable {
        revert("no ETH accepted");
    }
}
