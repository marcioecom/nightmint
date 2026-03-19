export function NFTDisplay() {
  return (
    <div className="flex w-full max-h-[50vh] items-center justify-center lg:max-h-none lg:w-[48%]">
      <div className="liquid-glass aspect-square w-full max-w-md rounded-3xl p-6 lg:max-w-none">
        {/* Placeholder NFT - will be replaced with on-chain SVG */}
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#12122a] via-[#1a1a35] to-[#151530]">
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl text-[#2a2a50]">&#9632;</div>
            <span className="text-xs tracking-widest text-[#3a3a5a]">
              ON-CHAIN SVG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
