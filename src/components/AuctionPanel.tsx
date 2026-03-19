"use client";

import { useState } from "react";
import { AuctionNav } from "./AuctionNav";
import { BidStatus } from "./BidStatus";
import { BidInput } from "./BidInput";
import { BidHistory } from "./BidHistory";
import { MOCK_AUCTIONS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export function AuctionPanel() {
  const [auctionIndex, setAuctionIndex] = useState(0);
  const auction = MOCK_AUCTIONS[auctionIndex];

  const minBid = (parseFloat(auction.currentBid) * 1.05).toFixed(2);

  return (
    <div className="flex w-full flex-col gap-6 lg:w-[52%] lg:pl-10 lg:pt-4">
      <AuctionNav
        date={formatDate(auction.endTime)}
        onPrev={() => setAuctionIndex((i) => Math.min(i + 1, MOCK_AUCTIONS.length - 1))}
        onNext={() => setAuctionIndex((i) => Math.max(i - 1, 0))}
        hasPrev={auctionIndex < MOCK_AUCTIONS.length - 1}
        hasNext={auctionIndex > 0}
      />

      <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
        Mint #{auction.nounId}
      </h1>

      <BidStatus
        currentBid={auction.currentBid}
        endTime={auction.endTime}
        status={auction.status}
      />

      <BidInput minBid={minBid} status={auction.status} />

      <BidHistory bids={auction.bids} />
    </div>
  );
}
