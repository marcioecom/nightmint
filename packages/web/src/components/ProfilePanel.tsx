"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileData } from "@/lib/hooks/useProfileData";
import { ConnectWalletPrompt } from "./ConnectWalletPrompt";
import { ProfileHeader, ProfileHeaderSkeleton } from "./ProfileHeader";
import { ProfileStats, ProfileStatsSkeleton } from "./ProfileStats";
import { ProfileNftGrid, ProfileNftGridSkeleton } from "./ProfileNftGrid";
import { ProfileActivityFeed, ProfileActivityFeedSkeleton } from "./ProfileActivityFeed";

interface ProfilePanelProps {
  addressParam?: string;
}

export function ProfilePanel({ addressParam }: ProfilePanelProps) {
  const { address: connectedAddress, isConnected } = useAccount();
  const router = useRouter();

  const resolvedAddress = addressParam ?? connectedAddress;
  const isOwnProfile = !addressParam || (
    connectedAddress?.toLowerCase() === addressParam.toLowerCase()
  );

  // Redirect /profile/[own-address] to /profile
  useEffect(() => {
    if (
      addressParam &&
      connectedAddress &&
      addressParam.toLowerCase() === connectedAddress.toLowerCase()
    ) {
      router.replace("/profile");
    }
  }, [addressParam, connectedAddress, router]);

  // No wallet connected and no address param - show connect prompt
  if (!resolvedAddress) {
    return <ConnectWalletPrompt />;
  }

  return (
    <ProfileContent address={resolvedAddress} isOwnProfile={isOwnProfile} />
  );
}

function ProfileContent({ address, isOwnProfile }: { address: string; isOwnProfile: boolean }) {
  const { wins, activity, stats, isLoading, error } = useProfileData(address);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="font-headline text-on-surface-variant">
          Failed to load profile
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-surface-bright px-6 py-3 font-headline text-sm font-bold text-primary transition-colors hover:bg-surface-container-high"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <ProfileHeaderSkeleton />
        <ProfileStatsSkeleton />
        <ProfileNftGridSkeleton />
        <ProfileActivityFeedSkeleton />
      </>
    );
  }

  return (
    <>
      <ProfileHeader address={address} isOwnProfile={isOwnProfile} />
      <ProfileStats nftCount={stats.nftCount} totalSpent={stats.totalSpent} />
      <ProfileNftGrid wins={wins} />
      <ProfileActivityFeed activity={activity} />
    </>
  );
}
