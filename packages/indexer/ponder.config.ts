import { createConfig } from "ponder";
import { NightMintAuctionHouseAbi } from "./abis/NightMintAuctionHouse";
import { env } from "./src/env";

export default createConfig({
  chains: {
    anvil: {
      id: 31337,
      rpc: "http://127.0.0.1:8545",
      disableCache: true,
    },
    sepolia: {
      id: env.PONDER_CHAIN_ID,
      rpc: env.PONDER_RPC_URL,
      pollingInterval: 2_000,
    },
  },
  contracts: {
    NightMintAuctionHouse: {
      abi: NightMintAuctionHouseAbi,
      chain: "anvil",
      address: env.PONDER_CONTRACT_ADDRESS,
      startBlock: env.PONDER_START_BLOCK,
    },
  },
});
