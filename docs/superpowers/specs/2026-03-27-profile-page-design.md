# Profile Page Design

## Overview

User profile page showing owned NFTs, bid history, and activity feed. Works both as the connected user's own profile and as a public profile for any address.

## Routing

- `/profile` - own profile (requires connected wallet)
- `/profile/[address]` - public profile for any address
- `/profile/[own-address]` redirects to `/profile`
- Implementation: `app/profile/[[...address]]/page.tsx` (optional catch-all)
- BottomNav Profile tab links to `/profile`

## Approach

Client-side data fetching with React Query + wagmi, consistent with the rest of the app. No server components or SSR - profile data doesn't need SEO.

## Page Layout (top to bottom)

### 1. ProfileHeader

- Avatar: gradient circle generated from address using existing `addressToGradient` from `utils.ts`
- Address: truncated format, or ENS name via wagmi `useEnsName()` if available
- "You" indicator badge when viewing own profile

### 2. ProfileStats

- 2-column grid (same pattern as HTML reference)
- **NFTs owned:** count of won auctions
- **Total spent:** sum of winning bid amounts, displayed in ETH

### 3. ProfileNftGrid

- Reuses existing `GalleryCard` and `GalleryDetailModal` components
- Same grid layout as the gallery page
- Empty state: "No NFTs yet" message when user has no wins
- No pagination initially - NFT count per user expected to be small

### 4. ProfileActivityFeed

- Unified timeline of bids and wins, sorted by date (newest first)
- Each item shows:
  - Icon by type: trophy (win), gavel (bid), x-circle (outbid)
  - Icon colors: primary for win, secondary for bid, error for outbid
  - NFT name/tokenId
  - Bid amount in ETH
  - Relative timestamp
- Empty state: "No activity yet" message
- No pagination initially

### 5. ConnectWalletPrompt

- Shown when visiting `/profile` without a connected wallet
- Wallet icon, explanatory text, connect button
- Reuses connect logic from existing `ConnectButton` component

## Data Fetching

### New Hooks

**`useProfileBids(address)`**
- Fetches from `/api/profile/:address/bids` (endpoint already exists in indexer)
- React Query, staleTime ~30s
- Returns: list of bids with tokenId, amount, timestamp

**`useProfileWins(address)`**
- Fetches from `/api/profile/:address/wins` (endpoint already exists in indexer)
- React Query, staleTime ~60s
- Returns: list of won auctions with tokenId, amount, timestamp

**`useProfileData(address)`**
- Composite hook combining bids + wins
- Computes derived stats: total spent (sum of winning amounts), NFT count
- Builds activity feed by merging bids and wins, sorted by timestamp
- Determines bid status (won, outbid, active) by cross-referencing wins

### Existing Hooks Reused

- `useNftImage(tokenId)` - for NFT images in grid and activity feed items
- `useAccount()` - resolve connected wallet address
- `useEnsName()` - ENS resolution for display
- `useRouter()` - redirect own-address to `/profile`

## Components

### New Components

- `ProfilePanel.tsx` - main page component, orchestrates layout
- `ProfileHeader.tsx` - avatar, address, "you" badge
- `ProfileStats.tsx` - 2-column stats grid
- `ProfileNftGrid.tsx` - grid of owned NFTs using GalleryCard
- `ProfileActivityFeed.tsx` - timeline of bids/wins
- `ConnectWalletPrompt.tsx` - connect wallet CTA

### Reused Components

- `GalleryCard.tsx` - NFT card in grid
- `GalleryDetailModal.tsx` - NFT detail modal on click
- `ConnectButton.tsx` - connect logic reference

## States

- **Loading:** skeleton variants for each section (existing app pattern: `animate-pulse` + `bg-surface-container`)
- **No wallet (on `/profile`):** ConnectWalletPrompt
- **Empty profile:** header + zeroed stats + empty states in sections
- **Public profile:** same layout, no "you" badge
- **Fetch error:** retry button (existing app pattern)

## Design System Compliance

- Colors: uses existing Material Design 3 tokens from `globals.css`
- Typography: Space Grotesk for headings, Manrope for body
- Cards: `bg-surface-container-low` with `rounded-xl`
- Icons: @tabler/icons-react (trophy, gavel, x-circle, wallet)
- Skeletons: `animate-pulse` pattern
- Glass panel effect where appropriate
