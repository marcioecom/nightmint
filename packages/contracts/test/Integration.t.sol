// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseTest} from "./helpers/BaseTest.sol";

/// @title IntegrationTest
/// @notice Full lifecycle test: deploy -> populate -> wire -> unpause -> bid -> settle -> verify
contract IntegrationTest is BaseTest {
    function test_fullLifecycle() public {
        // 1. Unpause bootstraps first auction
        _unpauseAuction();

        (uint256 tokenId0,, uint256 startTime, uint256 endTime,,) = auctionHouse.auction();
        assertEq(tokenId0, 0);
        assertGt(startTime, 0);
        assertEq(endTime, startTime + DURATION);

        // 2. Bidder1 places a bid
        _bidAs(bidder1, 1 ether);

        (, uint256 amount,,, address bidder,) = auctionHouse.auction();
        assertEq(amount, 1 ether);
        assertEq(bidder, bidder1);

        // 3. Bidder2 outbids
        uint256 bidder1BalBefore = bidder1.balance;
        _bidAs(bidder2, 2 ether);

        // Bidder1 gets refunded
        assertEq(bidder1.balance, bidder1BalBefore + 1 ether);

        // 4. Settle auction
        _warpToAuctionEnd();

        uint256 treasuryBalBefore = treasury.balance;
        _settle();

        // NFT goes to winner (bidder2)
        assertEq(nftToken.ownerOf(0), bidder2);
        // ETH goes to treasury
        assertEq(treasury.balance, treasuryBalBefore + 2 ether);

        // 5. New auction started
        (uint256 tokenId1,,,,,) = auctionHouse.auction();
        assertEq(tokenId1, 1);

        // 6. No-bid scenario: settle without bids
        _warpToAuctionEnd();
        _settle();

        // NFT goes to treasury when no bids
        assertEq(nftToken.ownerOf(1), treasury);

        // 7. Another auction started
        (uint256 tokenId2,,,,,) = auctionHouse.auction();
        assertEq(tokenId2, 2);
    }

    function test_tokenURIWorksAfterMint() public {
        _unpauseAuction();

        string memory uri = nftToken.tokenURI(0);
        bytes memory uriBytes = bytes(uri);
        assertGt(uriBytes.length, 0);
    }
}
