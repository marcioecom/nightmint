"use client";

import { IconTrophy, IconGavel, IconCircleX } from "@tabler/icons-react";
import { formatTimeAgo } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/lib/hooks/useProfileData";

const activityConfig: Record<ActivityType, { icon: typeof IconTrophy; colorClass: string; label: string }> = {
  won: { icon: IconTrophy, colorClass: "text-primary", label: "Won" },
  bid: { icon: IconGavel, colorClass: "text-secondary", label: "Bid" },
  outbid: { icon: IconCircleX, colorClass: "text-error", label: "Outbid" },
};

interface ProfileActivityFeedProps {
  activity: ActivityItem[];
}

export function ProfileActivityFeed({ activity }: ProfileActivityFeedProps) {
  return (
    <section className="mb-10">
      <h3 className="mb-6 font-headline text-xl font-bold tracking-tight">
        Activity
      </h3>
      {activity.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-on-surface-variant">
          No activity yet
        </p>
      ) : (
        <div className="space-y-3">
          {activity.map((item) => {
            const config = activityConfig[item.type];
            const Icon = config.icon;
            return (
              <div
                key={`${item.type}-${item.tokenId}-${item.timestamp}`}
                className="flex items-center justify-between rounded-xl bg-surface-container p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
                    <Icon size={20} className={config.colorClass} />
                  </div>
                  <div>
                    <p className="font-headline text-sm font-bold">
                      NightMint #{item.tokenId}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {config.label} - {formatTimeAgo(item.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-headline text-sm font-bold ${config.colorClass}`}>
                    {parseFloat(item.amount).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ProfileActivityFeedSkeleton() {
  return (
    <section className="mb-10">
      <div className="mb-6 h-7 w-24 animate-pulse rounded bg-surface-container" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-surface-container p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-container-highest" />
              <div className="space-y-1">
                <div className="h-4 w-28 animate-pulse rounded bg-surface-container-high" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-container-high" />
              </div>
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-surface-container-high" />
          </div>
        ))}
      </div>
    </section>
  );
}
