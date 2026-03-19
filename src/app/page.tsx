import { VideoBackground } from "@/components/VideoBackground";
import { NFTDisplay } from "@/components/NFTDisplay";
import { AuctionPanel } from "@/components/AuctionPanel";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <NFTDisplay />
        <AuctionPanel />
      </div>
    </main>
  );
}
