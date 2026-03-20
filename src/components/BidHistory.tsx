"use client";

import { useState } from "react";
import { IconUser } from "@tabler/icons-react";
import { truncateAddress } from "@/lib/utils";
import type { Bid } from "@/lib/mock-data";

interface BidHistoryProps {
  bids: Bid[];
}

const INITIAL_VISIBLE = 3;

const rowOpacity = ["", "/60", "/40"] as const;

export function BidHistory({ bids }: BidHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleBids = showAll ? bids : bids.slice(0, INITIAL_VISIBLE);

  if (bids.length === 0) {
    return (
      <section className="py-4 text-center text-sm text-on-surface-variant">
        No bids yet
      </section>
    );
  }

  return (
    <section className="space-y-4 pb-12">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-white">
          Bid History
        </h3>
        <span className="text-[11px] font-bold text-primary">
          {bids.length} Bid{bids.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-px overflow-hidden rounded-xl">
        {visibleBids.map((bid, i) => {
          const isWinning = i === 0;
          const opacity = rowOpacity[i] ?? rowOpacity[2];
          const textColor = isWinning ? "text-white" : i === 1 ? "text-zinc-400" : "text-zinc-500";

          return (
            <div
              key={`${bid.bidder}-${bid.timestamp}`}
              className={`flex items-center justify-between bg-surface-container-low${opacity} p-4`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high">
                  <IconUser size={16} className="text-on-surface-variant" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${textColor}`}>
                    {truncateAddress(bid.bidder)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-headline text-sm font-bold ${textColor}`}>
                  {bid.amount} ETH
                </p>
                {isWinning && (
                  <p className="text-[10px] font-bold uppercase text-primary-dim">
                    Winning
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!showAll && bids.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 font-headline text-[11px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-white"
        >
          View all activity
        </button>
      )}
    </section>
  );
}
