# @nightmint/contracts

Solidity smart contracts for the NightMint protocol.

## Contracts

| Contract | Description |
|----------|-------------|
| `NightMintToken` | ERC-721 token. Only the AuctionHouse can mint. Delegates metadata to Descriptor. |
| `NightMintAuctionHouse` | Core auction engine - 24h cycles, anti-sniping extension, automatic settlement. |
| `NightMintDescriptor` | On-chain SVG and JSON metadata generation from trait arrays. |
| `NightMintSeeder` | Pseudo-random seed generation for trait selection. |
| `NFTDescriptor` | Library for assembling SVG and base64-encoding data URIs. |

## Auction Lifecycle

1. `unpause()` bootstraps the first auction by minting a token
2. Users call `createBid(tokenId)` with ETH - previous bidder is refunded automatically
3. Bids in the last 5 minutes extend the auction by 5 minutes (anti-sniping)
4. After expiry, anyone calls `settleCurrentAndCreateNew()` to transfer the NFT to the winner (or treasury if no bids), send ETH to treasury, and start the next auction

## Default Parameters

| Parameter | Value |
|-----------|-------|
| Duration | 86400s (24h) |
| Reserve price | 0.01 ETH |
| Min bid increment | 5% |
| Time buffer (anti-sniping) | 300s (5m) |

## Build and Test

```bash
forge build
forge test -vvv
forge test --gas-report
```

Or via pnpm from the monorepo root:

```bash
pnpm forge:build
pnpm forge:test
```

## Deploy

Requires a `TREASURY_ADDRESS` environment variable.

```bash
# Local (Anvil)
make deploy

# Sepolia
make deploy-sepolia
```

See the [Makefile](Makefile) for all available commands (`make help`).

## Stack

- Solidity 0.8.28
- Foundry (forge, anvil, cast)
- OpenZeppelin Contracts (ERC-721, Ownable2Step, Pausable, ReentrancyGuard)
