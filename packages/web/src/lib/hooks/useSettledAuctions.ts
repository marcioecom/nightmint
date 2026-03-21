"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { formatEther } from "viem";

const INDEXER_URL =
	process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:42069";

const PAGE_SIZE = 6;

export type SortKey = "recent" | "highest" | "lowest";

export interface SettledAuction {
	tokenId: number;
	winner: string;
	winningBid: string;
	bidCount: number;
	endTime: number;
}

interface AuctionsPage {
	items: SettledAuction[];
	totalCount: number;
	totalVolume: string;
	nextOffset: number | undefined;
}

async function fetchAuctionsPage(
	sort: SortKey,
	offset: number,
): Promise<AuctionsPage> {
	const params = new URLSearchParams({
		sort,
		settled: "true",
		limit: String(PAGE_SIZE),
		offset: String(offset),
	});
	const res = await fetch(`${INDEXER_URL}/api/auctions?${params}`);
	if (!res.ok) throw new Error(`Indexer responded with ${res.status}`);
	const data = await res.json();

	const items: SettledAuction[] = data.items.map(
		(a: Record<string, string>) => ({
			tokenId: Number(a.tokenId),
			winner: a.winner,
			winningBid: formatEther(BigInt(a.winningBid)),
			bidCount: Number(a.bidCount),
			endTime: Number(a.endTime) * 1000,
		}),
	);

	const nextOffset = offset + items.length;
	return {
		items,
		totalCount: data.totalCount,
		totalVolume: formatEther(BigInt(data.totalVolume)),
		nextOffset: nextOffset < data.totalCount ? nextOffset : undefined,
	};
}

export function useSettledAuctions(sort: SortKey) {
	return useInfiniteQuery({
		queryKey: ["settled-auctions", sort],
		queryFn: ({ pageParam }) => fetchAuctionsPage(sort, pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset,
		staleTime: 60_000,
	});
}
