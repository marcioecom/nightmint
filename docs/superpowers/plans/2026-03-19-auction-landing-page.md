# Auction Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the NightMint auction landing page with liquid glass morphism aesthetic, two-panel layout (NFT left, auction info + bid right), using mock data.

**Architecture:** Next.js App Router with Tailwind CSS for styling. Components are split by responsibility: background layer, navbar, NFT display, and auction panel (which contains bid status, bid input, bid history, and navigation). Mock data drives everything initially - no contract integration yet.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 4, TypeScript, lucide-react, Poppins + Source Serif 4 (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-03-19-auction-landing-page-design.md`

---

## File Structure

```
nightmint/
  package.json
  tsconfig.json
  next.config.ts
  postcss.config.ts
  public/
  src/
    app/
      layout.tsx            -- HTML shell, fonts, global CSS import
      page.tsx              -- Main auction page, two-panel layout
      globals.css           -- Tailwind directives, liquid glass @layer
    lib/
      mock-data.ts          -- Auction, bid, NFT mock data + types
      utils.ts              -- Address truncation, avatar gradient, countdown formatting
    components/
      VideoBackground.tsx   -- Full-screen video/gradient + dark overlay
      Navbar.tsx            -- Logo + Connect Wallet pill
      NFTDisplay.tsx        -- Left panel: NFT in glass container
      AuctionPanel.tsx      -- Right panel wrapper
      AuctionNav.tsx        -- Arrow nav + date label
      BidStatus.tsx         -- Current bid + countdown timer
      BidInput.tsx          -- Input + Bid button with states
      BidHistory.tsx        -- Bid list + "View all bids"
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/marciojunior/code/marcioecom/nightmint
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --skip-install
```

Expected: Project files created in current directory.

- [ ] **Step 2: Install dependencies**

Run:
```bash
pnpm install
pnpm add lucide-react
```

Expected: `node_modules` created, `pnpm-lock.yaml` generated.

- [ ] **Step 3: Verify dev server starts**

Run:
```bash
pnpm dev
```

Expected: Server starts at `http://localhost:3000`, no errors.

- [ ] **Step 4: Commit**

```bash
git init
echo "node_modules/\n.next/\n.superpowers/" > .gitignore
git add .
git commit -m "chore: scaffold Next.js project with Tailwind and lucide-react"
```

---

### Task 2: Global CSS + Liquid Glass + Fonts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Delete: `tailwind.config.ts` (if scaffolder created one - Tailwind v4 uses CSS-first config via `@theme`)

- [ ] **Step 1: Delete tailwind.config.ts if it exists**

Run:
```bash
rm -f tailwind.config.ts tailwind.config.js
```

Tailwind CSS v4 uses `@theme` in CSS for configuration. No JS config file needed.

- [ ] **Step 2: Write globals.css with liquid glass layer**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --font-display: var(--font-poppins), sans-serif;
  --font-serif: var(--font-source-serif), serif;
  --radius: 1rem;
}

@layer components {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.01);
    background-blend-mode: luminosity;
    backdrop-filter: blur(4px);
    border: none;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .liquid-glass::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.4px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.45) 0%,
      rgba(255, 255, 255, 0.15) 20%,
      transparent 40%,
      transparent 60%,
      rgba(255, 255, 255, 0.15) 80%,
      rgba(255, 255, 255, 0.45) 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .liquid-glass-strong {
    background: rgba(255, 255, 255, 0.01);
    background-blend-mode: luminosity;
    backdrop-filter: blur(50px);
    border: none;
    box-shadow:
      4px 4px 4px rgba(0, 0, 0, 0.05),
      inset 0 1px 1px rgba(255, 255, 255, 0.15);
    position: relative;
    overflow: hidden;
  }

  .liquid-glass-strong::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.4px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.2) 20%,
      transparent 40%,
      transparent 60%,
      rgba(255, 255, 255, 0.2) 80%,
      rgba(255, 255, 255, 0.5) 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @supports not (backdrop-filter: blur(1px)) {
    .liquid-glass,
    .liquid-glass-strong {
      background: rgba(0, 0, 0, 0.6);
    }
  }
}
```

- [ ] **Step 3: Configure layout.tsx with Google Fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Poppins, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "NightMint - Daily NFT Auction",
  description: "One NFT minted every 24 hours, auctioned automatically, proceeds to DAO treasury.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${sourceSerif.variable}`}>
      <body className="font-display bg-black text-white antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify fonts and glass classes load**

