import { VideoBackground } from "@/components/VideoBackground";
import { Navbar } from "@/components/Navbar";
import { NFTDisplay } from "@/components/NFTDisplay";
import { AuctionPanel } from "@/components/AuctionPanel";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col gap-8 px-6 pb-6 lg:flex-row lg:items-center lg:gap-0">
          <NFTDisplay />
          <AuctionPanel />
        </div>
      </div>
    </main>
  );
}
