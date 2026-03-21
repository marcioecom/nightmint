"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { formatEther, type Log } from "viem";
import { useChainId, usePublicClient, useWatchContractEvent } from "wagmi";
import { getContractConfig } from "@/lib/contracts";
import type { Bid } from "@/lib/mock-data";

const INDEXER_URL =
	process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:42069";

async function fetchBids(tokenId: number): Promise<Bid[]> {
	const res = await fetch(`${INDEXER_URL}/api/bids/${tokenId}`);
	if (!res.ok) throw new Error(`Indexer responded with ${res.status}`);
	const data = await res.json();
	return data.map((b: Record<string, string>) => ({
		bidder: b.bidder,
		amount: formatEther(BigInt(b.amount)),
		timestamp: Number(b.timestamp) * 1000,
	}));
}

export function useBidHistory(tokenId: number | undefined) {
	const chainId = useChainId();
	const client = usePublicClient();
	const { auctionHouse } = getContractConfig(chainId);
	const [liveBids, setLiveBids] = useState<Bid[]>([]);

	const { data: indexedBids = [], isLoading } = useQuery({
		queryKey: ["bids", tokenId],
		queryFn: () => fetchBids(tokenId!),
		enabled: tokenId !== undefined,
		staleTime: 30_000,
	});

	// Real-time updates via WebSocket (instant, no polling delay)
	const handleNewBid = useCallback(
		async (logs: Log[]) => {
			if (!client) return;
			for (const log of logs) {
				const args = (log as any).args;
				const block = await client.getBlock({ blockNumber: log.blockNumber! });
				const newBid: Bid = {
					bidder: args.bidder as string,
					amount: formatEther(args.amount as bigint),
					timestamp: Number(block.timestamp) * 1000,
				};
				setLiveBids((prev) => [newBid, ...prev]);
			}
		},
		[client],
	);

	useWatchContractEvent({
		address: auctionHouse.address,
		abi: auctionHouse.abi,
		eventName: "AuctionBid",
		args: tokenId !== undefined ? { tokenId: BigInt(tokenId) } : undefined,
		enabled: tokenId !== undefined,
		onLogs: handleNewBid,
	});

	// Merge live bids (newest) with indexed bids (complete history)
	const bids = [...liveBids, ...indexedBids];

	return { bids, isLoading };
}
