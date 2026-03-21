"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	useSettledAuctions,
	type SortKey,
} from "@/lib/hooks/useSettledAuctions";
import { GalleryCard } from "./GalleryCard";
import { GalleryDetailModal } from "./GalleryDetailModal";

const PAGE_SIZE = 6;

const sortLabels: { key: SortKey; label: string }[] = [
	{ key: "recent", label: "Recent" },
	{ key: "highest", label: "Highest Price" },
	{ key: "lowest", label: "Lowest Price" },
];

export function GalleryPanel() {
	const [sort, setSort] = useState<SortKey>("recent");
	const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

	const {
		data,
		isLoading,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useSettledAuctions(sort);

	// Infinite scroll sentinel
	const sentinelRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const auctions = useMemo(
		() => data?.pages.flatMap((p) => p.items) ?? [],
		[data],
	);

	const totalCount = data?.pages[0]?.totalCount ?? 0;
	const totalVolume = data?.pages[0]?.totalVolume ?? "0";

	const selectedAuction = useMemo(
		() => auctions.find((a) => a.tokenId === selectedTokenId) ?? null,
		[auctions, selectedTokenId],
	);

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div>
					<div className="mb-2 h-10 w-32 animate-pulse rounded bg-surface-container" />
					<div className="h-4 w-48 animate-pulse rounded bg-surface-container" />
				</div>
				<div className="grid grid-cols-2 gap-4">
					{Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<div
							key={i}
							className="overflow-hidden rounded-xl bg-surface-container-low"
						>
							<div className="aspect-square animate-pulse bg-surface-container" />
							<div className="space-y-2 p-4">
								<div className="h-3 w-16 animate-pulse rounded bg-surface-container" />
								<div className="h-5 w-20 animate-pulse rounded bg-surface-container" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center gap-4 py-20 text-center">
				<p className="font-headline text-on-surface-variant">
					Failed to load gallery
				</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="rounded-xl bg-surface-bright px-6 py-3 font-headline text-sm font-bold text-primary transition-colors hover:bg-surface-container-high"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<>
			{/* Page Header */}
			<div className="mb-10">
				<h1 className="mb-2 font-headline text-4xl font-bold tracking-tight">
					Gallery
				</h1>
				<p className="font-body text-sm text-on-surface-variant">
					Treasury History & Archive
				</p>

				{/* Treasury Summary */}
				<div className="relative mt-6 flex items-end justify-between overflow-hidden rounded-xl bg-surface-container-low p-6">
					<div className="absolute -mt-16 -mr-16 top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl" />
					<div>
						<span className="mb-1 block font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
							Total Volume
						</span>
						<span className="font-headline text-3xl font-bold tracking-tight text-primary">
							{totalVolume} ETH
						</span>
					</div>
					<div className="text-right">
						<span className="mb-1 block font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
							Sold Items
						</span>
						<span className="font-headline text-xl font-bold">
							{totalCount}
						</span>
					</div>
				</div>
			</div>

			{/* Sort Pills */}
			<div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
				{sortLabels.map(({ key, label }) => (
					<button
						key={key}
						type="button"
						onClick={() => setSort(key)}
						className={`whitespace-nowrap rounded-full px-5 py-2 font-headline text-xs font-bold transition-colors ${
							sort === key
								? "bg-primary text-on-primary-fixed"
								: "bg-surface-container-high text-on-surface-variant hover:text-white"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{/* NFT Grid */}
			{auctions.length === 0 ? (
				<p className="py-20 text-center font-body text-on-surface-variant">
					No settled auctions yet
				</p>
			) : (
				<div className="grid grid-cols-2 gap-4">
					{auctions.map((auction) => (
						<GalleryCard
							key={auction.tokenId}
							tokenId={auction.tokenId}
							winningBid={auction.winningBid}
							onClick={() => setSelectedTokenId(auction.tokenId)}
						/>
					))}
				</div>
			)}

			{/* Infinite scroll sentinel */}
			<div ref={sentinelRef} className="h-1" />

			{/* Loading indicator for next page */}
			{isFetchingNextPage && (
				<div className="mt-8 grid grid-cols-2 gap-4">
					{Array.from({ length: 2 }).map((_, i) => (
						<div
							key={i}
							className="overflow-hidden rounded-xl bg-surface-container-low"
						>
							<div className="aspect-square animate-pulse bg-surface-container" />
							<div className="space-y-2 p-4">
								<div className="h-3 w-16 animate-pulse rounded bg-surface-container" />
								<div className="h-5 w-20 animate-pulse rounded bg-surface-container" />
							</div>
						</div>
					))}
				</div>
			)}

			{/* Detail Modal */}
			{selectedAuction && (
				<GalleryDetailModal
					auction={selectedAuction}
					onClose={() => setSelectedTokenId(null)}
				/>
			)}
		</>
	);
}
