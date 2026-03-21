"use client";

import { useEffect, useRef, useState } from "react";
import { useNftImage } from "@/lib/hooks/useNftImage";

interface GalleryNftImageProps {
	tokenId: number;
}

export function GalleryNftImage({ tokenId }: GalleryNftImageProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const { svgDataUri, isLoading } = useNftImage(visible ? tokenId : undefined);

	return (
		<div ref={ref} className="aspect-square w-full bg-surface-container">
			{svgDataUri ? (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={svgDataUri}
					alt={`NFT #${tokenId}`}
					className="h-full w-full object-cover pixel-mask"
				/>
			) : (
				<div
					className={`h-full w-full ${isLoading || visible ? "animate-pulse" : ""} bg-surface-container`}
				/>
			)}
		</div>
	);
}
