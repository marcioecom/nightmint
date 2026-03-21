import { env } from "./env";

const presets = {
  anvil: {
    chainId: 31337,
    rpc: "http://127.0.0.1:8545",
    contractAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F" as `0x${string}`,
    startBlock: 0,
    disableCache: true,
    pollingInterval: undefined,
  },
  sepolia: {
    chainId: 11155111,
    rpc: undefined as string | undefined,
    contractAddress: "0xDB3d5753E4Ec462a7F19a260f70a1366E33FB705" as `0x${string}`,
    startBlock: 10487672,
    disableCache: false,
    pollingInterval: 2_000,
  },
} as const;

const preset = presets[env.PONDER_CHAIN];

const rpc = env.PONDER_RPC_URL ?? preset.rpc;
if (!rpc) {
  throw new Error(`PONDER_RPC_URL is required for chain "${env.PONDER_CHAIN}"`);
}

export const chain = {
  name: env.PONDER_CHAIN,
  id: preset.chainId,
  rpc,
  contractAddress: env.PONDER_CONTRACT_ADDRESS ?? preset.contractAddress,
  startBlock: env.PONDER_START_BLOCK ?? preset.startBlock,
  disableCache: preset.disableCache,
  pollingInterval: preset.pollingInterval,
};
