# NightMint Auction Landing Page - Design Spec

## Overview

Full-screen auction page for the NightMint daily NFT auction protocol. Inspired by Nouns DAO's clean, direct layout, wrapped in a liquid glass morphism aesthetic over a dark video background.

**Stack:** Next.js + wagmi + viem
**Network:** Sepolia testnet (mock data initially)

---

## Layout Structure

Two-panel split, full viewport height (`min-h-screen`), flex row.

### Background Layer (z-0)
- Full-screen autoplaying, looping, muted video (MP4 format, WebM fallback)
- Dark/abstract/crypto-themed (placeholder: CSS gradient `linear-gradient(135deg, #0a0a12, #0d0d18, #080812)` until final video is sourced)
- `object-cover`, covers entire viewport
- Semi-transparent dark overlay (`bg-black/40`) between video and content for text readability
- All content floats above at z-10

### Navbar (top, spans full width, sticky, z-20)
- **Left:** Logo icon (10x10 square placeholder) + "nightmint" text (semibold, tracking-tight, white)
- **Right:** "Connect Wallet" button in liquid-glass pill
- No other nav items for now
- **Wallet states:**
  - Disconnected: shows "Connect Wallet" text
  - Connecting: shows spinner/loading indicator
  - Connected: shows truncated address (0x1a2b...3c4d) with a colored avatar circle
- Wallet connection via wagmi's built-in connector modal (no RainbowKit/ConnectKit for now - keep dependencies minimal)

### Left Panel (48% width)
- **Purpose:** Pure visual - only the NFT
- Single liquid-glass container, centered, holding the NFT SVG
- NFT rendered at large size, square aspect ratio
- No text, no buttons, no additional info
- On mobile: stacks above the right panel, takes full width
- The glass container has rounded-3xl corners with the liquid-glass effect (light tier)

### Right Panel (52% width)
- **Purpose:** All information and interaction
- Content aligned left, vertically stacked with consistent spacing

#### Section 1: Navigation
- Left/right arrow buttons to browse previous/next auctions
- Date label (e.g., "March 19, 2026") next to arrows

#### Section 2: NFT Identity
- "Mint #N" - large, bold heading (text-2xl to text-4xl, font-weight 700, tracking-tight, white)

#### Section 3: Bid Status
- Two columns separated by a vertical divider:
  - **Left column:** "Current bid" label (uppercase, small, muted) + ETH symbol + amount (large, white, semibold)
  - **Right column:** "Auction ends in" label (uppercase, small, muted) + countdown timer HHh MMm SSs (large, white, semibold)
- Bottom border separating from bid input

#### Section 4: Bid Input
- Input field: liquid-glass background, placeholder showing minimum bid (current bid + 5% increment, e.g., "0.45 or more") with ETH symbol (Unicode: \u039E)
- "Bid" button: liquid-glass-strong, adjacent to input, same height
- Flex row, input takes remaining space, button is fixed width
- **States:**
  - Wallet not connected: input disabled, button shows "Connect Wallet"
  - Auction ended: input disabled, button shows "Settle Auction"
  - Submitting: button shows spinner, disabled
  - Invalid bid (below minimum): inline error text below input in `text-red-400/80`, no toast
  - Success: input clears, new bid appears at top of history list optimistically, transient green check icon next to the bid for 3 seconds
  - Transaction errors (wallet rejection, revert, network): inline error text below input, same style as validation error. Detailed error handling spec deferred to contract integration phase

#### Section 5: Bid History
- List of recent bids, each row containing:
  - Colored circle avatar (gradient, unique per address)
  - Truncated address (e.g., "0x1a2b...3c4d")
  - ETH amount (white, right-aligned)
  - External link icon (etherscan link)
- Rows separated by subtle bottom borders (rgba white, low opacity)
- "View all bids" link at bottom, centered, muted color - expands the list in-place (shows all bids with scroll)

---

## Liquid Glass CSS

Defined under `@layer components`, two tiers:

### .liquid-glass (light)
- `background: rgba(255,255,255,0.01)`
- `background-blend-mode: luminosity`
- `backdrop-filter: blur(4px)`
- `border: none`
- `box-shadow: inset 0 1px 1px rgba(255,255,255,0.1)`
- `position: relative; overflow: hidden`
- `::before` pseudo-element for gradient border:
  - `linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)`
  - `padding: 1.4px`
  - Masked via `-webkit-mask-composite: xor; mask-composite: exclude`

### .liquid-glass-strong (heavy - for CTA, panels)
- Same structure but:
  - `backdrop-filter: blur(50px)`
  - `box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15)`
  - `::before` uses 0.5/0.2 alpha instead of 0.45/0.15

