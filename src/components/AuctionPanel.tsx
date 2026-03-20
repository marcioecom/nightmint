"use client";

import { useMemo } from "react";
import { NFTDisplay } from "./NFTDisplay";
import { BidStatus } from "./BidStatus";
import { BidInput } from "./BidInput";
import { BidHistory } from "./BidHistory";
import { getMockAuctions } from "@/lib/mock-data";

export function AuctionPanel() {
  const auctions = useMemo(() => getMockAuctions(), []);
  const auction = auctions[0];

  const minBid = (parseFloat(auction.currentBid) * 1.05).toFixed(2);

  return (
    <>
      <NFTDisplay nounId={auction.nounId} />

      <BidStatus
        currentBid={auction.currentBid}
        endTime={auction.endTime}
        status={auction.status}
      />

      <BidInput minBid={minBid} status={auction.status} />

      <BidHistory bids={auction.bids} />
    </>
  );
}
