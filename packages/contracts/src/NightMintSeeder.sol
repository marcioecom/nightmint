// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {INightMintSeeder} from "./interfaces/INightMintSeeder.sol";
import {INightMintDescriptor} from "./interfaces/INightMintDescriptor.sol";

/// @title NightMintSeeder
/// @notice Generates pseudo-random seeds for NightMint NFTs
contract NightMintSeeder is INightMintSeeder {
    /// @inheritdoc INightMintSeeder
    function generateSeed(uint256 tokenId, address descriptor) external view returns (Seed memory) {
        uint256 pseudorandom = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), tokenId, descriptor)));

        uint256 bgCount = INightMintDescriptor(descriptor).backgroundCount();
        uint256 shapeCount = INightMintDescriptor(descriptor).shapeCount();
        uint256 colorCount = INightMintDescriptor(descriptor).colorCount();

        return Seed({
            background: uint48(pseudorandom % bgCount),
            shape: uint48((pseudorandom >> 48) % shapeCount),
            shapeColor: uint48((pseudorandom >> 96) % colorCount),
            accentShape: uint48((pseudorandom >> 144) % shapeCount),
            accentColor: uint48((pseudorandom >> 192) % colorCount)
        });
    }
}
