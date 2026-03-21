# NightMint Indexer

Indexes NightMintAuctionHouse contract events using [Ponder](https://ponder.sh) v0.16.

Stores all auction, bid, and settlement history in a database and exposes REST + GraphQL APIs.

## What this does

Watches the NightMintAuctionHouse contract for four events:

- **AuctionCreated** - a new daily auction starts
- **AuctionBid** - someone places a bid
- **AuctionExtended** - auction end time pushed back due to a late bid
- **AuctionSettled** - auction ends, winner determined

All events are stored as raw event tables. An aggregate `auction` table tracks the full
lifecycle of each auction (start, end, bids, settlement) in a single row.

## Prerequisites

- Node.js 20+
- pnpm 9+

No database setup needed for local development - Ponder uses PGlite (embedded Postgres) by default.

## Quick start: local dev with Anvil

1. Copy the env file:

```sh
cp .env.local.example .env.local
```

2. Start Anvil in another terminal (from repo root):

```sh
pnpm contracts:anvil
```

3. Deploy contracts to Anvil (from repo root):

```sh
pnpm contracts:deploy:local
```

4. Edit `.env.local` with the Anvil values:

```
PONDER_RPC_URL=http://127.0.0.1:8545
PONDER_CONTRACT_ADDRESS=0x0165878A594ca255338adfa4d48449f69242Eb8F
PONDER_CHAIN_ID=31337
PONDER_START_BLOCK=0
```

5. Start the indexer:

```sh
pnpm dev
```

Or from repo root:

```sh
pnpm indexer:dev
```

6. Open the GraphQL playground at http://localhost:42069/graphql

## Quick start: Sepolia testnet

1. Copy the env file and set your Alchemy (or Infura) Sepolia RPC URL:

```sh
cp .env.local.example .env.local
```

Edit `.env.local`:

```
PONDER_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PONDER_CONTRACT_ADDRESS=0xDB3d5753E4Ec462a7F19a260f70a1366E33FB705
PONDER_CHAIN_ID=11155111
PONDER_START_BLOCK=10487672
```

2. Start the indexer:

```sh
pnpm dev
```

The indexer will sync from the configured start block. First sync takes a few minutes
depending on the number of events.

## API endpoints

The dev server runs at http://localhost:42069 by default.

### REST

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bids/:tokenId` | Bid history for an auction (newest first) |
| GET | `/api/auctions` | All auctions (for gallery page) |
| GET | `/api/auctions/:tokenId` | Single auction details |
| GET | `/api/profile/:address/bids` | All bids by an address |
| GET | `/api/profile/:address/wins` | All auctions won by an address |

### GraphQL

Open `/graphql` in a browser for the GraphiQL explorer. Useful for dev/debug.

Example query:

```graphql
{
  bidEvents(where: { tokenId: "1" }, orderBy: "timestamp", orderDirection: "desc") {
    items {
      bidder
      amount
      timestamp
    }
  }
}
```

## Schema

| Table | Description |
|-------|-------------|
| `auction` | Aggregate auction state: tokenId, times, settled, winner, bidCount |
| `auction_event` | Raw AuctionCreated events |
| `bid_event` | Raw AuctionBid events (includes blockNumber, txHash) |
| `settled_event` | Raw AuctionSettled events |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PONDER_RPC_URL` | Yes | RPC endpoint for the chain to index |
| `PONDER_CONTRACT_ADDRESS` | Yes | NightMintAuctionHouse contract address |
| `PONDER_CHAIN_ID` | No | Chain ID (default: 11155111 for Sepolia) |
| `PONDER_START_BLOCK` | No | Block to start indexing from (default: 0) |
| `DATABASE_URL` | No | Postgres connection string (production only) |

## Production with Docker

A `docker-compose.yml` is included for a quick local Postgres setup:

```sh
docker compose up -d
DATABASE_URL=postgresql://nightmint:nightmint@localhost:5432/nightmint_indexer pnpm start
```

## Deploy on Railway

Step-by-step guide to deploy the indexer on Railway:

### 1. Create a new project

- Log into [Railway](https://railway.app) with your GitHub account
- Click **New Project** - **Deploy from GitHub repo** and select the nightmint repository

### 2. Add a Postgres database

- In the project dashboard, click **Create** - **Database** - **Add PostgreSQL**
- Railway will create a `DATABASE_URL` variable automatically

### 3. Configure the Ponder service

- Set the **Root Directory** to `packages/indexer` (since this is a monorepo)
- Add environment variables:

```
PONDER_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PONDER_CONTRACT_ADDRESS=0xDB3d5753E4Ec462a7F19a260f70a1366E33FB705
PONDER_CHAIN_ID=11155111
PONDER_START_BLOCK=10487672
```

- Reference the Postgres `DATABASE_URL` from the database service

### 4. Set the start command

In **Settings** - **Deploy**, set the custom start command:

```
pnpm start --schema $RAILWAY_DEPLOYMENT_ID
```

The `--schema` flag uses a unique schema per deployment, enabling zero-downtime deploys.

### 5. Configure health checks

In **Settings** - **Deploy**:

- **Healthcheck Path**: `/ready`
- **Healthcheck Timeout**: `3600` (maximum allowed - the indexer needs time for initial sync)

### 6. Generate a public domain

In **Settings** - **Networking** - **Generate Domain** to expose the API publicly.

Set `NEXT_PUBLIC_INDEXER_URL` in the web app to this domain.

### 7. Monitor

- Check **Build Logs** and **Deploy Logs** for errors
- The `/ready` endpoint returns 200 once the indexer has caught up to the chain tip
- The `/health` endpoint returns 200 as long as the process is running

## Troubleshooting

**Anvil restarted and the indexer is stuck or showing stale data:**
Delete the `.ponder/` directory and restart. PGlite stores its data there, and Anvil resets
wipe all on-chain state.

```sh
rm -rf .ponder && pnpm dev
```

**Indexer is slow on first sync:**
Normal - it needs to fetch all historical events from the start block. Subsequent
starts are fast because Ponder caches progress in `.ponder/`.

**CORS issues when the frontend calls the indexer:**
Ponder handles CORS automatically in dev mode. For production on a different domain,
add CORS middleware to `src/api/index.ts`:

```typescript
import { cors } from "hono/cors";
app.use("/*", cors());
```
