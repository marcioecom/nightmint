"use client";

import { useChainId, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { getContractConfig } from "@/lib/contracts";
import type { AuctionStatus } from "@/lib/mock-data";

export function useAuction() {
  const chainId = useChainId();
  const { auctionHouse } = getContractConfig(chainId);

  const {
    data: auctionData,
    refetch,
    isLoading: isAuctionLoading,
    isError: isAuctionError,
    error: auctionError,
  } = useReadContract({
    ...auctionHouse,
    functionName: "auction",
    query: { refetchInterval: 4000 },
  });

  const { data: reservePrice } = useReadContract({
    ...auctionHouse,
    functionName: "reservePrice",
  });

  const { data: minBidIncrementPct } = useReadContract({
    ...auctionHouse,
    functionName: "minBidIncrementPct",
  });

  if (isAuctionLoading) {
    return {
      tokenId: undefined,
      currentBid: "0",
      endTime: 0,
      bidder: undefined,
      status: "no-auction" as AuctionStatus,
      minBid: "0",
      settled: false,
      isLoading: true,
      isError: false,
      error: null,
      refetch,
    };
  }

  if (isAuctionError || !auctionData) {
    return {
      tokenId: undefined,
      currentBid: "0",
      endTime: 0,
      bidder: undefined,
      status: "no-auction" as AuctionStatus,
      minBid: "0",
      settled: false,
      isLoading: false,
      isError: true,
      error: auctionError,
      refetch,
    };
  }

  const [tokenId, amount, , endTime, bidder, settled] = auctionData as [
    bigint, bigint, bigint, bigint, `0x${string}`, boolean,
  ];

  const now = Date.now();
  const endTimeMs = Number(endTime) * 1000;

  let status: AuctionStatus;
  if (settled) {
    status = "settled";
  } else if (endTimeMs > now) {
    status = "active";
  } else {
    status = "ended-unsettled";
  }

  const pct = minBidIncrementPct ? Number(minBidIncrementPct) : 5;
  let minBid: bigint;
  if (amount === 0n) {
    minBid = (reservePrice as bigint) ?? 0n;
  } else {
    minBid = amount + (amount * BigInt(pct)) / 100n;
  }

  return {
    tokenId: Number(tokenId),
    currentBid: formatEther(amount),
    endTime: endTimeMs,
    bidder: bidder as string,
    status,
    minBid: formatEther(minBid),
    settled,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
  };
}
