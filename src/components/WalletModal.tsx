"use client";

import { useEffect, useRef, useState } from "react";
import { useDisconnect, useBalance, useEnsName } from "wagmi";
import { formatUnits } from "viem";
import { IconCopy, IconCheck, IconLogout, IconX } from "@tabler/icons-react";
import { truncateAddress, addressToGradient } from "@/lib/utils";

interface WalletModalProps {
  address: `0x${string}`;
  onClose: () => void;
}

export function WalletModal({ address, onClose }: WalletModalProps) {
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDisconnect() {
    disconnect();
    onClose();
  }

  const balanceDisplay = balance
    ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}`
    : "0.00 ETH";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end px-4 pt-20 animate-in fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-xs overflow-hidden rounded-xl bg-surface-container-high shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-white">
            Connected
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:text-white"
            aria-label="Close wallet modal"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Avatar + Address */}
        <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-5">
          <div
            className="h-16 w-16 rounded-full shadow-[0_0_24px_rgba(156,255,147,0.15)]"
            style={{ background: addressToGradient(address) }}
          />
          <div className="flex flex-col items-center gap-1">
            {ensName && (
              <p className="font-headline text-base font-bold text-white">
                {ensName}
              </p>
            )}
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 rounded-lg bg-surface-container-highest px-3 py-1.5 transition-colors hover:bg-surface-bright"
            >
              <span className="font-headline text-sm font-medium text-on-surface-variant">
                {truncateAddress(address)}
              </span>
              {copied ? (
                <IconCheck size={14} className="text-primary" />
              ) : (
                <IconCopy size={14} className="text-on-surface-variant" />
              )}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mx-5 rounded-xl bg-surface-container p-4">
          <p className="font-headline text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
            Balance
          </p>
          <p className="mt-1 font-headline text-xl font-bold text-white">
            {balanceDisplay}
          </p>
        </div>

        {/* Disconnect */}
        <div className="p-5">
          <button
            onClick={handleDisconnect}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container py-3 font-headline text-sm font-bold text-error transition-colors hover:bg-surface-container-highest"
          >
            <IconLogout size={18} />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
