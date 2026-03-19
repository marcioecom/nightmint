"use client";

import { useState, useMemo } from "react";
import { Sparkles, ArrowRight, Twitter, Linkedin, Instagram } from "lucide-react";
import { AuctionNav } from "./AuctionNav";
import { BidStatus } from "./BidStatus";
import { BidInput } from "./BidInput";
import { BidHistory } from "./BidHistory";
import { getMockAuctions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export function AuctionPanel() {
  const auctions = useMemo(() => getMockAuctions(), []);
  const [auctionIndex, setAuctionIndex] = useState(0);
  const auction = auctions[auctionIndex];

  const minBid = (parseFloat(auction.currentBid) * 1.05).toFixed(2);

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-4 lg:w-[48%] lg:px-6 lg:py-6">
      {/* Top bar: social icons + account */}
      <div className="flex items-center justify-end gap-3">
        <div className="liquid-glass flex items-center gap-1 rounded-full px-3 py-2">
          {[Twitter, Linkedin, Instagram].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
          <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
            <ArrowRight className="h-3.5 w-3.5 text-white/60" />
          </div>
        </div>
        <button className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-transform hover:scale-105">
          <Sparkles className="h-4 w-4 text-white/60" />
          <span>Account</span>
        </button>
      </div>

      {/* Auction navigation */}
      <AuctionNav
        date={formatDate(auction.endTime)}
        onPrev={() => setAuctionIndex((i) => Math.min(i + 1, auctions.length - 1))}
        onNext={() => setAuctionIndex((i) => Math.max(i - 1, 0))}
        hasPrev={auctionIndex < auctions.length - 1}
        hasNext={auctionIndex > 0}
      />

      {/* NFT Title */}
      <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
        Mint #{auction.nounId}
      </h1>

      {/* Bid Status */}
      <BidStatus
        currentBid={auction.currentBid}
        endTime={auction.endTime}
        status={auction.status}
      />

      {/* Bid Input */}
      <BidInput minBid={minBid} status={auction.status} />

      {/* Bid History in a glass card */}
      <div className="liquid-glass rounded-3xl p-4">
        <BidHistory bids={auction.bids} />
      </div>
    </div>
  );
}
