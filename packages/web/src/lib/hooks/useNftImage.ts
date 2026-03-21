"use client";

import { useMemo } from "react";
import { useChainId, useReadContract } from "wagmi";
import { getContractConfig } from "@/lib/contracts";

export function useNftImage(tokenId: number | undefined) {
  const chainId = useChainId();
  const { token } = getContractConfig(chainId);

  const { data: tokenUri, isLoading } = useReadContract({
    ...token,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: { enabled: tokenId !== undefined },
  });

  const svgDataUri = useMemo(() => {
    if (!tokenUri) return undefined;
    try {
      const json = atob((tokenUri as string).split(",")[1]);
      const metadata = JSON.parse(json);
      return metadata.image as string;
    } catch {
      return undefined;
    }
  }, [tokenUri]);

  return { svgDataUri, isLoading };
}
