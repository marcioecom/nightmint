"use client";

import { useCallback, useEffect, useState } from "react";
import { useChainId, usePublicClient, useWatchContractEvent } from "wagmi";
import { formatEther, type Log } from "viem";
import { getContractConfig } from "@/lib/contracts";
import type { Bid } from "@/lib/mock-data";

export function useBidHistory(tokenId: number | undefined) {
  const chainId = useChainId();
  const client = usePublicClient();
  const { auctionHouse } = getContractConfig(chainId);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tokenId === undefined || !client) return;
    setIsLoading(true);
    setBids([]);

    (async () => {
      const logs = await client.getContractEvents({
        address: auctionHouse.address,
        abi: auctionHouse.abi,
        eventName: "AuctionBid",
        args: { tokenId: BigInt(tokenId) },
        fromBlock: 0n,
      });

      const mapped = await Promise.all(
        logs.map(async (log: Log) => {
          const args = (log as any).args;
          const block = await client.getBlock({ blockNumber: log.blockNumber! });
          return {
            bidder: args.bidder as string,
            amount: formatEther(args.amount as bigint),
            timestamp: Number(block.timestamp) * 1000,
          };
        })
      );

      mapped.sort((a, b) => b.timestamp - a.timestamp);
      setBids(mapped);
      setIsLoading(false);
    })();
  }, [tokenId, client, auctionHouse.address, auctionHouse.abi]);

  const handleNewBid = useCallback(
    async (logs: Log[]) => {
      if (!client) return;
      for (const log of logs) {
        const args = (log as any).args;
        const block = await client.getBlock({ blockNumber: log.blockNumber! });
        const newBid: Bid = {
          bidder: args.bidder as string,
          amount: formatEther(args.amount as bigint),
          timestamp: Number(block.timestamp) * 1000,
        };
        setBids((prev) => [newBid, ...prev]);
      }
    },
    [client]
  );

  useWatchContractEvent({
    address: auctionHouse.address,
    abi: auctionHouse.abi,
    eventName: "AuctionBid",
    args: tokenId !== undefined ? { tokenId: BigInt(tokenId) } : undefined,
    enabled: tokenId !== undefined,
    onLogs: handleNewBid,
  });

  return { bids, isLoading };
}
