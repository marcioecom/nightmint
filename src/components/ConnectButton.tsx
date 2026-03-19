"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress, addressToGradient } from "@/lib/utils";

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnecting) {
    return (
      <button
        disabled
        className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/50"
      >
        <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-transform hover:scale-105"
      >
        <div
          className="h-5 w-5 rounded-full"
          style={{ background: addressToGradient(address) }}
        />
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        const connector = connectors[0];
        if (connector) connect({ connector });
      }}
      className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-transform hover:scale-105"
    >
      Connect Wallet
    </button>
  );
}
