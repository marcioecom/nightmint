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
    <div className="liquid-glass flex rounded-2xl">
      <div className="flex-1 p-4">
        <div className="mb-1 text-[10px] uppercase tracking-widest text-white/40">
          Current bid
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base text-white/50">{"\u039E"}</span>
          <span className="text-2xl font-semibold text-white">{currentBid}</span>
        </div>
      </div>
      <div className="w-px bg-white/[0.06]" />
      <div className="flex-1 p-4">
        <div className="mb-1 text-[10px] uppercase tracking-widest text-white/40">
          Auction ends in
        </div>
        <div className="text-2xl font-semibold text-white">{timerDisplay}</div>
      </div>
    </div>
  );
}
