export function NFTDisplay() {
  return (
    <div className="relative w-full lg:w-[52%] lg:min-h-[calc(100vh-72px)]">
      {/* Floating glass overlay panel - matches Bloom's inset glass effect */}
      <div className="liquid-glass-strong absolute inset-3 rounded-3xl lg:inset-5">
        <div className="flex h-full flex-col">
          {/* Navbar area inside left panel */}
          <div className="flex items-center justify-between px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center">
                <div className="grid h-6 w-6 grid-cols-2 gap-0.5">
                  <div className="rounded-sm bg-white/90" />
                  <div className="rounded-sm bg-white/60" />
                  <div className="rounded-sm bg-white/60" />
                  <div className="rounded-sm bg-white/40" />
                </div>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                nightmint
              </span>
            </div>
            <button className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-transform hover:scale-105">
              Connect Wallet
            </button>
          </div>

          {/* NFT centered in the panel */}
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="aspect-square w-full max-w-sm">
              {/* Placeholder NFT */}
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f1225] via-[#161835] to-[#0d0f28]">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-6xl text-white/10">&#9632;</div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                    On-chain SVG
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
