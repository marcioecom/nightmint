// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseTest} from "./helpers/BaseTest.sol";
import {INightMintSeeder} from "../src/interfaces/INightMintSeeder.sol";
import {NightMintDescriptor} from "../src/NightMintDescriptor.sol";

contract NightMintDescriptorTest is BaseTest {
    function test_addBackgroundsOnlyOwner() public {
        string[] memory bgs = new string[](1);
        bgs[0] = "#000000";

        vm.prank(bidder1);
        vm.expectRevert();
        descriptor.addBackgrounds(bgs);
    }

    function test_addShapesOnlyOwner() public {
        string[] memory s = new string[](1);
        s[0] = '<circle r="10"/>';

        vm.prank(bidder1);
        vm.expectRevert();
        descriptor.addShapes(s);
    }

    function test_addColorsOnlyOwner() public {
        string[] memory c = new string[](1);
        c[0] = "#ff0000";

        vm.prank(bidder1);
        vm.expectRevert();
        descriptor.addColors(c);
    }

    function test_countsAreCorrect() public view {
        assertEq(descriptor.backgroundCount(), 8);
        assertEq(descriptor.shapeCount(), 6);
        assertEq(descriptor.colorCount(), 10);
    }

    function test_tokenURIReturnsDataURI() public view {
        INightMintSeeder.Seed memory seed =
            INightMintSeeder.Seed({background: 0, shape: 0, shapeColor: 0, accentShape: 1, accentColor: 1});

        string memory uri = descriptor.tokenURI(0, seed);

        // Should start with data:application/json;base64,
        bytes memory uriBytes = bytes(uri);
        // Check prefix
        assertGt(uriBytes.length, 29, "URI should not be empty");

        // Check it starts with the data URI prefix
        bytes memory prefix = bytes("data:application/json;base64,");
        for (uint256 i = 0; i < prefix.length; i++) {
            assertEq(uriBytes[i], prefix[i], "URI prefix mismatch");
        }
    }
}
