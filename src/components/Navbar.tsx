export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-white" />
        <span className="text-xl font-semibold tracking-tight text-white">
          nightmint
        </span>
      </div>
      <button className="liquid-glass rounded-full px-5 py-2 text-sm text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
        Connect Wallet
      </button>
    </nav>
  );
}
