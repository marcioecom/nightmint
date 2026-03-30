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
