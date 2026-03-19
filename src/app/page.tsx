import { VideoBackground } from "@/components/VideoBackground";
import { Navbar } from "@/components/Navbar";
import { NFTDisplay } from "@/components/NFTDisplay";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col gap-8 px-6 pb-6 lg:flex-row lg:gap-0">
          <NFTDisplay />
          <div className="flex-1 text-white/60">
            Auction panel goes here
          </div>
        </div>
      </div>
    </main>
  );
}
