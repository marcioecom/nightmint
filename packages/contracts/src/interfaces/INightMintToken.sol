// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {INightMintSeeder} from "./INightMintSeeder.sol";

interface INightMintToken {
    event TokenMinted(uint256 indexed tokenId, INightMintSeeder.Seed seed);
    event AuctionHouseUpdated(address auctionHouse);
    event SeederUpdated(address seeder);
    event DescriptorUpdated(address descriptor);

    error NightMintToken__OnlyAuctionHouse();
    error NightMintToken__NonexistentToken();

    /// @notice Mint a new token. Only callable by the auction house.
    /// @return tokenId The ID of the newly minted token
    function mint() external returns (uint256 tokenId);

    /// @notice Set the auction house address
    /// @param auctionHouse The new auction house address
    function setAuctionHouse(address auctionHouse) external;

    /// @notice Set the seeder contract address
    /// @param seeder The new seeder address
    function setSeeder(address seeder) external;

    /// @notice Set the descriptor contract address
    /// @param descriptor The new descriptor address
    function setDescriptor(address descriptor) external;
}
