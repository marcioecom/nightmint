// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {INightMintSeeder} from "./INightMintSeeder.sol";

interface INightMintDescriptor {
    event BackgroundsAdded(uint256 count);
    event ShapesAdded(uint256 count);
    event ColorsAdded(uint256 count);

    /// @notice Add background trait values
    /// @param backgrounds Array of background SVG strings
    function addBackgrounds(string[] calldata backgrounds) external;

    /// @notice Add shape trait values
    /// @param shapes Array of shape SVG strings
    function addShapes(string[] calldata shapes) external;

    /// @notice Add color trait values
    /// @param colors Array of color hex strings
    function addColors(string[] calldata colors) external;

    /// @notice Get the number of available backgrounds
    /// @return The count of backgrounds
    function backgroundCount() external view returns (uint256);

    /// @notice Get the number of available shapes
    /// @return The count of shapes
    function shapeCount() external view returns (uint256);

    /// @notice Get the number of available colors
    /// @return The count of colors
    function colorCount() external view returns (uint256);

    /// @notice Generate a token URI for a given token and seed
    /// @param tokenId The token ID
    /// @param seed The seed containing trait indices
    /// @return A base64-encoded data URI with JSON metadata
    function tokenURI(uint256 tokenId, INightMintSeeder.Seed memory seed) external view returns (string memory);
}
