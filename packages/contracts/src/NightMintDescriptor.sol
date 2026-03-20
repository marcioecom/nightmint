// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {INightMintDescriptor} from "./interfaces/INightMintDescriptor.sol";
import {INightMintSeeder} from "./interfaces/INightMintSeeder.sol";
import {NFTDescriptor} from "./libraries/NFTDescriptor.sol";

/// @title NightMintDescriptor
/// @notice Stores trait data and generates on-chain SVG + JSON metadata for NightMint NFTs
contract NightMintDescriptor is INightMintDescriptor, Ownable2Step {
    string[] public backgrounds;
    string[] public shapes;
    string[] public colors;

    constructor() Ownable(msg.sender) {}

    /// @inheritdoc INightMintDescriptor
    function addBackgrounds(string[] calldata _backgrounds) external onlyOwner {
        for (uint256 i = 0; i < _backgrounds.length; i++) {
            backgrounds.push(_backgrounds[i]);
        }
        emit BackgroundsAdded(_backgrounds.length);
    }

    /// @inheritdoc INightMintDescriptor
    function addShapes(string[] calldata _shapes) external onlyOwner {
        for (uint256 i = 0; i < _shapes.length; i++) {
            shapes.push(_shapes[i]);
        }
        emit ShapesAdded(_shapes.length);
    }

    /// @inheritdoc INightMintDescriptor
    function addColors(string[] calldata _colors) external onlyOwner {
        for (uint256 i = 0; i < _colors.length; i++) {
            colors.push(_colors[i]);
        }
        emit ColorsAdded(_colors.length);
    }

    /// @inheritdoc INightMintDescriptor
    function backgroundCount() external view returns (uint256) {
        return backgrounds.length;
    }

    /// @inheritdoc INightMintDescriptor
    function shapeCount() external view returns (uint256) {
        return shapes.length;
    }

    /// @inheritdoc INightMintDescriptor
    function colorCount() external view returns (uint256) {
        return colors.length;
    }

    /// @inheritdoc INightMintDescriptor
    function tokenURI(uint256 tokenId, INightMintSeeder.Seed memory seed) external view returns (string memory) {
        string memory svg = NFTDescriptor.assembleSVG(backgrounds, shapes, colors, seed);

        string memory name = string(abi.encodePacked("NightMint #", NFTDescriptor._uint2str(tokenId)));
        string memory description = "A NightMint NFT - daily generative art auctions";

        return NFTDescriptor.generateTokenURI(name, description, svg, seed);
    }
}
