import { ArrowLeft, ArrowRight } from "lucide-react";

interface AuctionNavProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function AuctionNav({ date, onPrev, onNext, hasPrev, hasNext }: AuctionNavProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className="text-white/40 transition-colors hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="text-white/40 transition-colors hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
      <span className="text-sm text-white/50">{date}</span>
    </div>
  );
}
