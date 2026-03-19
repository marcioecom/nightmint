import { VideoBackground } from "@/components/VideoBackground";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="px-6 py-12 text-white/60">
          Auction content goes here
        </div>
      </div>
    </main>
  );
}
