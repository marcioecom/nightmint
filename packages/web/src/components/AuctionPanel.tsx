"use client";

import { useCallback } from "react";
import { NFTDisplay } from "./NFTDisplay";
import { BidStatus } from "./BidStatus";
import { BidInput } from "./BidInput";
import { BidHistory } from "./BidHistory";
import { useAuction } from "@/lib/hooks/useAuction";
import { useNftImage } from "@/lib/hooks/useNftImage";
import { useBidActions } from "@/lib/hooks/useBidActions";
import { useBidHistory } from "@/lib/hooks/useBidHistory";

function AuctionSkeleton() {
  return (
    <>
      {/* NFT placeholder */}
      <section className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low">
        <div className="h-full w-full animate-pulse bg-surface-container" />
        <div className="glass-panel absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Loading
          </span>
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
        </div>
      </section>

      {/* Bid status placeholder */}
      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-surface-container-low p-5">
          <p className="mb-2 font-headline text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
            Current Bid
          </p>
          <div className="h-7 w-20 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="rounded-xl bg-surface-container-low p-5">
          <p className="mb-2 font-headline text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
            Ending In
          </p>
          <div className="h-7 w-28 animate-pulse rounded bg-zinc-800" />
        </div>
      </section>

      {/* Bid input placeholder */}
      <section className="space-y-6 rounded-xl bg-surface-container p-6">
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-surface-container-lowest" />
        </div>
        <div className="h-14 w-full animate-pulse rounded-xl bg-zinc-800" />
      </section>

      {/* Bid history placeholder */}
      <section className="space-y-4 pb-12">
        <div className="flex items-center justify-between px-1">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-3 w-12 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="space-y-px overflow-hidden rounded-xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between bg-surface-container-low p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function AuctionPanel() {
  const { tokenId, currentBid, endTime, status, minBid, refetch, isLoading, isError, error: auctionError } = useAuction();
  const { svgDataUri } = useNftImage(tokenId);

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { placeBid, settleAndCreate, isPending, isConfirming, error, reset } =
    useBidActions({ onSuccess: handleSuccess });

  const { bids } = useBidHistory(tokenId);

  const handleBid = useCallback(
    (amount: string) => {
      if (tokenId === undefined) return;
      reset();
      placeBid(tokenId, amount);
    },
    [tokenId, placeBid, reset]
  );

  const handleSettle = useCallback(() => {
    reset();
    settleAndCreate();
  }, [settleAndCreate, reset]);

  if (isLoading) {
    return <AuctionSkeleton />;
  }

  if (isError) {
    return (
      <section className="space-y-4 rounded-xl bg-surface-container p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="font-headline text-lg font-bold text-white">
          Could not load auction
        </p>
        <p className="text-sm text-on-surface-variant">
          {auctionError?.message?.includes("HTTP request failed")
            ? "Cannot connect to the blockchain. Make sure Anvil is running on localhost:8545."
            : "Check that contracts are deployed and .env.local has the correct addresses."}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-surface-container-high px-6 py-3 font-headline text-sm font-bold text-primary transition-all hover:bg-zinc-800/50 active:scale-95"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <>
      <NFTDisplay nounId={tokenId ?? 0} imageSrc={svgDataUri} />

      <BidStatus
        currentBid={currentBid}
        endTime={endTime}
        status={status}
      />

      <BidInput
        minBid={minBid}
        status={status}
        onBid={handleBid}
        onSettle={handleSettle}
        txPending={isPending || isConfirming}
        txError={error}
      />

      <BidHistory bids={bids} />
    </>
  );
}