Run: `pnpm dev`, open browser, inspect that Poppins loads and `.liquid-glass` class is available in devtools.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add liquid glass CSS, Poppins + Source Serif fonts"
```

---

### Task 3: Mock Data + Utility Functions

**Files:**
- Create: `src/lib/mock-data.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create types and mock data**

Create `src/lib/mock-data.ts`:

```ts
export interface Bid {
  bidder: string;
  amount: string;
  timestamp: number;
}

export type AuctionStatus = "active" | "ended-unsettled" | "settling" | "settled" | "no-auction";

export interface Auction {
  nounId: number;
  currentBid: string;
  endTime: number;
  highestBidder: string;
  status: AuctionStatus;
  winner: string | null;
  bids: Bid[];
}

const now = Date.now();
const twentyFourHours = 24 * 60 * 60 * 1000;

export const MOCK_AUCTIONS: Auction[] = [
  {
    nounId: 42,
    currentBid: "0.42",
    endTime: now + twentyFourHours,
    highestBidder: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    status: "active",
    winner: null,
    bids: [
      { bidder: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", amount: "0.42", timestamp: now - 2 * 60 * 1000 },
      { bidder: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d", amount: "0.38", timestamp: now - 15 * 60 * 1000 },
      { bidder: "0x9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d5e6f7a8b", amount: "0.35", timestamp: now - 60 * 60 * 1000 },
      { bidder: "0x3a4b5c6d7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f", amount: "0.30", timestamp: now - 3 * 60 * 60 * 1000 },
      { bidder: "0x7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d", amount: "0.25", timestamp: now - 5 * 60 * 60 * 1000 },
    ],
  },
  {
    nounId: 41,
    currentBid: "0.55",
    endTime: now - 1000,
    highestBidder: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d",
    status: "settled",
    winner: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d",
    bids: [
      { bidder: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d", amount: "0.55", timestamp: now - twentyFourHours - 30 * 60 * 1000 },
      { bidder: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", amount: "0.50", timestamp: now - twentyFourHours - 2 * 60 * 60 * 1000 },
    ],
  },
];
```

- [ ] **Step 2: Create utility functions**

Create `src/lib/utils.ts`:

```ts
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function addressToGradient(address: string): string {
  const hash = address.toLowerCase().replace("0x", "");
  const h1 = parseInt(hash.slice(0, 2), 16) * 1.41;
  const h2 = parseInt(hash.slice(2, 4), 16) * 1.41;
  return `linear-gradient(135deg, hsl(${h1}, 60%, 45%), hsl(${h2}, 60%, 45%))`;
}

export function formatCountdown(endTime: number): string {
  const diff = endTime - Date.now();
  if (diff <= 0) return "";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/mock-data.ts src/lib/utils.ts
git commit -m "feat: add mock auction data, types, and utility functions"
```

---

### Task 4: VideoBackground + Navbar Components

**Files:**
- Create: `src/components/VideoBackground.tsx`
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Create VideoBackground**

Create `src/components/VideoBackground.tsx`:

```tsx
export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Gradient placeholder until video is sourced */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0a0a12, #0d0d18, #080812)",
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
```

- [ ] **Step 2: Create Navbar**

Create `src/components/Navbar.tsx`:

```tsx
export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-white" />
        <span className="text-xl font-semibold tracking-tight text-white">
          nightmint
        </span>
      </div>
      <button className="liquid-glass rounded-full px-5 py-2 text-sm text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
        Connect Wallet
      </button>
    </nav>
  );
}
```

- [ ] **Step 3: Wire into page.tsx to verify**

Replace `src/app/page.tsx`:

```tsx
import { VideoBackground } from "@/components/VideoBackground";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="px-6 py-12 text-white/60">
          Auction content goes here
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify in browser**

Run: `pnpm dev`, check that dark gradient background shows, navbar has glass effect, "Connect Wallet" pill renders with the gradient border.

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoBackground.tsx src/components/Navbar.tsx src/app/page.tsx
git commit -m "feat: add VideoBackground and Navbar components"
```

---

### Task 5: NFTDisplay (Left Panel)

