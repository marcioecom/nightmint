"use client";

import { GalleryNftImage } from "./GalleryNftImage";

interface GalleryCardProps {
	tokenId: number;
	winningBid: string;
	onClick: () => void;
}

export function GalleryCard({ tokenId, winningBid, onClick }: GalleryCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group w-full overflow-hidden rounded-xl bg-surface-container-low text-left transition-transform duration-200 active:scale-95"
		>
			<div className="relative">
				<GalleryNftImage tokenId={tokenId} />
				<div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-1 font-headline text-[10px] font-bold text-white backdrop-blur-md">
					#{tokenId}
				</div>
			</div>
			<div className="p-4">
				<div className="mb-1 font-headline text-xs uppercase tracking-widest text-on-surface-variant">
					Final Bid
				</div>
				<span className="font-headline text-lg font-bold text-primary">
					{winningBid} ETH
				</span>
			</div>
		</button>
	);
}
