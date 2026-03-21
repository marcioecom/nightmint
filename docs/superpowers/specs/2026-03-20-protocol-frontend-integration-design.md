# Protocol-Frontend Integration Design

## Context

NightMint has working smart contracts (AuctionHouse, Token, Descriptor, Seeder) and a polished frontend with mock data. This design connects them: real on-chain NFT rendering, live bidding with ETH, and automatic auction cycling. Phase 1 validates on Anvil (local), Phase 2 deploys to Sepolia testnet.

## Definition of Done

1. On-chain generated NFT (random SVG) displayed on the site
2. Users can place bids with ETH
3. After auction ends, a new NFT appears (24h in production, 2 min on Anvil)

## Architecture: Hooks-in-Orchestrator

4 custom hooks under `lib/hooks/`, called by AuctionPanel (orchestrator). Children receive props - same interfaces they have now.

### Hooks

**useAuction** - reads `auction()`, `reservePrice()`, `minBidIncrementPct()` from AuctionHouse. Uses `watch: true` for auto-polling on new blocks. Derives: status, minBid, formatted amounts.

**useNftImage** - reads `tokenURI(tokenId)` from Token contract. Decode pipeline: strip `data:application/json;base64,` prefix -> `atob()` -> parse JSON -> extract `image` field (already a `data:image/svg+xml;base64,...` URI) -> pass to `<img src />`.

**useBidActions** - `useWriteContract` for `createBid(tokenId)` with ETH value and `settleCurrentAndCreateNew()`. Returns tx state (isPending, isConfirming, error). On confirmation, triggers refetch of auction state.

**useBidHistory** - combines `getLogs` for past `AuctionBid` events (filtered by tokenId) with `useWatchContractEvent` for real-time new bids. Returns `Bid[]` matching existing component interface. Note: `AuctionBid` event emits `(tokenId, sender, value, extended)` but no timestamp - the hook must fetch block timestamp via `getBlock()` to populate the `timestamp` field in the `Bid` type.

### Contract Configuration

`lib/contracts.ts` - imports ABIs from `@nightmint/contracts/abi/*.json` (pnpm workspace). Addresses from `NEXT_PUBLIC_*` env vars, mapped by chainId (31337 for Anvil, 11155111 for Sepolia). `getContractConfig(chainId)` returns `{ address, abi }` objects.

**Prerequisite**: add `"@nightmint/contracts": "workspace:*"` to web's `package.json` dependencies and configure the contracts package to export ABIs (add `exports` or `files` field pointing to `abi/`).

### Chain Config

`lib/wagmi.ts` updated to include both `foundry` (from `viem/chains`, chainId 31337) and `sepolia` chains with dual HTTP transports.

### Component Changes

- **NFTDisplay** - add `imageSrc?: string` prop. If provided, use as `<img src>`. If undefined, show loading skeleton. Remove hardcoded IPFS URL.
- **BidInput** - add `onBid(amount: string)`, `onSettle()` callback props and `txPending: boolean`. Wire `handleBid` to call `onBid()` after validation. Show spinner when `txPending`. When `status === "ended-unsettled"`, button calls `onSettle`.
- **AuctionPanel** - replace `getMockAuctions()` with 4 hook calls. Pass contract data as props to children.
- **BidStatus** - no changes (props match contract data shape).
- **BidHistory** - no changes (props match event data shape).

### Error Handling

Contract errors mapped to user-friendly messages (ABI error names use `NightMintAuctionHouse__` prefix):
- `NightMintAuctionHouse__BidTooLow` - "Your bid must be at least X ETH"
- `NightMintAuctionHouse__AuctionExpired` - "This auction has ended. Settle to start a new one."
- `NightMintAuctionHouse__InvalidTokenId` - "Wrong auction. Please refresh."
- User rejection - "Transaction cancelled."
- Insufficient funds - "Not enough ETH in your wallet."

### Settlement

Chainlink Keeper handles settlement in production. For Anvil testing, manual "Settle Auction" button in BidInput (already covered by `status === "ended-unsettled"` state).

### Environment

`.env.local` (Anvil):
```
NEXT_PUBLIC_AUCTION_HOUSE_ANVIL=<address from deploy>
NEXT_PUBLIC_TOKEN_ANVIL=<address from deploy>
TREASURY_ADDRESS=<anvil account>
```

Anvil deploy uses 2-minute auction duration (vs 24h for Sepolia).

## File Inventory

### New (5)
- `packages/web/src/lib/contracts.ts`
- `packages/web/src/lib/hooks/useAuction.ts`
- `packages/web/src/lib/hooks/useNftImage.ts`
- `packages/web/src/lib/hooks/useBidActions.ts`
- `packages/web/src/lib/hooks/useBidHistory.ts`

### Modified (4)
- `packages/web/src/lib/wagmi.ts` - add foundry chain
- `packages/web/src/components/AuctionPanel.tsx` - hooks instead of mock data
- `packages/web/src/components/NFTDisplay.tsx` - dynamic imageSrc prop
- `packages/web/src/components/BidInput.tsx` - tx callbacks + pending state

### Deploy Script Change (1)
- `packages/contracts/script/Deploy.s.sol` - parameterize duration for local vs production (or create a separate local deploy script)

## Implementation Order

1. **Foundation**: wagmi.ts + contracts.ts + .env.local template
2. **Deploy to Anvil**: start anvil, deploy contracts, capture addresses
3. **Read hooks**: useAuction, useNftImage, useBidHistory (parallel)
4. **Write hook**: useBidActions
5. **Wire up**: AuctionPanel + NFTDisplay + BidInput updates
6. **E2E test on Anvil**

## Verification

1. `make anvil` - start local chain
2. `make deploy` - deploy contracts (addresses logged)
3. Copy addresses to `.env.local`
4. `pnpm dev` - start frontend
5. Connect MetaMask to localhost:8545 (chainId 31337)
6. Import Anvil test account (private key from mnemonic)
7. Verify: on-chain SVG NFT renders in NFTDisplay
8. Place a bid - verify MetaMask popup, tx confirmation, bid appears in history
9. Wait 2 minutes for auction end
10. Click "Settle Auction" - verify new NFT appears, timer resets, bid history clears