**Applied to:** NFT container (light), bid input (light), Bid button (strong), Connect Wallet button (light), bid history rows (no glass - just borders)

**Right panel:** No glass on the panel wrapper itself - the dark overlay on the video provides enough contrast. The panel is transparent.

**Performance fallback:** For devices that struggle with `backdrop-filter: blur(50px)` over video, use `@supports not (backdrop-filter: blur(1px))` to fall back to `background: rgba(0,0,0,0.6)` instead.

---

## Typography

- **Display/Body:** Poppins (Google Fonts)
- **Serif accent:** Source Serif 4 (Google Fonts) - for any italic/emphasis text
- Headings: `font-weight: 500` (except NFT name which is 700)
- Color hierarchy: `text-white`, `text-white/80`, `text-white/60`, `text-white/50`
- Strict grayscale - no colored accents

---

## Color Palette

- All CSS variables are `0 0% X%` HSL values (pure grayscale)
- Text hierarchy via white opacity variants
- No colored accents anywhere in the UI
- Avatar circles are the only colored elements (gradient per address: hash the address, extract two hue values from first 4 bytes, apply `linear-gradient(135deg, hsl(h1,60%,45%), hsl(h2,60%,45%))`)

---

## Responsive Behavior

- **Desktop (lg+):** Two-panel side by side, left 48% / right 52%
- **Mobile (<lg):** Single column stack - both panels visible, just vertical. NFT on top (full width, max-h-[50vh]), auction info below with scroll
- Navbar is sticky on mobile for wallet access

---

## Interactive States

- All interactive elements: `hover:scale-105 transition-transform`
- Bid button: `hover:scale-105 active:scale-95`
- Connect Wallet: `hover:scale-105`
- Navigation arrows: `hover:text-white/80 transition-colors`
- External link icons: `hover:text-white/80`
- **Focus states:** All interactive elements get `focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none` for keyboard navigation
- **Disabled states:** `opacity-50 cursor-not-allowed` for disabled inputs/buttons

---

## Icons

All from `lucide-react`:
- `ArrowLeft`, `ArrowRight` - auction navigation
- `ExternalLink` - etherscan links on bids
- `Wallet` or text-only - connect wallet button

---

## Auction States

The page must handle these states:

| State | Timer shows | Bid input | Button | NFT display |
|-------|------------|-----------|--------|-------------|
| **Active** | Countdown running | Enabled | "Bid" | Current NFT |
| **Ended (unsettled)** | "Auction ended" | Disabled | "Settle Auction" (anyone can call) | Current NFT |
| **Settling** | "Settling..." | Disabled | Spinner | Current NFT |
| **No auction** | "Starting soon..." | Disabled | Disabled | Placeholder |
| **Won by user** | "You won!" | Hidden | Hidden | Current NFT with winner badge |

- "Won by user" is a sub-state of settled auctions where the winner address matches the connected wallet.
- Countdown collapses leading zeros: shows "12m 34s" instead of "00h 12m 34s" when hours are zero.

Navigation arrows always work - browsing past auctions shows settled state with winner info and final bid.

---

## Data Flow (initial static version)

For the initial frontend build, use mock/static data:
- NFT: placeholder SVG or colored square
- Auction: hardcoded values (nounId, amount, endTime, bidder)
- Bid history: array of 3-5 mock bids
- Timer: client-side countdown from a fixed future timestamp

Integration with smart contracts via wagmi/viem comes after contracts are deployed.

---

## Component Breakdown

```
app/
  layout.tsx          -- Poppins + Source Serif 4 fonts, global CSS
  page.tsx            -- Main auction page
  globals.css         -- Liquid glass CSS layers, Tailwind config

components/
  Navbar.tsx          -- Logo + Connect Wallet
  AuctionPanel.tsx    -- Right panel wrapper
  NFTDisplay.tsx      -- Left panel - NFT SVG container
  BidStatus.tsx       -- Current bid + timer row
  BidInput.tsx        -- Input + Bid button
  BidHistory.tsx      -- List of recent bids
  AuctionNav.tsx      -- Arrow navigation + date
  VideoBackground.tsx -- Full-screen video layer
```

---

## Key Design Decisions

1. **Left panel is pure visual** - no text or interaction, just the NFT in a glass container
2. **Right panel holds all info and action** - mirrors Nouns layout hierarchy
3. **Liquid glass over dark video** - Bloom aesthetic adapted to crypto context
4. **Grayscale only** - no color accents except procedural bid avatars
5. **Static data first** - wire to contracts later
6. **Mobile: stack, don't hide** - both panels visible, just vertical
