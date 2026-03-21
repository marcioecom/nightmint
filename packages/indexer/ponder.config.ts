import { createConfig } from "ponder";
import { NightMintAuctionHouseAbi } from "./abis/NightMintAuctionHouse";
import { chain } from "./src/chain";

export default createConfig({
  chains: {
    [chain.name]: {
      id: chain.id,
      rpc: chain.rpc,
      disableCache: chain.disableCache || undefined,
      pollingInterval: chain.pollingInterval,
    },
  },
  contracts: {
    NightMintAuctionHouse: {
      abi: NightMintAuctionHouseAbi,
      chain: chain.name,
      address: chain.contractAddress,
      startBlock: chain.startBlock,
    },
  },
});
