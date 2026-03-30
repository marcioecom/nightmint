# NightMint

Daily NFT auction protocol. Every 24 hours, a new NFT is minted with on-chain generative art, auctioned, and settled automatically via Chainlink Automation. Proceeds go to a DAO treasury. After the initial unpause, the protocol runs on its own.

## How it works

```
Unpause
  |
  v
Mint NFT (on-chain SVG + deterministic traits)
  |
  v
Start 24h auction
  |
  v
Users place bids (5% min increment, anti-sniping extension)
  |
  v
Auction expires --> Chainlink Keeper calls performUpkeep()
  |
  v
Settle: NFT to winner, ETH to treasury
  |
  v
Repeat (mint next NFT, start next auction)
```

Once unpaused, this cycle repeats indefinitely. Chainlink Keepers handle settlement and kick off each new auction.

## Architecture

Monorepo with three packages:

```
nightmint/
  packages/
    contracts/        Solidity smart contracts (Foundry)
    web/              Auction frontend (Next.js 16)
    indexer/          Blockchain indexer and REST API (Ponder)
  docs/
    DESIGN.md         Design system specification
```

| Package | Stack |
|---------|-------|
| [`contracts`](packages/contracts) | Solidity 0.8.28, Foundry, OpenZeppelin, Chainlink Automation |
| [`web`](packages/web) | Next.js 16, React 19, wagmi, viem, Tailwind CSS v4 |
| [`indexer`](packages/indexer) | Ponder, Hono, zod |

## Smart contracts

Four contracts, narrow scope each:

`NightMintAuctionHouse` runs the auction cycle: bidding, refunds, anti-sniping, settlement, Chainlink integration.

- Auction duration: 24 hours (configurable)
- Reserve price: 0.01 ETH
- Min bid increment: 5%
- Anti-sniping buffer: 5 minutes - if a bid lands near the end, the auction extends

`NightMintToken` is the ERC-721. It can only mint through the AuctionHouse and delegates metadata entirely to the Descriptor.

`NightMintSeeder` generates a deterministic seed per token from `keccak256(blockhash(block.number - 1), tokenId, descriptor)`. Each seed maps to five traits: background, shape, shapeColor, accentShape, accentColor.

`NightMintDescriptor` stores the trait arrays and builds the full SVG + JSON metadata on-chain through the NFTDescriptor library. No IPFS. No external storage.

### Why on-chain metadata

Most NFT projects store a URL pointing to IPFS. If the pinning service stops, the art disappears. NightMint generates everything on-chain. Costs more gas to read, but the metadata doesn't depend on anyone keeping a server running.

### Anti-sniping

If a bid arrives within 5 minutes of auction end, the end time extends by 5 minutes. Without this, last-second bids would dominate since on-chain auctions have natural latency from block times.

### Refund safety

When outbid, the previous bidder gets refunded immediately via a low-level call capped at 50k gas. If that fails (e.g. the bidder is a contract that reverts on receive), funds go to a `pendingReturns` mapping for manual withdrawal. This stops a malicious bidder from bricking the auction by reverting every refund.

## Indexer

Ponder watches contract events and syncs them to a database:

- `AuctionCreated` - new auction record
- `AuctionBid` - records the bid, increments auction bid count
- `AuctionExtended` - updates auction end time
- `AuctionSettled` - marks auction settled, records winner and final bid

REST API built with Hono:

| Endpoint | What it returns |
|----------|-----------------|
| `GET /api/auctions` | Paginated list, sortable by `recent`, `highest`, `lowest` |
| `GET /api/auctions/:tokenId` | Single auction |
| `GET /api/bids/:tokenId` | Bid history for an auction |
| `GET /api/profile/:address/bids` | All bids by an address |
| `GET /api/profile/:address/wins` | Auctions won by an address |

GraphQL also available at `/graphql`.

## Frontend

The UI pulls from two sources:

1. wagmi contract reads - polls active auction state every 4 seconds (current bid, bidder, end time)
2. Ponder API - historical data for bid history, gallery, and profiles

`useBidHistory` merges indexed bids from the API with live bids from wagmi's event watcher. When you bid, it shows up immediately - before the indexer even processes the block.

Pages:
- `/` - live auction with NFT display, bid input, countdown, bid history
- `/gallery` - infinite scroll of past auctions with sorting and total volume stats

The design system uses a dark base (#0e0e0e) with color-coded semantics: green (#9cff93) for ETH/value, cyan (#00cffc) for time, purple (#ac89ff) for accents. No borders anywhere - sections separate through surface tone shifts. Full spec in [`docs/DESIGN.md`](docs/DESIGN.md).

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Setup

```bash
# Clone with submodules (OpenZeppelin, Chainlink deps)
git clone --recurse-submodules <repo-url>
cd nightmint

# Install dependencies
pnpm install

# Install Foundry dependencies
cd packages/contracts && forge install && cd ../..
```

### Environment variables

Contracts (`packages/contracts/.env`):

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=YOUR_KEY
ACCOUNT=your-foundry-account
ADDRESS=0x...
TREASURY_ADDRESS=0x...
```

Frontend (`packages/web/.env.local`):

```
NEXT_PUBLIC_AUCTION_HOUSE_ANVIL=0x...
NEXT_PUBLIC_TOKEN_ANVIL=0x...
NEXT_PUBLIC_INDEXER_URL=http://localhost:42069
```

Indexer (`packages/indexer/.env.local`):

```
PONDER_CHAIN=anvil
# Override defaults only if needed:
# PONDER_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# PONDER_CONTRACT_ADDRESS=0x...
# PONDER_START_BLOCK=10487672
```

## Development

```bash
# Start local Anvil node (4s block time)
anvil --block-time 4

# Deploy contracts to Anvil
cd packages/contracts
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# Start the indexer
pnpm indexer:dev

# Start the frontend
pnpm dev
```

### Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start frontend dev server |
| `pnpm build` | Build frontend for production |
| `pnpm lint` | Lint frontend code |
| `pnpm forge:build` | Compile contracts |
| `pnpm forge:test` | Run contract tests |
| `pnpm indexer:dev` | Start indexer (dev mode) |
| `pnpm indexer:start` | Start indexer (production) |

## Deployment

The deploy script (`packages/contracts/script/Deploy.s.sol`) does:

1. Deploy Seeder, Descriptor (populates traits), Token, AuctionHouse
2. Wire the AuctionHouse as the Token's minter
3. Unpause to start the first auction

Works on Anvil (local) and Sepolia (testnet).

## License

MIT
