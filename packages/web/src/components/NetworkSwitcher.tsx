"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { foundry, sepolia } from "wagmi/chains";
import { supportedChainIds } from "@/lib/contracts";

const CHAINS = [
  { id: sepolia.id, label: "Sepolia" },
  { id: foundry.id, label: "Anvil" },
];

export function NetworkSwitcher() {
  const { chainId: walletChainId, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Auto-switch on connect if wallet is on unsupported chain
  useEffect(() => {
    if (!isConnected || !walletChainId) return;
    if (!supportedChainIds.includes(walletChainId)) {
      switchChain({ chainId: supportedChainIds[0] });
    }
  }, [isConnected, walletChainId, switchChain]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!mounted || !isConnected) return null;

  const isWrongChain = walletChainId && !supportedChainIds.includes(walletChainId);
  const current = CHAINS.find((c) => c.id === walletChainId);

  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: supportedChainIds[0] })}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-xl bg-error/20 px-3 py-2 font-headline text-xs font-bold text-error transition-all hover:bg-error/30 active:scale-95 disabled:opacity-50"
      >
        <span className="h-2 w-2 rounded-full bg-error" />
        {isPending ? "Switching..." : "Wrong network"}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl bg-surface-container-high px-3 py-2 font-headline text-xs font-bold text-on-surface-variant transition-all hover:bg-zinc-800/50 active:scale-95"
      >
        <span className="h-2 w-2 rounded-full bg-primary" />
        {isPending ? "Switching..." : current?.label ?? "Unknown"}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl bg-surface-container-high shadow-lg shadow-black/40">
          {CHAINS.map((chain) => {
            const isActive = chain.id === walletChainId;
            return (
              <button
                key={chain.id}
                onClick={() => {
                  if (!isActive) switchChain({ chainId: chain.id });
                  setOpen(false);
                }}
                disabled={isPending}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left font-headline text-xs font-bold transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-white"
                } disabled:opacity-50`}
              >
                <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary" : "bg-zinc-600"}`} />
                {chain.label}
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-primary">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
