import Image from "next/image";
import { ConnectButton } from "./ConnectButton";

export function NFTDisplay() {
  return (
    <div className="relative w-full lg:w-[52%] lg:min-h-[calc(100vh-0px)]">
      {/* Floating glass overlay panel */}
      <div className="liquid-glass-strong absolute inset-3 rounded-3xl lg:inset-5">
        <div className="flex h-full flex-col">
          {/* Nav inside left panel */}
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
            <ConnectButton />
          </div>

          {/* NFT centered in the panel */}
          <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
            <div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://ipfs.io/ipfs/QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8"
                alt="NFT #42 - Pug"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
