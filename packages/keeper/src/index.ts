import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  type Address,
  type Chain,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil, sepolia } from "viem/chains";

// Minimal ABI, mirrored from packages/contracts/abi/NightMintAuctionHouse.json.
// The contract is not upgradeable, so these two entries are stable.
const auctionHouseAbi = [
  {
    type: "function",
    name: "checkUpkeep",
    inputs: [{ name: "", type: "bytes" }],
    outputs: [
      { name: "upkeepNeeded", type: "bool" },
      { name: "", type: "bytes" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "performUpkeep",
    inputs: [{ name: "", type: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// Presets mirror packages/indexer/src/chain.ts
const presets: Record<
  string,
  { chain: Chain; rpc?: string; contractAddress: Address }
> = {
  anvil: {
    chain: anvil,
    rpc: "http://127.0.0.1:8545",
    contractAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  },
  sepolia: {
    chain: sepolia,
    rpc: undefined,
    contractAddress: "0xDB3d5753E4Ec462a7F19a260f70a1366E33FB705",
  },
};

const chainName = process.env.KEEPER_CHAIN ?? "anvil";
const preset = presets[chainName];
if (!preset) {
  throw new Error(
    `Unknown KEEPER_CHAIN "${chainName}". Expected one of: ${Object.keys(presets).join(", ")}`,
  );
}

const rpcUrl = process.env.KEEPER_RPC_URL ?? preset.rpc;
if (!rpcUrl) throw new Error(`KEEPER_RPC_URL is required for chain "${chainName}"`);

const contractAddress = (process.env.KEEPER_CONTRACT_ADDRESS ??
  preset.contractAddress) as Address;

const privateKey = process.env.KEEPER_PRIVATE_KEY;
if (!privateKey) throw new Error("Missing required env var: KEEPER_PRIVATE_KEY");
const account = privateKeyToAccount(privateKey as Hex);

const pollIntervalMs = Number(process.env.KEEPER_POLL_INTERVAL_MS ?? 60_000);
const minBalanceWei = BigInt(
  process.env.KEEPER_MIN_BALANCE_WEI ?? "5000000000000000", // 0.005 ETH
);

const transport = http(rpcUrl);
const publicClient = createPublicClient({ chain: preset.chain, transport });
const walletClient = createWalletClient({
  account,
  chain: preset.chain,
  transport,
});

function log(level: "info" | "warn" | "error", message: string) {
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), level, msg: message }),
  );
}

let stopping = false;
process.on("SIGINT", () => (stopping = true));
process.on("SIGTERM", () => (stopping = true));

async function tick() {
  const balance = await publicClient.getBalance({ address: account.address });
  if (balance < minBalanceWei) {
    log(
      "warn",
      `Keeper balance low: ${formatEther(balance)} ETH (${account.address}). Top up soon.`,
    );
  }

  const [upkeepNeeded, performData] = await publicClient.readContract({
    address: contractAddress,
    abi: auctionHouseAbi,
    functionName: "checkUpkeep",
    args: ["0x"],
  });

  if (!upkeepNeeded) return;

  log("info", "Upkeep needed, submitting performUpkeep");

  // Simulate first so a revert (e.g. auction not ended) never burns gas.
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: auctionHouseAbi,
    functionName: "performUpkeep",
    args: [performData],
    account,
  });

  const hash = await walletClient.writeContract(request);
  log("info", `performUpkeep submitted: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "success") {
    log(
      "info",
      `Auction settled in tx ${hash} (block ${receipt.blockNumber}, gas ${receipt.gasUsed})`,
    );
  } else {
    log("error", `performUpkeep reverted on-chain: ${hash}`);
  }
}

async function main() {
  log(
    "info",
    `Keeper started: chain=${chainName} contract=${contractAddress} account=${account.address} poll=${pollIntervalMs}ms`,
  );

  while (!stopping) {
    try {
      await tick();
    } catch (error) {
      log(
        "error",
        `Tick failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (!stopping) {
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, pollIntervalMs);
      await promise;
    }
  }

  log("info", "Keeper stopped");
}

main().catch((error) => {
  log("error", `Fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
