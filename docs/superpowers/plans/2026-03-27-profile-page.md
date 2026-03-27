# Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a profile page showing a user's owned NFTs, stats, and activity feed - accessible as own profile (`/profile`) or public profile (`/profile/[address]`).

**Architecture:** Client-side SPA page using React Query for data fetching from existing indexer API endpoints. Reuses GalleryCard/GalleryDetailModal for NFT display. New composite hook `useProfileData` merges bids and wins into stats + activity feed.

**Tech Stack:** Next.js 16 (App Router), React 19, wagmi 3, React Query 5, Tailwind CSS 4, @tabler/icons-react

---

## File Structure

**New files:**
- `packages/web/src/app/profile/[[...address]]/page.tsx` - route entry point
- `packages/web/src/lib/hooks/useProfileData.ts` - composite data hook (bids + wins + stats + activity)
- `packages/web/src/components/ProfilePanel.tsx` - main orchestrator component
- `packages/web/src/components/ProfileHeader.tsx` - avatar, address, "you" badge
- `packages/web/src/components/ProfileStats.tsx` - 2-column stats grid
- `packages/web/src/components/ProfileNftGrid.tsx` - owned NFTs grid
- `packages/web/src/components/ProfileActivityFeed.tsx` - unified timeline
- `packages/web/src/components/ConnectWalletPrompt.tsx` - connect CTA for unauthenticated `/profile`

**Modified files:**
- `packages/web/src/components/BottomNav.tsx` - update Profile href, add "coming soon" to DAO tab
- `packages/web/src/lib/utils.ts` - add `formatTimeAgo` helper

---

### Task 1: Add `formatTimeAgo` utility

**Files:**
- Modify: `packages/web/src/lib/utils.ts`

- [ ] **Step 1: Add `formatTimeAgo` function to utils.ts**

Add this after the existing `formatDate` function:

```typescript
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/lib/utils.ts
git commit -m "feat(web): add formatTimeAgo utility"
```

---

### Task 2: Create `useProfileData` hook

**Files:**
- Create: `packages/web/src/lib/hooks/useProfileData.ts`

- [ ] **Step 1: Create the hook file**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";

const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:42069";

export interface ProfileBid {
  tokenId: number;
  amount: string;
  timestamp: number;
  txHash: string;
}

export interface ProfileWin {
  tokenId: number;
  winningBid: string;
  endTime: number;
}

export type ActivityType = "won" | "bid" | "outbid";

export interface ActivityItem {
  type: ActivityType;
  tokenId: number;
  amount: string;
  timestamp: number;
}

interface ProfileStats {
  nftCount: number;
  totalSpent: string;
}

async function fetchProfileBids(address: string): Promise<ProfileBid[]> {
  const res = await fetch(`${INDEXER_URL}/api/profile/${address}/bids`);
  if (!res.ok) throw new Error(`Indexer responded with ${res.status}`);
  const data = await res.json();
  return data.map((b: Record<string, string>) => ({
    tokenId: Number(b.tokenId),
    amount: formatEther(BigInt(b.amount)),
    timestamp: Number(b.timestamp) * 1000,
    txHash: b.txHash,
  }));
}

async function fetchProfileWins(address: string): Promise<ProfileWin[]> {
  const res = await fetch(`${INDEXER_URL}/api/profile/${address}/wins`);
  if (!res.ok) throw new Error(`Indexer responded with ${res.status}`);
  const data = await res.json();
  return data.map((a: Record<string, string>) => ({
    tokenId: Number(a.tokenId),
    winningBid: formatEther(BigInt(a.winningBid ?? "0")),
    endTime: Number(a.endTime) * 1000,
  }));
}

