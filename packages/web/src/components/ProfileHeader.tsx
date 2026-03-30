"use client";

import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { truncateAddress, addressToGradient } from "@/lib/utils";

interface ProfileHeaderProps {
  address: string;
  isOwnProfile: boolean;
}

export function ProfileHeader({ address, isOwnProfile }: ProfileHeaderProps) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
  });

  return (
    <section className="mb-10 mt-8 text-center">
      <div className="relative mb-4 inline-block">
        <div
          className="h-24 w-24 rounded-full p-[3px]"
          style={{ background: addressToGradient(address) }}
        >
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-surface-container-lowest"
          >
            <div
              className="h-full w-full rounded-full opacity-60"
              style={{ background: addressToGradient(address) }}
            />
          </div>
        </div>
      </div>
      <h2 className="mb-1 font-headline text-2xl font-bold tracking-tight">
        {ensName ?? truncateAddress(address)}
      </h2>
      {isOwnProfile && (
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-headline text-xs font-bold text-primary">
          You
        </span>
      )}
      {!isOwnProfile && ensName && (
        <p className="text-sm text-on-surface-variant">
          {truncateAddress(address)}
        </p>
      )}
    </section>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <section className="mb-10 mt-8 text-center">
      <div className="mb-4 inline-block">
        <div className="h-24 w-24 animate-pulse rounded-full bg-surface-container" />
      </div>
      <div className="mx-auto h-7 w-40 animate-pulse rounded bg-surface-container" />
    </section>
  );
}
