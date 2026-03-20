# Design System Strategy: The On-Chain Gallery

## 1. Overview & Creative North Star

**Brand:** NightMint - Daily NFT Auction

The Creative North Star for this design system is **"The Digital Curator."**

We are moving away from the cluttered, "gamified" look of typical Web3 apps. Instead, we are building a high-end editorial experience that treats NFTs as fine art and blockchain data as a premium architectural material. This system rejects the standard "grid-of-cards" template in favor of an intentional, asymmetrical layout that feels both technical and sophisticated.

By pairing the raw, structural nature of pixel-inspired typography with the ethereal depth of glassmorphism, we create a "Technical-Luxe" aesthetic. This system balances the "Trustworthy" requirement through rock-solid alignment and the "Modern" requirement through breathing room and tonal layering.

---

## 2. Layout & Navigation

### Mobile-First Single Column

The app uses a mobile-first single column layout (`max-w-md mx-auto`) with fixed header and bottom navigation. There is no two-panel desktop split - the content flows vertically in a single column centered on screen.

### Fixed Header

`bg-zinc-900/50 backdrop-blur-xl`, fixed top, z-50. Contains:
- **Left:** Tabler `IconLayoutGrid` in `text-primary` + "NightMint" branding (`font-headline text-2xl font-bold tracking-tighter`)
- **Right:** ConnectButton (wallet connect/profile)

### Bottom Navigation Bar

`bg-zinc-900/80 backdrop-blur-2xl`, fixed bottom, z-50, `rounded-t-[20px]`. Four tabs:
- Auction (`IconGavel`) - active state: `bg-surface-bright text-primary rounded-xl`
- Gallery (`IconPhoto`)
- DAO (`IconBuildingBank`)
- Profile (`IconUser`)

Inactive tabs: `text-zinc-500 hover:text-white`. Labels: `text-[11px] font-medium uppercase tracking-widest`.

### Content Area

`pt-24 pb-32 px-4` to account for fixed header (64px) and bottom nav (80px). Sections separated by `space-y-8`.

---

## 3. Colors & Surface Philosophy

The palette is rooted in a deep charcoal base (`#0e0e0e`) to allow the high-contrast accents to vibrate with energy.

### The "No-Line" Rule

**Standard 1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts or subtle tonal transitions. To separate a bidding panel from a gallery view, use `surface-container-low` against the `surface` background.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers. We use a "Nested Depth" approach:

