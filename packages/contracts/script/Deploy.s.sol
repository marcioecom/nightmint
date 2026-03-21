// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {NightMintSeeder} from "../src/NightMintSeeder.sol";
import {NightMintDescriptor} from "../src/NightMintDescriptor.sol";
import {NightMintToken} from "../src/NightMintToken.sol";
import {NightMintAuctionHouse} from "../src/NightMintAuctionHouse.sol";

/// @title Deploy
/// @notice Deploys the full NightMint protocol stack
contract Deploy is Script {
    uint256 constant RESERVE_PRICE = 0.01 ether;
    uint8 constant MIN_BID_INCREMENT_PCT = 5;
    uint256 constant TIME_BUFFER = 300; // 5 minutes

    function run() external {
        uint256 duration = vm.envOr("AUCTION_DURATION", uint256(86400));
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast();

        // 1. Deploy Seeder
        NightMintSeeder seeder = new NightMintSeeder();
        console.log("Seeder:", address(seeder));

        // 2. Deploy Descriptor and populate traits
        NightMintDescriptor descriptor = new NightMintDescriptor();
        console.log("Descriptor:", address(descriptor));

        _populateDescriptor(descriptor);

        // 3. Deploy Token
        NightMintToken token = new NightMintToken(address(seeder), address(descriptor));
        console.log("Token:", address(token));

        // 4. Deploy AuctionHouse
        NightMintAuctionHouse auctionHouse = new NightMintAuctionHouse(
            address(token), payable(treasury), duration, RESERVE_PRICE, MIN_BID_INCREMENT_PCT, TIME_BUFFER
        );
        console.log("AuctionHouse:", address(auctionHouse));

        // 5. Wire: set auction house on token
        token.setAuctionHouse(address(auctionHouse));

        // 6. Bootstrap: unpause to start first auction
        auctionHouse.unpause();

        vm.stopBroadcast();

        console.log("Deployment complete. First auction started.");
    }

    function _populateDescriptor(NightMintDescriptor descriptor) internal {
        string[] memory backgrounds = new string[](8);
        backgrounds[0] = "#1a1a2e"; // charcoal
        backgrounds[1] = "#2d1b4e"; // deep purple
        backgrounds[2] = "#0d2818"; // midnight green
        backgrounds[3] = "#0a1628"; // navy
        backgrounds[4] = "#2a1525"; // wine
        backgrounds[5] = "#141414"; // obsidian
        backgrounds[6] = "#2d3436"; // slate
        backgrounds[7] = "#0a0a0a"; // void black
        descriptor.addBackgrounds(backgrounds);

        string[] memory shapes = new string[](6);
        shapes[0] = '<circle cx="0" cy="0" r="80"/>';
        shapes[1] = '<rect x="-80" y="-80" width="160" height="160"/>';
        shapes[2] = '<polygon points="0,-90 78,45 -78,45"/>';
        shapes[3] = '<polygon points="0,-80 80,0 0,80 -80,0"/>';
        shapes[4] = '<polygon points="40,-69 80,0 40,69 -40,69 -80,0 -40,-69"/>';
        shapes[5] = '<polygon points="0,-80 20,-20 80,-20 30,20 50,80 0,40 -50,80 -30,20 -80,-20 -20,-20"/>';
        descriptor.addShapes(shapes);

        string[] memory colors = new string[](10);
        colors[0] = "#00ff88"; // green
        colors[1] = "#00e5ff"; // cyan
        colors[2] = "#b388ff"; // purple
        colors[3] = "#ff6b6b"; // coral
        colors[4] = "#ffd700"; // gold
        colors[5] = "#ffffff"; // white
        colors[6] = "#ff00ff"; // magenta
        colors[7] = "#008080"; // teal
        colors[8] = "#ff8c00"; // orange
        colors[9] = "#ff69b4"; // pink
        descriptor.addColors(colors);
    }
}
