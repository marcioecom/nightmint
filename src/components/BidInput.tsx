"use client";

import { useState } from "react";
import type { AuctionStatus } from "@/lib/mock-data";

interface BidInputProps {
  minBid: string;
  status: AuctionStatus;
}

export function BidInput({ minBid, status }: BidInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleBid() {
    setError("");
    const numValue = parseFloat(value);
    const numMin = parseFloat(minBid);

    if (isNaN(numValue) || numValue < numMin) {
      setError(`Minimum bid is \u039E ${minBid}`);
      return;
    }

    setValue("");
  }

  const isInputDisabled = status !== "active";
  const isButtonDisabled = status === "settling" || status === "no-auction" || status === "settled";
  const buttonText = (() => {
    switch (status) {
      case "active": return "Bid";
      case "ended-unsettled": return "Settle Auction";
      case "settling": return "Settling...";
      case "settled": return "Settled";
      case "no-auction": return "No Auction";
    }
  })();

  return (
    <div>
      <div className="flex gap-2">
        <div className="liquid-glass flex-1 rounded-2xl">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isInputDisabled}
            placeholder={`\u039E ${minBid} or more`}
            className="w-full bg-transparent px-5 py-3.5 text-sm text-white placeholder-white/30 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleBid}
          disabled={isButtonDisabled}
          className="liquid-glass-strong rounded-2xl px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {buttonText}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400/80">{error}</p>
      )}
    </div>
  );
}
