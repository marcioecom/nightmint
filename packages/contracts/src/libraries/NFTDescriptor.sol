// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {INightMintSeeder} from "../interfaces/INightMintSeeder.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @title NFTDescriptor
/// @notice Library for generating on-chain SVG and JSON metadata for NightMint NFTs
library NFTDescriptor {
    string internal constant SVG_HEADER =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" shape-rendering="crispEdges">';
    string internal constant SVG_FOOTER = "</svg>";

    bytes internal constant BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Assemble an SVG image from trait arrays and a seed
    /// @param backgrounds The array of background color hex strings
    /// @param shapes The array of shape SVG elements
    /// @param colors The array of color hex strings
    /// @param seed The seed determining which traits to use
    /// @return The complete SVG string
    function assembleSVG(
        string[] storage backgrounds,
        string[] storage shapes,
        string[] storage colors,
        INightMintSeeder.Seed memory seed
    ) internal view returns (string memory) {
        string memory bg = backgrounds[seed.background];
        string memory mainShape = shapes[seed.shape];
        string memory mainColor = colors[seed.shapeColor];
        string memory accentShape = shapes[seed.accentShape];
        string memory accentColor = colors[seed.accentColor];

        return string(
            abi.encodePacked(
                SVG_HEADER,
                '<rect width="320" height="320" fill="',
                bg,
                '"/>',
                '<g fill="',
                mainColor,
                '" transform="translate(160,160)">',
                mainShape,
                "</g>",
                '<g fill="',
                accentColor,
                '" opacity="0.5" transform="translate(160,160) scale(0.5)">',
                accentShape,
                "</g>",
                SVG_FOOTER
            )
        );
    }

    /// @notice Generate a complete token URI as a base64-encoded data URI
    /// @param name The token name
    /// @param description The token description
    /// @param svg The SVG image string
    /// @param seed The seed for attribute generation
    /// @return A data URI containing base64-encoded JSON metadata
    function generateTokenURI(
        string memory name,
        string memory description,
        string memory svg,
        INightMintSeeder.Seed memory seed
    ) internal pure returns (string memory) {
        string memory svgBase64 = Base64.encode(bytes(svg));

        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                name,
                '","description":"',
                description,
                '","image":"data:image/svg+xml;base64,',
                svgBase64,
                '","attributes":[',
                _buildAttributes(seed),
                "]}"
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _buildAttributes(INightMintSeeder.Seed memory seed) private pure returns (string memory) {
        return string(
            abi.encodePacked(
                '{"trait_type":"Background","value":"',
                _uint2str(seed.background),
                '"},{"trait_type":"Shape","value":"',
                _uint2str(seed.shape),
                '"},{"trait_type":"Shape Color","value":"',
                _uint2str(seed.shapeColor),
                '"},{"trait_type":"Accent Shape","value":"',
                _uint2str(seed.accentShape),
                '"},{"trait_type":"Accent Color","value":"',
                _uint2str(seed.accentColor),
                '"}'
            )
        );
    }

    function _uint2str(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
