// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseTest} from "./helpers/BaseTest.sol";
import {INightMintToken} from "../src/interfaces/INightMintToken.sol";

contract NightMintTokenTest is BaseTest {
    function setUp() public override {
        super.setUp();
        _unpauseAuction();
    }

    function test_mintRevertsForNonAuctionHouse() public {
        vm.prank(bidder1);
        vm.expectRevert(INightMintToken.NightMintToken__OnlyAuctionHouse.selector);
        nftToken.mint();
    }

    function test_mintIncrementsTokenId() public {
        // First token was minted on unpause (tokenId 0)
        assertEq(nftToken.currentTokenId(), 1);

        // Settle and create new - mints tokenId 1
        _warpToAuctionEnd();
        _settle();
        assertEq(nftToken.currentTokenId(), 2);
    }

    function test_mintStoresSeedAndEmitsEvent() public {
        // Token 0 was minted during unpause
        (uint48 bg, uint48 shape, uint48 shapeColor, uint48 accentShape, uint48 accentColor) = nftToken.seeds(0);

        // Seed should have valid values (within bounds)
        assertLt(bg, descriptor.backgroundCount());
        assertLt(shape, descriptor.shapeCount());
        assertLt(shapeColor, descriptor.colorCount());
        assertLt(accentShape, descriptor.shapeCount());
        assertLt(accentColor, descriptor.colorCount());
    }

    function test_tokenURIRevertsForNonexistentToken() public {
        vm.expectRevert(INightMintToken.NightMintToken__NonexistentToken.selector);
        nftToken.tokenURI(999);
    }

    function test_tokenURIReturnsDataURI() public view {
        string memory uri = nftToken.tokenURI(0);
        bytes memory uriBytes = bytes(uri);
        assertGt(uriBytes.length, 0, "URI should not be empty");
    }

    function test_setAuctionHouseOnlyOwner() public {
        vm.prank(bidder1);
        vm.expectRevert();
        nftToken.setAuctionHouse(address(0));
    }

    function test_setSeederOnlyOwner() public {
        vm.prank(bidder1);
        vm.expectRevert();
        nftToken.setSeeder(address(0));
    }

    function test_setDescriptorOnlyOwner() public {
        vm.prank(bidder1);
        vm.expectRevert();
        nftToken.setDescriptor(address(0));
    }
}
