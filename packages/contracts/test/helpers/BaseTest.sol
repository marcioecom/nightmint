// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {NightMintSeeder} from "../../src/NightMintSeeder.sol";
import {NightMintDescriptor} from "../../src/NightMintDescriptor.sol";
import {NightMintToken} from "../../src/NightMintToken.sol";
import {NightMintAuctionHouse} from "../../src/NightMintAuctionHouse.sol";
import {INightMintSeeder} from "../../src/interfaces/INightMintSeeder.sol";

/// @title BaseTest
/// @notice Shared test setup: deploys all contracts, populates descriptor, wires them together
abstract contract BaseTest is Test {
    NightMintSeeder public seeder;
    NightMintDescriptor public descriptor;
    NightMintToken public nftToken;
    NightMintAuctionHouse public auctionHouse;

    address public deployer = makeAddr("deployer");
    address payable public treasury = payable(makeAddr("treasury"));
    address public bidder1 = makeAddr("bidder1");
    address public bidder2 = makeAddr("bidder2");

    uint256 public constant DURATION = 86400; // 24 hours
    uint256 public constant RESERVE_PRICE = 0.01 ether;
    uint8 public constant MIN_BID_INCREMENT_PCT = 5;
    uint256 public constant TIME_BUFFER = 300; // 5 minutes

    function setUp() public virtual {
        vm.startPrank(deployer);

        seeder = new NightMintSeeder();
        descriptor = new NightMintDescriptor();

        _populateDescriptor();

        nftToken = new NightMintToken(address(seeder), address(descriptor));

        auctionHouse = new NightMintAuctionHouse(
            address(nftToken), treasury, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT_PCT, TIME_BUFFER
        );

        nftToken.setAuctionHouse(address(auctionHouse));

        vm.stopPrank();

        // Fund bidders
        vm.deal(bidder1, 100 ether);
        vm.deal(bidder2, 100 ether);
    }

    function _populateDescriptor() internal {
        string[] memory backgrounds = new string[](8);
        backgrounds[0] = "#1a1a2e";
        backgrounds[1] = "#2d1b4e";
        backgrounds[2] = "#0d2818";
        backgrounds[3] = "#0a1628";
        backgrounds[4] = "#2a1525";
        backgrounds[5] = "#141414";
        backgrounds[6] = "#2d3436";
        backgrounds[7] = "#0a0a0a";
        descriptor.addBackgrounds(backgrounds);

        string[] memory shapeSvgs = new string[](6);
        shapeSvgs[0] = '<circle cx="0" cy="0" r="80"/>';
        shapeSvgs[1] = '<rect x="-80" y="-80" width="160" height="160"/>';
        shapeSvgs[2] = '<polygon points="0,-90 78,45 -78,45"/>';
        shapeSvgs[3] = '<polygon points="0,-80 80,0 0,80 -80,0"/>';
        shapeSvgs[4] = '<polygon points="40,-69 80,0 40,69 -40,69 -80,0 -40,-69"/>';
        shapeSvgs[5] = '<polygon points="0,-80 20,-20 80,-20 30,20 50,80 0,40 -50,80 -30,20 -80,-20 -20,-20"/>';
        descriptor.addShapes(shapeSvgs);

        string[] memory colorHexes = new string[](10);
        colorHexes[0] = "#00ff88";
        colorHexes[1] = "#00e5ff";
        colorHexes[2] = "#b388ff";
        colorHexes[3] = "#ff6b6b";
        colorHexes[4] = "#ffd700";
        colorHexes[5] = "#ffffff";
        colorHexes[6] = "#ff00ff";
        colorHexes[7] = "#008080";
        colorHexes[8] = "#ff8c00";
        colorHexes[9] = "#ff69b4";
        descriptor.addColors(colorHexes);
    }

    function _bidAs(address bidder, uint256 amount) internal {
        (uint256 tokenId,,,,,) = auctionHouse.auction();
        vm.prank(bidder);
        auctionHouse.createBid{value: amount}(tokenId);
    }

    function _warpToAuctionEnd() internal {
        (,,, uint256 endTime,,) = auctionHouse.auction();
        vm.warp(endTime);
    }

    function _settle() internal {
        auctionHouse.settleCurrentAndCreateNew();
    }

    function _unpauseAuction() internal {
        vm.prank(deployer);
        auctionHouse.unpause();
    }
}
