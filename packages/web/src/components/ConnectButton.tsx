"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { truncateAddress, addressToGradient } from "@/lib/utils";
import { WalletModal } from "./WalletModal";

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2 font-headline text-sm font-bold text-on-surface-variant"
      >
        <div className="h-3 w-3 animate-spin rounded-full border border-on-surface-variant border-t-primary" />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2 font-headline text-sm font-bold text-primary transition-all duration-300 hover:bg-zinc-800/50 active:scale-95"
        >
          <div
            className="h-5 w-5 rounded-full"
            style={{ background: addressToGradient(address) }}
          />
          {truncateAddress(address)}
        </button>
        {modalOpen && (
          <WalletModal address={address} onClose={() => setModalOpen(false)} />
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        const connector = connectors[0];
        if (connector) connect({ connector });
      }}
      className="rounded-xl bg-surface-container-high px-4 py-2 font-headline text-sm font-bold text-primary transition-all duration-300 hover:bg-zinc-800/50 active:scale-95"
    >
      Connect Wallet
    </button>
  );
}
