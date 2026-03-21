"use client";

import { useEffect, useRef, useState } from "react";
import type { AuctionStatus } from "@/lib/mock-data";

interface BidStatusProps {
  currentBid: string;
  endTime: number;
  status: AuctionStatus;
  onTimerEnd?: () => void;
}

function getTimeParts(endTime: number) {
  const diff = endTime - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return { h, m, s };
}

function formatParts(parts: { h: number; m: number; s: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(parts.h)}:${pad(parts.m)}:${pad(parts.s)}`;
}

export function BidStatus({ currentBid, endTime, status, onTimerEnd }: BidStatusProps) {
  const [parts, setParts] = useState<{ h: number; m: number; s: number } | null>(null);
  const timerEndedRef = useRef(false);

  useEffect(() => {
    if (status !== "active") return;
    timerEndedRef.current = false;
    setParts(getTimeParts(endTime));
    const interval = setInterval(() => {
      const next = getTimeParts(endTime);
      setParts(next);
      if (!next && !timerEndedRef.current) {
        timerEndedRef.current = true;
        onTimerEnd?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, status, onTimerEnd]);

  const timerDisplay = (() => {
    if (status === "active" && parts) return formatParts(parts);
    if (status === "active") return "Auction ended";
    if (status === "ended-unsettled") return "Auction ended";
    if (status === "settling") return "Settling...";
    if (status === "settled") return "Auction ended";
    return "Starting soon...";
  })();

  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-surface-container-low p-5">
        <p className="mb-2 font-headline text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
          Current Bid
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-headline text-2xl font-bold text-primary">
            {currentBid}
          </span>
          <span className="font-headline text-sm font-medium text-primary-dim">
            ETH
          </span>
        </div>
      </div>
      <div className="rounded-xl bg-surface-container-low p-5">
        <p className="mb-2 font-headline text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
          Ending In
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-headline text-2xl font-bold text-secondary">
            {timerDisplay}
          </span>
        </div>
        {status === "active" && parts && (
          <div className="mt-1 flex justify-between">
            <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">
              Hrs
            </span>
            <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">
              Min
            </span>
            <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">
              Sec
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
