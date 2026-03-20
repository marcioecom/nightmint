import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AuctionPanel } from "@/components/AuctionPanel";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-md space-y-8 px-4 pt-24 pb-32">
        <AuctionPanel />
      </main>
      <BottomNav />
    </>
  );
}
