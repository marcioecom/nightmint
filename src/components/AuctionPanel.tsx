"use client";

import { useState, useMemo } from "react";
import { AuctionNav } from "./AuctionNav";
import { BidStatus } from "./BidStatus";
import { BidInput } from "./BidInput";
import { BidHistory } from "./BidHistory";
import { ConnectButton } from "./ConnectButton";
import { getMockAuctions } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export function AuctionPanel() {
  const auctions = useMemo(() => getMockAuctions(), []);
  const [auctionIndex, setAuctionIndex] = useState(0);
  const auction = auctions[auctionIndex];

  const minBid = (parseFloat(auction.currentBid) * 1.05).toFixed(2);

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-4 lg:w-[48%] lg:px-6 lg:py-6">
      {/* Top bar: Connect Wallet on the right */}
      <div className="flex items-center justify-end">
        <ConnectButton />
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
