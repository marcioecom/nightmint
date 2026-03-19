"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/utils";
import type { AuctionStatus } from "@/lib/mock-data";

interface BidStatusProps {
  currentBid: string;
  endTime: number;
  status: AuctionStatus;
}

export function BidStatus({ currentBid, endTime, status }: BidStatusProps) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(endTime));

  useEffect(() => {
    if (status !== "active") return;

    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, status]);

  const timerDisplay = (() => {
    switch (status) {
      case "active": return timeLeft || "Auction ended";
      case "ended-unsettled": return "Auction ended";
      case "settling": return "Settling...";
      case "settled": return "Auction ended";
      case "no-auction": return "Starting soon...";
    }
  })();

  return (
    <div className="flex gap-8 border-b border-white/[0.06] pb-4">
      <div>
        <div className="mb-1 text-xs uppercase tracking-widest text-white/50">
          Current bid
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg text-white/60">{"\u039E"}</span>
          <span className="text-2xl font-semibold text-white">{currentBid}</span>
        </div>
      </div>
      <div className="border-l border-white/[0.08] pl-8">
        <div className="mb-1 text-xs uppercase tracking-widest text-white/50">
          Auction ends in
        </div>
        <div className="text-2xl font-semibold text-white">{timerDisplay}</div>
      </div>
    </div>
  );
}
