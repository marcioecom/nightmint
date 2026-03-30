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