function buildActivityFeed(bids: ProfileBid[], wins: ProfileWin[]): ActivityItem[] {
  const wonTokenIds = new Set(wins.map((w) => w.tokenId));

  const winItems: ActivityItem[] = wins.map((w) => ({
    type: "won" as const,
    tokenId: w.tokenId,
    amount: w.winningBid,
    timestamp: w.endTime,
  }));

  // Group bids by tokenId, keep only the highest bid per auction
  const bestBidByAuction = new Map<number, ProfileBid>();
  for (const bid of bids) {
    const existing = bestBidByAuction.get(bid.tokenId);
    if (!existing || parseFloat(bid.amount) > parseFloat(existing.amount)) {
      bestBidByAuction.set(bid.tokenId, bid);
    }
  }

  const bidItems: ActivityItem[] = [];
  for (const [tokenId, bid] of bestBidByAuction) {
    if (wonTokenIds.has(tokenId)) continue; // skip bids on won auctions (already shown as "won")
    bidItems.push({
      type: "outbid" as const, // if they didn't win, they were outbid
      tokenId,
      amount: bid.amount,
      timestamp: bid.timestamp,
    });
  }

  return [...winItems, ...bidItems].sort((a, b) => b.timestamp - a.timestamp);
}

function computeStats(wins: ProfileWin[]): ProfileStats {
  const nftCount = wins.length;
  const totalSpentWei = wins.reduce((sum, w) => {
    const wei = BigInt(Math.round(parseFloat(w.winningBid) * 1e18));
    return sum + wei;
  }, 0n);
  return {
    nftCount,
    totalSpent: formatEther(totalSpentWei),
  };
}

export function useProfileData(address: string | undefined) {
  const {
    data: bids,
    isLoading: bidsLoading,
    error: bidsError,
  } = useQuery({
    queryKey: ["profile-bids", address],
    queryFn: () => fetchProfileBids(address!),
    enabled: !!address,
    staleTime: 30_000,
  });

  const {
    data: wins,
    isLoading: winsLoading,
    error: winsError,
  } = useQuery({
    queryKey: ["profile-wins", address],
    queryFn: () => fetchProfileWins(address!),
    enabled: !!address,
    staleTime: 60_000,
  });

  const isLoading = bidsLoading || winsLoading;
  const error = bidsError || winsError;

  const activity = bids && wins ? buildActivityFeed(bids, wins) : [];
  const stats = wins ? computeStats(wins) : { nftCount: 0, totalSpent: "0" };

  return {
    wins: wins ?? [],
    activity,
    stats,
    isLoading,
    error,
  };
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/lib/hooks/useProfileData.ts
git commit -m "feat(web): add useProfileData composite hook"
```

---

### Task 3: Create `ConnectWalletPrompt` component

**Files:**
- Create: `packages/web/src/components/ConnectWalletPrompt.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useConnect } from "wagmi";
import { IconWallet } from "@tabler/icons-react";

export function ConnectWalletPrompt() {
  const { connect, connectors } = useConnect();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="rounded-full bg-surface-container-low p-6">
        <IconWallet size={48} className="text-on-surface-variant" />
      </div>
      <div>
        <h2 className="mb-2 font-headline text-xl font-bold tracking-tight">
          Connect your wallet
        </h2>
        <p className="font-body text-sm text-on-surface-variant">
          Connect a wallet to view your profile, NFTs, and bidding history.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          const connector = connectors[0];
          if (connector) connect({ connector });
        }}
        className="rounded-xl bg-primary px-8 py-3 font-headline text-sm font-bold text-on-primary transition-all duration-200 hover:opacity-90 active:scale-95"
      >
        Connect Wallet
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ConnectWalletPrompt.tsx
git commit -m "feat(web): add ConnectWalletPrompt component"
```

---

### Task 4: Create `ProfileHeader` component

**Files:**
- Create: `packages/web/src/components/ProfileHeader.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { truncateAddress, addressToGradient } from "@/lib/utils";

interface ProfileHeaderProps {
  address: string;
  isOwnProfile: boolean;
}

