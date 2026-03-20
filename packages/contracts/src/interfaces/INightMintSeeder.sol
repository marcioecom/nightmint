// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface INightMintSeeder {
    struct Seed {
        uint48 background;
        uint48 shape;
        uint48 shapeColor;
        uint48 accentShape;
        uint48 accentColor;
    }

    /// @notice Generate a pseudo-random seed for a given token
    /// @param tokenId The token ID to generate a seed for
    /// @param descriptor The descriptor contract address used as additional entropy
    /// @return A Seed struct with trait indices
    function generateSeed(uint256 tokenId, address descriptor) external view returns (Seed memory);
}
