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
      case "active": return "Place Bid";
      case "ended-unsettled": return "Settle Auction";
      case "settling": return "Settling...";
      case "settled": return "Settled";
      case "no-auction": return "No Auction";
    }
  })();

  const minIncrease = (parseFloat(minBid) - parseFloat(minBid) / 1.05).toFixed(2);

  return (
    <section className="space-y-6 rounded-xl bg-surface-container p-6">
      <div className="space-y-2">
        <label className="px-1 font-headline text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
          Place your bid
        </label>
        <div className="group relative">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isInputDisabled}
            placeholder={`${minBid} or higher`}
            className="w-full rounded-xl border-none bg-surface-container-lowest px-5 py-4 font-headline text-xl font-bold text-white outline-none transition-all placeholder:text-zinc-700 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="absolute top-1/2 right-4 -translate-y-1/2 font-headline font-bold text-on-surface-variant">
            ETH
          </div>
        </div>
      </div>
      <button
        onClick={handleBid}
        disabled={isButtonDisabled}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-lg font-extrabold tracking-tight text-on-primary-fixed transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </button>
      <p className="text-center text-[11px] font-medium text-on-surface-variant">
        Minimum increase: {minIncrease} ETH
      </p>
      {error && (
        <p className="text-center text-sm text-error">{error}</p>
      )}
    </section>
  );
}