export function ProfileHeader({ address, isOwnProfile }: ProfileHeaderProps) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
  });

  return (
    <section className="mb-10 mt-8 text-center">
      <div className="relative mb-4 inline-block">
        <div
          className="h-24 w-24 rounded-full p-[3px]"
          style={{ background: addressToGradient(address) }}
        >
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-surface-container-lowest"
          >
            <div
              className="h-full w-full rounded-full opacity-60"
              style={{ background: addressToGradient(address) }}
            />
          </div>
        </div>
      </div>
      <h2 className="mb-1 font-headline text-2xl font-bold tracking-tight">
        {ensName ?? truncateAddress(address)}
      </h2>
      {isOwnProfile && (
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-headline text-xs font-bold text-primary">
          You
        </span>
      )}
      {!isOwnProfile && ensName && (
        <p className="text-sm text-on-surface-variant">
          {truncateAddress(address)}
        </p>
      )}
    </section>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <section className="mb-10 mt-8 text-center">
      <div className="mb-4 inline-block">
        <div className="h-24 w-24 animate-pulse rounded-full bg-surface-container" />
      </div>
      <div className="mx-auto h-7 w-40 animate-pulse rounded bg-surface-container" />
    </section>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ProfileHeader.tsx
git commit -m "feat(web): add ProfileHeader component"
```

---

### Task 5: Create `ProfileStats` component

**Files:**
- Create: `packages/web/src/components/ProfileStats.tsx`

- [ ] **Step 1: Create the component**

```tsx
interface ProfileStatsProps {
  nftCount: number;
  totalSpent: string;
}

export function ProfileStats({ nftCount, totalSpent }: ProfileStatsProps) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-4">
      <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-5">
        <span className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          NFTs Owned
        </span>
        <span className="font-headline text-3xl font-bold text-primary">
          {nftCount}
        </span>
      </div>
      <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-5">
        <span className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Total Spent
        </span>
        <div>
          <span className="font-headline text-3xl font-bold text-secondary">
            {parseFloat(totalSpent).toFixed(2)}
          </span>
          <span className="ml-1 font-headline text-lg font-bold text-secondary">
            ETH
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="mb-10 grid grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-surface-container-low p-5">
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-surface-container" />
          <div className="h-9 w-16 animate-pulse rounded bg-surface-container" />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ProfileStats.tsx
git commit -m "feat(web): add ProfileStats component"
```

---

### Task 6: Create `ProfileNftGrid` component

**Files:**
- Create: `packages/web/src/components/ProfileNftGrid.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import { GalleryCard } from "./GalleryCard";
import { GalleryDetailModal } from "./GalleryDetailModal";
import type { ProfileWin } from "@/lib/hooks/useProfileData";
import type { SettledAuction } from "@/lib/hooks/useSettledAuctions";

interface ProfileNftGridProps {
  wins: ProfileWin[];
}

export function ProfileNftGrid({ wins }: ProfileNftGridProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const selectedAuction: SettledAuction | null = selectedTokenId !== null
    ? (() => {
        const win = wins.find((w) => w.tokenId === selectedTokenId);
        if (!win) return null;
        return {
          tokenId: win.tokenId,
          winner: "",
          winningBid: win.winningBid,
          bidCount: 0,
          endTime: win.endTime,
        };
      })()
    : null;

  return (
    <section className="mb-10">
      <h3 className="mb-6 font-headline text-xl font-bold tracking-tight">
        Owned NFTs
      </h3>
      {wins.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-on-surface-variant">
          No NFTs yet
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {wins.map((win) => (
            <GalleryCard
              key={win.tokenId}
              tokenId={win.tokenId}
              winningBid={win.winningBid}
              onClick={() => setSelectedTokenId(win.tokenId)}
            />
          ))}
        </div>
      )}
      {selectedAuction && (
        <GalleryDetailModal
          auction={selectedAuction}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </section>
  );
}

export function ProfileNftGridSkeleton() {
  return (
    <section className="mb-10">
      <div className="mb-6 h-7 w-32 animate-pulse rounded bg-surface-container" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-surface-container-low">
            <div className="aspect-square animate-pulse bg-surface-container" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-surface-container" />
              <div className="h-5 w-20 animate-pulse rounded bg-surface-container" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ProfileNftGrid.tsx
git commit -m "feat(web): add ProfileNftGrid component"
```

---

### Task 7: Create `ProfileActivityFeed` component

**Files:**
- Create: `packages/web/src/components/ProfileActivityFeed.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { IconTrophy, IconGavel, IconCircleX } from "@tabler/icons-react";
import { GalleryNftImage } from "./GalleryNftImage";
import { formatTimeAgo } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/lib/hooks/useProfileData";

const activityConfig: Record<ActivityType, { icon: typeof IconTrophy; colorClass: string; label: string }> = {
  won: { icon: IconTrophy, colorClass: "text-primary", label: "Won" },
  bid: { icon: IconGavel, colorClass: "text-secondary", label: "Bid" },
  outbid: { icon: IconCircleX, colorClass: "text-error", label: "Outbid" },
};

interface ProfileActivityFeedProps {
  activity: ActivityItem[];
}

export function ProfileActivityFeed({ activity }: ProfileActivityFeedProps) {
  return (
    <section className="mb-10">
      <h3 className="mb-6 font-headline text-xl font-bold tracking-tight">
        Activity
      </h3>
      {activity.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-on-surface-variant">
          No activity yet
        </p>
      ) : (
        <div className="space-y-3">
          {activity.map((item) => {
            const config = activityConfig[item.type];
            const Icon = config.icon;
            return (
              <div
                key={`${item.type}-${item.tokenId}-${item.timestamp}`}
                className="flex items-center justify-between rounded-xl bg-surface-container p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
                    <Icon size={20} className={config.colorClass} />
                  </div>
                  <div>
                    <p className="font-headline text-sm font-bold">
                      NightMint #{item.tokenId}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {config.label} - {formatTimeAgo(item.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-headline text-sm font-bold ${config.colorClass}`}>
                    {parseFloat(item.amount).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ProfileActivityFeedSkeleton() {
  return (
    <section className="mb-10">
      <div className="mb-6 h-7 w-24 animate-pulse rounded bg-surface-container" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-surface-container p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-container-highest" />
              <div className="space-y-1">
                <div className="h-4 w-28 animate-pulse rounded bg-surface-container-high" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-container-high" />
              </div>
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-surface-container-high" />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ProfileActivityFeed.tsx
git commit -m "feat(web): add ProfileActivityFeed component"
```

---

### Task 8: Create `ProfilePanel` orchestrator component

**Files:**
- Create: `packages/web/src/components/ProfilePanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileData } from "@/lib/hooks/useProfileData";
import { ConnectWalletPrompt } from "./ConnectWalletPrompt";
import { ProfileHeader, ProfileHeaderSkeleton } from "./ProfileHeader";
import { ProfileStats, ProfileStatsSkeleton } from "./ProfileStats";
import { ProfileNftGrid, ProfileNftGridSkeleton } from "./ProfileNftGrid";
import { ProfileActivityFeed, ProfileActivityFeedSkeleton } from "./ProfileActivityFeed";

interface ProfilePanelProps {
  addressParam?: string;
}

export function ProfilePanel({ addressParam }: ProfilePanelProps) {
  const { address: connectedAddress, isConnected } = useAccount();
  const router = useRouter();

  const resolvedAddress = addressParam ?? connectedAddress;
  const isOwnProfile = !addressParam || (
    connectedAddress?.toLowerCase() === addressParam.toLowerCase()
  );

  // Redirect /profile/[own-address] to /profile
  useEffect(() => {
    if (
      addressParam &&
      connectedAddress &&
      addressParam.toLowerCase() === connectedAddress.toLowerCase()
    ) {
      router.replace("/profile");
    }
  }, [addressParam, connectedAddress, router]);

  // No wallet connected and no address param - show connect prompt
  if (!resolvedAddress) {
    return <ConnectWalletPrompt />;
  }

  return (
    <ProfileContent address={resolvedAddress} isOwnProfile={isOwnProfile} />
  );
}

function ProfileContent({ address, isOwnProfile }: { address: string; isOwnProfile: boolean }) {
  const { wins, activity, stats, isLoading, error } = useProfileData(address);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="font-headline text-on-surface-variant">
          Failed to load profile
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-surface-bright px-6 py-3 font-headline text-sm font-bold text-primary transition-colors hover:bg-surface-container-high"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <ProfileHeaderSkeleton />
        <ProfileStatsSkeleton />
        <ProfileNftGridSkeleton />
        <ProfileActivityFeedSkeleton />
      </>
    );
  }

  return (
    <>
      <ProfileHeader address={address} isOwnProfile={isOwnProfile} />
      <ProfileStats nftCount={stats.nftCount} totalSpent={stats.totalSpent} />
      <ProfileNftGrid wins={wins} />
      <ProfileActivityFeed activity={activity} />
    </>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/ProfilePanel.tsx
git commit -m "feat(web): add ProfilePanel orchestrator component"
```

---

### Task 9: Create profile page route

**Files:**
- Create: `packages/web/src/app/profile/[[...address]]/page.tsx`

- [ ] **Step 1: Create the route directory and page**

```tsx
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProfilePanel } from "@/components/ProfilePanel";

interface ProfilePageProps {
  params: Promise<{ address?: string[] }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { address } = await params;
  const addressParam = address?.[0];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 pt-24 pb-32">
        <ProfilePanel addressParam={addressParam} />
      </main>
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 2: Verify the build and that the route is accessible**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds with the new `/profile` and `/profile/[address]` routes.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/app/profile/
git commit -m "feat(web): add profile page route with catch-all address param"
```

---

### Task 10: Update BottomNav - Profile link and DAO "coming soon"

**Files:**
- Modify: `packages/web/src/components/BottomNav.tsx`

- [ ] **Step 1: Update the tabs array and add coming soon indicator**

Replace the entire contents of `BottomNav.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGavel, IconPhoto, IconBuildingBank, IconUser } from "@tabler/icons-react";

const tabs = [
  { label: "Auction", icon: IconGavel, href: "/", comingSoon: false },
  { label: "Gallery", icon: IconPhoto, href: "/gallery", comingSoon: false },
  { label: "DAO", icon: IconBuildingBank, href: "#", comingSoon: true },
  { label: "Profile", icon: IconUser, href: "/profile", comingSoon: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full rounded-t-[20px] border-t border-zinc-800/30 bg-zinc-900/80 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-around px-4 py-3">
        {tabs.map(({ label, icon: Icon, href, comingSoon }) => {
          const active = href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);

          if (comingSoon) {
            return (
              <div
                key={label}
                className="relative flex flex-col items-center justify-center p-2 text-zinc-700"
              >
                <Icon size={24} className="mb-1" />
                <span className="text-[11px] font-medium uppercase tracking-widest">
                  {label}
                </span>
                <span className="absolute -top-1 -right-1 rounded-full bg-surface-container-highest px-1.5 py-0.5 text-[8px] font-bold text-on-surface-variant">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                active
                  ? "rounded-xl bg-surface-bright px-5 py-2 text-primary"
                  : "p-2 text-zinc-500 hover:text-white"
              }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-[11px] font-medium uppercase tracking-widest">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify the build still works**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web build`
Expected: Build succeeds. BottomNav shows Profile linking to `/profile`, DAO has a "Soon" badge and is not clickable.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/BottomNav.tsx
git commit -m "feat(web): update BottomNav with profile link and DAO coming soon badge"
```

---

### Task 11: Manual QA Verification

- [ ] **Step 1: Start the dev server**

Run: `cd /Users/marciojunior/code/marcioecom/nightmint && pnpm --filter web dev`

- [ ] **Step 2: Verify all profile page states**

Test the following scenarios:
1. Visit `/profile` without wallet connected - should show ConnectWalletPrompt
2. Connect wallet, visit `/profile` - should show own profile with "You" badge, stats, NFTs, activity
3. Visit `/profile/<own-address>` - should redirect to `/profile`
4. Visit `/profile/<other-address>` - should show public profile without "You" badge
5. Verify BottomNav: Profile tab links to `/profile` and shows active state, DAO tab shows "Soon" badge and is not clickable
6. Click an NFT in the grid - should open GalleryDetailModal
7. Verify skeletons show during loading

- [ ] **Step 3: Fix any issues found during QA**