- **Base Layer:** `surface` (#0e0e0e) - The foundation.
- **Lowest Layer:** `surface-container-lowest` (#000000) - Sunken inputs.
- **Section Layer:** `surface-container-low` (#131313) - Large content blocks, bid stat cards.
- **Container Layer:** `surface-container` (#1a1919) - Grouped sections (bid input area).
- **Interactive Layer:** `surface-container-high` (#201f1f) - Hover states, nested cards, buttons.
- **Highest Layer:** `surface-container-highest` (#262626) - Active sub-elements within cards.
- **Highlight Layer:** `surface-bright` (#2c2c2c) - Active nav elements.

### Full Color Token System

**Primary (Green - Money/Value):**
- `primary`: #9cff93
- `primary-dim`: #00ec3b
- `primary-container`: #00fc40
- `on-primary-fixed`: #00440a

**Secondary (Cyan - Time/Urgency):**
- `secondary`: #00cffc
- `secondary-dim`: #00c0ea
- `secondary-container`: #00677f

**Tertiary (Purple - Accent):**
- `tertiary`: #ac89ff
- `tertiary-dim`: #874cff
- `tertiary-container`: #7000ff

**Error (Orange-Red - Destructive):**
- `error`: #ff7351
- `error-dim`: #d53d18
- `error-container`: #b92902

**Neutral:**
- `on-surface`: #ffffff (text only - never for backgrounds)
- `on-surface-variant`: #adaaaa (secondary text, labels)
- `outline`: #777575
- `outline-variant`: #494847 (ghost borders at 20% opacity)

### The "Glass & Gradient" Rule

Glassmorphism is reserved for floating elements only (badges, modals, tooltips).

- **Glass Panel class:** `.glass-panel` - `background: rgba(38, 38, 38, 0.4); backdrop-filter: blur(20px);`
- **Signature CTA Gradient:** `bg-gradient-to-r from-primary to-primary-container` for primary action buttons.

---

## 4. Typography

We utilize a dual-font strategy to bridge the gap between technical "pixel" roots and modern readability.

- **Display & Headlines (`Space Grotesk` - `font-headline`):** This is our "Technical" voice. It feels engineered and precise. Used for auction titles, bid amounts, timer digits, labels, and buttons.
- **Body & Titles (`Manrope` - `font-body`):** This is our "Trustworthy" voice. Used for body text, descriptions, and nav labels. Set as the default body font.
- **Visual Hierarchy for Numbers:** Timers and Bids are the heartbeat of the app. Use `text-2xl font-headline font-bold` with `text-primary` for bids and `text-secondary` for timers.

### Label Pattern

Section labels use: `text-[10px] font-headline font-medium uppercase tracking-widest text-on-surface-variant`

---

## 5. Elevation & Depth

Depth is achieved through **Tonal Layering**, not structural lines.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that mimics high-end editorial paper stacking.
- **Ambient Shadows:** For floating Modals, use an extra-diffused shadow: `box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5)`. The shadow must feel like an ambient occlusion rather than a hard drop shadow.
- **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., an input field), use the `outline-variant` token at **20% opacity**. Never use 100% opaque borders.
- **Glassmorphism for Badges:** Use `.glass-panel` with `rounded-full` for "Status Badges" (e.g., "Live Now") to create an integrated, high-tech glow.

---

## 6. Icons

**Icon library: Tabler Icons** (`@tabler/icons-react`)

Used icons:
- `IconLayoutGrid` - Header brand mark
- `IconGavel` - Auction nav tab
- `IconPhoto` - Gallery nav tab
- `IconBuildingBank` - DAO nav tab
- `IconUser` - Profile nav tab, bid history avatars
- `IconCopy` / `IconCheck` - Wallet modal copy address
- `IconLogout` - Wallet modal disconnect
- `IconX` - Modal close

Default size: 24px for nav, 16px for inline elements.

---

## 7. Components

### NFT Display

Full-width `aspect-square rounded-xl overflow-hidden bg-surface-container-low`. Contains:
- Image with `.pixel-mask` (pixelated rendering)
- "Live Now" badge: `.glass-panel` overlay, top-left, green pulse dot + uppercase label
- Bottom metadata overlay: `bg-gradient-to-t from-black/80 to-transparent`, shows collection ID + title

### Bid Status

`grid grid-cols-2 gap-4` with two `bg-surface-container-low p-5 rounded-xl` cards:
- **Left (Current Bid):** Value in `text-primary text-2xl font-headline font-bold` + "ETH" in `text-primary-dim`
- **Right (Ending In):** Timer in `text-secondary text-2xl font-headline font-bold` + H/M/S sub-labels

### Bid Input

`bg-surface-container p-6 rounded-xl space-y-6` containing:
- Label: uppercase tracking-widest pattern
- Input: `bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-xl font-headline font-bold` with absolute "ETH" label
- CTA Button: `bg-gradient-to-r from-primary to-primary-container rounded-xl text-on-primary-fixed font-headline font-extrabold`
- Helper text: centered `text-[11px] text-on-surface-variant`
- Error state: `text-error`

### Bid History

- Header: "BID HISTORY" (uppercase tracking-widest) + "X Bids" in `text-primary`
- Rows in `space-y-px rounded-xl overflow-hidden`: `bg-surface-container-low` with opacity fade (100%/60%/40%)
- Avatar: `w-8 h-8 rounded-full bg-surface-container-high` with `IconUser`
- First row shows "Winning" tag in `text-primary-dim`
- "View all activity" button: uppercase, `text-on-surface-variant hover:text-white`

### Connect Button

- **Disconnected:** `bg-surface-container-high px-4 py-2 rounded-xl text-sm font-headline font-bold text-primary`
- **Connected:** gradient avatar (5x5) + truncated address. Clicking opens the WalletModal.

### Wallet Modal

Dropdown-style panel anchored top-right below header. `bg-surface-container-high rounded-xl` with ambient shadow. Contains:
- "Connected" header + close button (`bg-surface-container-highest`)
- Large gradient avatar (64px) with subtle green glow
- Address with copy-to-clipboard (icon feedback: copy -> check)
- ENS name display when available
- Balance card: `bg-surface-container rounded-xl`
- Disconnect button: `bg-surface-container text-error` - destructive action is clearly colored

Modal behavior: closes on Escape, click outside, or X button. Backdrop: `bg-black/60 backdrop-blur-sm`.

### Buttons

- **Primary (Bidding/Action):** Gradient from `primary` to `primary-container`. `rounded-xl`. Text in `on-primary-fixed`.
- **Secondary (View/Secondary Action):** `surface-container-highest` background with `on-surface` text. No border.
- **Tertiary:** Text-only using `primary` color with uppercase tracking.
- **Destructive:** `surface-container` background with `text-error`.

### Bidding Inputs

- **Styling:** Large `text-xl font-headline font-bold` for the amount. Use `surface-container-lowest` for the field background to create a "sunken" feel relative to the card.
- **Error State:** Use `error` (#ff7351) text and a `2px` "Ghost Border" using `error_dim` at 30% opacity.

### Auction Timers

- **Logic:** Use `secondary` (#00cffc) for active countdowns to distinguish time from money (`primary`). Pair `text-2xl font-headline font-bold` for the digits with `text-[8px] uppercase` for the units (H/M/S).

---

## 8. Utility Classes

### .glass-panel
```css
background: rgba(38, 38, 38, 0.4);
backdrop-filter: blur(20px);
```
Used for: floating badges ("Live Now"), modal overlays.

### .pixel-mask
```css
image-rendering: pixelated;
```
Used for: NFT images to preserve pixel art aesthetic.

---

## 9. Do's and Don'ts

### Do

- **Use White Space as a Tool:** Use the `space-y-8` (2rem) between major content sections to allow the "on-chain" assets to breathe.
- **Layer Surfaces:** Always place lighter surfaces on darker surfaces to move "towards" the user.
- **Pair Pixel/Sans Fonts:** Use `Space Grotesk` for anything that feels like "Data" and `Manrope` for anything that feels like "Information."
- **Color-code semantics:** Green (`primary`) for money/value, Cyan (`secondary`) for time, Orange-red (`error`) for destructive actions.

### Don't

- **No 1px Lines:** Do not use lines to separate list items. Use a `px` background shift or white space.
- **No High-Opacity Shadows:** Avoid the "floating on a cloud" look. We want "stacked on a desk."
- **No Pure White:** Never use `#ffffff` for backgrounds. Use `on-surface` only for text to prevent eye strain against the deep charcoal.
- **No Default Corners:** Avoid `none` or `full` rounding for cards; stay strictly within `rounded-xl` (0.75rem) to maintain the "technical but approachable" vibe. Exception: badges and avatars use `rounded-full`.
- **No Glassmorphism for sections:** Glass effects are reserved for floating elements only (badges, modals). Section containers use solid tonal surfaces.
