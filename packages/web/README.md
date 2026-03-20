# @nightmint/web

Auction frontend for the NightMint protocol.

## Stack

- Next.js 16 (App Router)
- React 19 with React Compiler
- Tailwind CSS v4
- wagmi 3 + viem 2 (Web3 hooks and client)
- MetaMask SDK
- Tabler Icons

## Development

```bash
pnpm dev      # Start dev server at http://localhost:3000
pnpm build    # Production build
pnpm start    # Serve production build
pnpm lint     # Run ESLint
```

Or from the monorepo root:

```bash
pnpm dev
pnpm build
pnpm lint
```

## Structure

```
src/
  app/
    layout.tsx          # Root layout - fonts, metadata, providers
    page.tsx            # Home page - single-column auction view
    globals.css         # Tailwind config, color tokens, utility classes
  components/
    AuctionPanel.tsx    # Main auction interface (NFT + bid status + input + history)
    NFTDisplay.tsx      # NFT image with "Live Now" badge and metadata overlay
    BidStatus.tsx       # Current bid and countdown timer
    BidInput.tsx        # Bid form with validation
    BidHistory.tsx      # Scrollable bid list
    Header.tsx          # Fixed top bar with branding and wallet connect
    BottomNav.tsx       # Fixed bottom navigation (Auction, Gallery, DAO, Profile)
    ConnectButton.tsx   # Wallet connect/disconnect
    WalletModal.tsx     # Account details dropdown
    Providers.tsx       # wagmi + React Query provider wrapper
  lib/
    wagmi.ts            # Chain config (Sepolia) and wallet connectors
    mock-data.ts        # Mock auction and bid data
```

## Design System

Mobile-first single-column layout with a "Technical-Luxe" aesthetic. Deep charcoal base (#0e0e0e) with layered tonal surfaces instead of borders. See [docs/DESIGN.md](../../docs/DESIGN.md) for the full design system specification.

Key conventions:

- Green (#9cff93) for value/money, cyan (#00cffc) for time/urgency
- Space Grotesk for headlines and data, Manrope for body text
- No 1px borders - depth via surface color shifts only
- Glassmorphism reserved for floating elements (badges, modals)

## Network

Currently configured for Sepolia testnet. See `src/lib/wagmi.ts`.
