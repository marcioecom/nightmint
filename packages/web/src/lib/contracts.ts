import { type Address } from "viem";
import { foundry, sepolia } from "viem/chains";
import auctionHouseAbi from "@nightmint/contracts/abi/NightMintAuctionHouse.json";
import tokenAbi from "@nightmint/contracts/abi/NightMintToken.json";

const addresses: Record<number, { auctionHouse: Address; token: Address }> = {
  [foundry.id]: {
    auctionHouse: (process.env.NEXT_PUBLIC_AUCTION_HOUSE_ANVIL ?? "0x") as Address,
    token: (process.env.NEXT_PUBLIC_TOKEN_ANVIL ?? "0x") as Address,
  },
  [sepolia.id]: {
    auctionHouse: (process.env.NEXT_PUBLIC_AUCTION_HOUSE_SEPOLIA ?? "0x") as Address,
    token: (process.env.NEXT_PUBLIC_TOKEN_SEPOLIA ?? "0x") as Address,
  },
};

// Priority: mainnet > testnet > localnet
export const supportedChainIds: readonly number[] = [sepolia.id, foundry.id];

export function getContractConfig(chainId: number) {
  const addrs = addresses[chainId];
  if (!addrs) throw new Error(`Unsupported chain: ${chainId}`);
  return {
    auctionHouse: { address: addrs.auctionHouse, abi: auctionHouseAbi },
    token: { address: addrs.token, abi: tokenAbi },
  } as const;
}
