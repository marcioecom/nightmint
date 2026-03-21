"use client";

import { useEffect, useRef } from "react";
import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { getContractConfig } from "@/lib/contracts";

const ERROR_MESSAGES: Record<string, string> = {
  NightMintAuctionHouse__BidTooLow: "Your bid must be at least the minimum bid.",
  NightMintAuctionHouse__AuctionExpired: "This auction has ended. Settle to start a new one.",
  NightMintAuctionHouse__InvalidTokenId: "Wrong auction. Please refresh.",
  NightMintAuctionHouse__AuctionNotStarted: "Auction has not started yet.",
};

function mapError(error: Error | null): string | null {
  if (!error) return null;
  const msg = error.message ?? "";
  if (msg.includes("User rejected") || msg.includes("user rejected")) {
    return "Transaction cancelled.";
  }
  if (msg.includes("insufficient funds")) {
    return "Not enough ETH in your wallet.";
  }
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return value;
  }
  return "Transaction failed. Please try again.";
}

interface UseBidActionsOptions {
  onSuccess?: () => void;
}

export function useBidActions({ onSuccess }: UseBidActionsOptions = {}) {
  const chainId = useChainId();
  const { auctionHouse } = getContractConfig(chainId);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      query: {
        enabled: !!hash,
      },
    });

  const calledRef = useRef(false);
  useEffect(() => {
    if (isConfirmed && onSuccess && !calledRef.current) {
      calledRef.current = true;
      onSuccess();
    }
    if (!isConfirmed) {
      calledRef.current = false;
    }
  }, [isConfirmed, onSuccess]);

  function placeBid(tokenId: number, ethAmount: string) {
    writeContract({
      ...auctionHouse,
      functionName: "createBid",
      args: [BigInt(tokenId)],
      value: parseEther(ethAmount),
    });
  }

  function settleAndCreate() {
    writeContract({
      ...auctionHouse,
      functionName: "settleCurrentAndCreateNew",
    });
  }

  return {
    placeBid,
    settleAndCreate,
    isPending,
    isConfirming,
    isConfirmed,
    error: mapError(writeError),
    reset,
  };
}
