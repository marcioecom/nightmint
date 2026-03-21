import { http, createConfig } from "wagmi";
import { foundry, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [foundry, sepolia],
  connectors: [injected(), metaMask()],
  transports: {
    [foundry.id]: http(),
    [sepolia.id]: http(),
  },
});
