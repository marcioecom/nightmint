"use client";

import { useConnect } from "wagmi";
import { IconWallet } from "@tabler/icons-react";

export function ConnectWalletPrompt() {
  const { connect, connectors } = useConnect();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="rounded-full bg-surface-container-low p-6">
        <IconWallet size={48} className="text-on-surface-variant" />
      </div>
      <div>
        <h2 className="mb-2 font-headline text-xl font-bold tracking-tight">
          Connect your wallet
        </h2>
        <p className="font-body text-sm text-on-surface-variant">
          Connect a wallet to view your profile, NFTs, and bidding history.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          const connector = connectors[0];
          if (connector) connect({ connector });
        }}
        className="rounded-xl bg-primary px-8 py-3 font-headline text-sm font-bold text-on-primary transition-all duration-200 hover:opacity-90 active:scale-95"
      >
        Connect Wallet
      </button>
    </div>
  );
}
