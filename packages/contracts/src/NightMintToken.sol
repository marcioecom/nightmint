// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {INightMintToken} from "./interfaces/INightMintToken.sol";
import {INightMintSeeder} from "./interfaces/INightMintSeeder.sol";
import {INightMintDescriptor} from "./interfaces/INightMintDescriptor.sol";

/// @title NightMintToken
/// @notice ERC-721 token for NightMint daily auctions. Only the auction house can mint.
contract NightMintToken is INightMintToken, ERC721, Ownable2Step {
    /// @notice The auction house address - only this address can mint
    address public auctionHouse;

    /// @notice The seeder contract for generating trait seeds
    INightMintSeeder public seeder;

    /// @notice The descriptor contract for generating token URIs
    INightMintDescriptor public descriptor;

    /// @notice The next token ID to be minted
    uint256 public currentTokenId;

    /// @notice Mapping of token ID to its seed
    mapping(uint256 => INightMintSeeder.Seed) public seeds;

    modifier onlyAuctionHouse() {
        if (msg.sender != auctionHouse) revert NightMintToken__OnlyAuctionHouse();
        _;
    }

    constructor(address _seeder, address _descriptor) ERC721("NightMint", "NMINT") Ownable(msg.sender) {
        seeder = INightMintSeeder(_seeder);
        descriptor = INightMintDescriptor(_descriptor);
    }

    /// @inheritdoc INightMintToken
    function mint() external onlyAuctionHouse returns (uint256 tokenId) {
        tokenId = currentTokenId++;

        INightMintSeeder.Seed memory seed = seeder.generateSeed(tokenId, address(descriptor));
        seeds[tokenId] = seed;

        _mint(auctionHouse, tokenId);

        emit TokenMinted(tokenId, seed);
    }

    /// @notice Returns the token URI for a given token ID
    /// @param tokenId The token ID to query
    /// @return The token URI as a data URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert NightMintToken__NonexistentToken();
        return descriptor.tokenURI(tokenId, seeds[tokenId]);
    }

    /// @inheritdoc INightMintToken
    function setAuctionHouse(address _auctionHouse) external onlyOwner {
        auctionHouse = _auctionHouse;
        emit AuctionHouseUpdated(_auctionHouse);
    }

    /// @inheritdoc INightMintToken
    function setSeeder(address _seeder) external onlyOwner {
        seeder = INightMintSeeder(_seeder);
        emit SeederUpdated(_seeder);
    }

    /// @inheritdoc INightMintToken
    function setDescriptor(address _descriptor) external onlyOwner {
        descriptor = INightMintDescriptor(_descriptor);
        emit DescriptorUpdated(_descriptor);
    }
}