**Files:**
- Create: `src/components/NFTDisplay.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create NFTDisplay component**

Create `src/components/NFTDisplay.tsx`:

```tsx
export function NFTDisplay() {
  return (
    <div className="flex w-full max-h-[50vh] items-center justify-center lg:max-h-none lg:w-[48%]">
      <div className="liquid-glass aspect-square w-full max-w-md rounded-3xl p-6 lg:max-w-none">
        {/* Placeholder NFT - will be replaced with on-chain SVG */}
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#12122a] via-[#1a1a35] to-[#151530]">
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl text-[#2a2a50]">&#9632;</div>
            <span className="text-xs tracking-widest text-[#3a3a5a]">
              ON-CHAIN SVG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to page layout as left panel**

Replace `src/app/page.tsx`:

```tsx
import { VideoBackground } from "@/components/VideoBackground";
import { Navbar } from "@/components/Navbar";
import { NFTDisplay } from "@/components/NFTDisplay";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col gap-8 px-6 pb-6 lg:flex-row lg:gap-0">
          <NFTDisplay />
          <div className="flex-1 text-white/60">
            Auction panel goes here
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Check: NFT placeholder visible in glass container on left, responsive - stacks on narrow viewport.

- [ ] **Step 4: Commit**

```bash
git add src/components/NFTDisplay.tsx src/app/page.tsx
git commit -m "feat: add NFTDisplay component with glass container"
```

---

### Task 6: AuctionNav + BidStatus Components

**Files:**
- Create: `src/components/AuctionNav.tsx`
- Create: `src/components/BidStatus.tsx`

- [ ] **Step 1: Create AuctionNav**

Create `src/components/AuctionNav.tsx`:

```tsx
import { ArrowLeft, ArrowRight } from "lucide-react";

interface AuctionNavProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function AuctionNav({ date, onPrev, onNext, hasPrev, hasNext }: AuctionNavProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className="text-white/40 transition-colors hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="text-white/40 transition-colors hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
      <span className="text-sm text-white/50">{date}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create BidStatus**

Create `src/components/BidStatus.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/utils";
import type { AuctionStatus } from "@/lib/mock-data";

interface BidStatusProps {
  currentBid: string;
  endTime: number;
  status: AuctionStatus;
}

export function BidStatus({ currentBid, endTime, status }: BidStatusProps) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(endTime));

  useEffect(() => {
    if (status !== "active") return;

    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, status]);

  const timerDisplay = (() => {
    switch (status) {
      case "active": return timeLeft || "Auction ended";
      case "ended-unsettled": return "Auction ended";
      case "settling": return "Settling...";
      case "settled": return "Auction ended";
      case "no-auction": return "Starting soon...";
    }
  })();

  return (
    <div className="flex gap-8 border-b border-white/[0.06] pb-4">
      <div>
        <div className="mb-1 text-xs uppercase tracking-widest text-white/50">
          Current bid
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg text-white/60">{"\u039E"}</span>
          <span className="text-2xl font-semibold text-white">{currentBid}</span>
        </div>
      </div>
      <div className="border-l border-white/[0.08] pl-8">
        <div className="mb-1 text-xs uppercase tracking-widest text-white/50">
          Auction ends in
        </div>
        <div className="text-2xl font-semibold text-white">{timerDisplay}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AuctionNav.tsx src/components/BidStatus.tsx
git commit -m "feat: add AuctionNav and BidStatus components with countdown timer"
```

---

### Task 7: BidInput + BidHistory Components

**Files:**
- Create: `src/components/BidInput.tsx`
- Create: `src/components/BidHistory.tsx`

- [ ] **Step 1: Create BidInput**

Create `src/components/BidInput.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { AuctionStatus } from "@/lib/mock-data";

interface BidInputProps {
  minBid: string;
  status: AuctionStatus;
}

export function BidInput({ minBid, status }: BidInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleBid() {
    setError("");
    const numValue = parseFloat(value);
    const numMin = parseFloat(minBid);

    if (isNaN(numValue) || numValue < numMin) {
      setError(`Minimum bid is \u039E ${minBid}`);
      return;
    }

    // Mock: just clear input on "success"
    setValue("");
  }

  const isInputDisabled = status !== "active";
  const isButtonDisabled = status === "settling" || status === "no-auction" || status === "settled";
  const buttonText = (() => {
    switch (status) {
      case "active": return "Bid";
      case "ended-unsettled": return "Settle Auction";
      case "settling": return "Settling...";
      case "settled": return "Settled";
      case "no-auction": return "No Auction";
    }
  })();

  return (
    <div>
      <div className="flex gap-2">
        <div className="liquid-glass flex-1 rounded-xl">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isInputDisabled}
            placeholder={`\u039E ${minBid} or more`}
            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleBid}
          disabled={isButtonDisabled}
          className="liquid-glass-strong rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {buttonText}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400/80">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create BidHistory**

Create `src/components/BidHistory.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { truncateAddress, addressToGradient } from "@/lib/utils";
import type { Bid } from "@/lib/mock-data";

interface BidHistoryProps {
  bids: Bid[];
}

const INITIAL_VISIBLE = 3;

export function BidHistory({ bids }: BidHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleBids = showAll ? bids : bids.slice(0, INITIAL_VISIBLE);

  if (bids.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-white/40">No bids yet</p>
    );
  }

  return (
    <div>
      {visibleBids.map((bid, i) => (
        <div
          key={`${bid.bidder}-${bid.timestamp}`}
          className="flex items-center justify-between border-b border-white/[0.04] py-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ background: addressToGradient(bid.bidder) }}
            />
            <span className="text-sm text-white/80">
              {truncateAddress(bid.bidder)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white">
              {"\u039E"} {bid.amount}
            </span>
            <a
              href={`https://sepolia.etherscan.io/address/${bid.bidder}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-white/80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
      {!showAll && bids.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full text-center text-xs text-white/40 transition-colors hover:text-white/60"
        >
          View all bids
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BidInput.tsx src/components/BidHistory.tsx
git commit -m "feat: add BidInput and BidHistory components"
```

---

### Task 8: AuctionPanel + Full Page Assembly

**Files:**
- Create: `src/components/AuctionPanel.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create AuctionPanel**

Create `src/components/AuctionPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { AuctionNav } from "./AuctionNav";
import { BidStatus } from "./BidStatus";
import { BidInput } from "./BidInput";
import { BidHistory } from "./BidHistory";
import { MOCK_AUCTIONS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export function AuctionPanel() {
  const [auctionIndex, setAuctionIndex] = useState(0);
  const auction = MOCK_AUCTIONS[auctionIndex];

  const minBid = (parseFloat(auction.currentBid) * 1.05).toFixed(2);

  return (
    <div className="flex w-full flex-col gap-6 lg:w-[52%] lg:pl-10 lg:pt-4">
      <AuctionNav
        date={formatDate(auction.endTime)}
        onPrev={() => setAuctionIndex((i) => Math.min(i + 1, MOCK_AUCTIONS.length - 1))}
        onNext={() => setAuctionIndex((i) => Math.max(i - 1, 0))}
        hasPrev={auctionIndex < MOCK_AUCTIONS.length - 1}
        hasNext={auctionIndex > 0}
      />

      <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
        Mint #{auction.nounId}
      </h1>

      <BidStatus
        currentBid={auction.currentBid}
        endTime={auction.endTime}
        status={auction.status}
      />

      <BidInput minBid={minBid} status={auction.status} />

      <BidHistory bids={auction.bids} />
    </div>
  );
}
```

- [ ] **Step 2: Assemble final page.tsx**

Replace `src/app/page.tsx`:

```tsx
import { VideoBackground } from "@/components/VideoBackground";
import { Navbar } from "@/components/Navbar";
import { NFTDisplay } from "@/components/NFTDisplay";
import { AuctionPanel } from "@/components/AuctionPanel";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col gap-8 px-6 pb-6 lg:flex-row lg:items-center lg:gap-0">
          <NFTDisplay />
          <AuctionPanel />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify full page in browser**

Run: `pnpm dev`, check:
- Two-panel layout on desktop
- NFT in glass container on left
- Auction info, bid input, bid history on right
- Timer counts down
- Navigation arrows switch between auctions
- "View all bids" expands list
- Bid validation shows error for low amounts
- Responsive: stacks on mobile viewport

- [ ] **Step 4: Commit**

```bash
git add src/components/AuctionPanel.tsx src/app/page.tsx
git commit -m "feat: assemble full auction landing page with two-panel layout"
```

---

### Task 9: Polish + Final Review

**Files:**
- Potentially modify any component for spacing/style tweaks

- [ ] **Step 1: Cross-check against design spec**

Open `docs/superpowers/specs/2026-03-19-auction-landing-page-design.md` and verify each section:
- Background layer with dark overlay: check
- Navbar sticky z-20 with glass pill: check
- Left panel 48% with glass NFT container: check
- Right panel 52% with all sections: check
- Liquid glass on correct elements: check
- Typography (Poppins body, weight hierarchy): check
- Grayscale only (except avatars): check
- Interactive states (hover, focus-visible, disabled): check
- Mobile stack behavior: check

- [ ] **Step 2: Fix any discrepancies found**

Adjust spacing, sizing, or styles as needed.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "style: polish auction page spacing and alignment against design spec"
```
