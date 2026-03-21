"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { useNftImage } from "@/lib/hooks/useNftImage";
import { truncateAddress, formatDate } from "@/lib/utils";
import type { SettledAuction } from "@/lib/hooks/useSettledAuctions";

interface GalleryDetailModalProps {
	auction: SettledAuction;
	onClose: () => void;
}

export function GalleryDetailModal({ auction, onClose }: GalleryDetailModalProps) {
	const { svgDataUri } = useNftImage(auction.tokenId);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-60 flex items-end justify-center">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Enter" && onClose()}
				role="button"
				tabIndex={0}
				aria-label="Close modal"
			/>

			{/* Content */}
			<div className="relative mx-auto w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface-container-low p-6" style={{ maxHeight: "85vh" }}>
				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 rounded-full bg-surface-container-high p-2 text-on-surface-variant transition-colors hover:text-white"
					aria-label="Close"
				>
					<IconX size={20} />
				</button>

				{/* NFT Image */}
				<div className="mb-6 aspect-square w-full overflow-hidden rounded-xl bg-surface-container">
					{svgDataUri ? (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img
							src={svgDataUri}
							alt={`NFT #${auction.tokenId}`}
							className="h-full w-full object-cover pixel-mask"
						/>
					) : (
						<div className="h-full w-full animate-pulse bg-surface-container" />
					)}
				</div>

				{/* Title */}
				<h2 className="mb-6 font-headline text-2xl font-bold tracking-tight">
					NightMint #{auction.tokenId}
				</h2>

				{/* Details grid */}
				<div className="space-y-4">
					<div className="flex items-center justify-between rounded-lg bg-surface-container p-4">
						<span className="font-headline text-xs uppercase tracking-widest text-on-surface-variant">
							Winning Bid
						</span>
						<span className="font-headline text-lg font-bold text-primary">
							{auction.winningBid} ETH
						</span>
					</div>

					<div className="flex items-center justify-between rounded-lg bg-surface-container p-4">
						<span className="font-headline text-xs uppercase tracking-widest text-on-surface-variant">
							Winner
						</span>
						<span className="font-body text-sm text-on-surface">
							{truncateAddress(auction.winner)}
						</span>
					</div>

					<div className="flex items-center justify-between rounded-lg bg-surface-container p-4">
						<span className="font-headline text-xs uppercase tracking-widest text-on-surface-variant">
							Bids
						</span>
						<span className="font-headline text-sm font-bold">
							{auction.bidCount}
						</span>
					</div>

					<div className="flex items-center justify-between rounded-lg bg-surface-container p-4">
						<span className="font-headline text-xs uppercase tracking-widest text-on-surface-variant">
							Settled
						</span>
						<span className="font-body text-sm text-on-surface">
							{formatDate(auction.endTime)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
