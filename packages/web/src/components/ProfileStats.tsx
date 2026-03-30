interface ProfileStatsProps {
  nftCount: number;
  totalSpent: string;
}

export function ProfileStats({ nftCount, totalSpent }: ProfileStatsProps) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-4">
      <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-5">
        <span className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          NFTs Owned
        </span>
        <span className="font-headline text-3xl font-bold text-primary">
          {nftCount}
        </span>
      </div>
      <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-5">
        <span className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Total Spent
        </span>
        <div>
          <span className="font-headline text-3xl font-bold text-secondary">
            {parseFloat(totalSpent).toFixed(2)}
          </span>
          <span className="ml-1 font-headline text-lg font-bold text-secondary">
            ETH
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="mb-10 grid grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-surface-container-low p-5">
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-surface-container" />
          <div className="h-9 w-16 animate-pulse rounded bg-surface-container" />
        </div>
      ))}
    </div>
  );
}
