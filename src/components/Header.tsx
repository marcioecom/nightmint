import { IconLayoutGrid } from "@tabler/icons-react";
import { ConnectButton } from "./ConnectButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-zinc-900/50 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <IconLayoutGrid size={24} className="text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-tighter text-white">
            NightMint
          </h1>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
