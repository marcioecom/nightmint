"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { truncateAddress, addressToGradient } from "@/lib/utils";
import type { Bid } from "@/lib/mock-data";

interface BidHistoryProps {
  bids: Bid[];
}

const INITIAL_VISIBLE = 3;

export function BidHistory({ bids }: BidHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleBids = showAll ? bids : bids.slice(0, INITIAL_VISIBLE);

  if (bids.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-white/40">No bids yet</p>
    );
  }

  return (
    <div>
      {visibleBids.map((bid, i) => (
        <div
          key={`${bid.bidder}-${bid.timestamp}`}
          className="flex items-center justify-between border-b border-white/[0.04] py-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ background: addressToGradient(bid.bidder) }}
            />
            <span className="text-sm text-white/80">
              {truncateAddress(bid.bidder)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white">
              {"\u039E"} {bid.amount}
            </span>
            <a
              href={`https://sepolia.etherscan.io/address/${bid.bidder}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-white/80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
      {!showAll && bids.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full text-center text-xs text-white/40 transition-colors hover:text-white/60"
        >
          View all bids
        </button>
      )}
    </div>
  );
}
