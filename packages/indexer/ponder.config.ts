import { createConfig } from "ponder";
import { NightMintAuctionHouseAbi } from "./abis/NightMintAuctionHouse";
import { env } from "./src/env";

export default createConfig({
  chains: {
    default: {
      id: env.PONDER_CHAIN_ID,
      rpc: env.PONDER_RPC_URL,
      pollingInterval: 2_000,
    },
  },
  contracts: {
    NightMintAuctionHouse: {
      abi: NightMintAuctionHouseAbi,
      chain: "default",
      address: env.PONDER_CONTRACT_ADDRESS,
      startBlock: env.PONDER_START_BLOCK,
    },
  },
});
