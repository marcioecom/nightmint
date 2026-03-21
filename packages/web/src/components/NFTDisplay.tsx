interface NFTDisplayProps {
  nounId: number;
  imageSrc?: string;
}

export function NFTDisplay({ nounId, imageSrc }: NFTDisplayProps) {
  return (
    <section className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low">
      {imageSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageSrc}
          alt={`NFT #${nounId}`}
          className="h-full w-full object-cover pixel-mask"
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-surface-container" />
      )}
      {/* Live Badge */}
      <div className="glass-panel absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span className="font-headline text-[10px] font-bold uppercase tracking-widest text-primary">
          Live Now
        </span>
      </div>
      {/* NFT Metadata Overlay */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
        <p className="mb-1 font-headline text-sm text-on-surface-variant">
          Daily Mint #{nounId}
        </p>
      </div>
    </section>
  );
}
