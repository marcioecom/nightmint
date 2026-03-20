"use client";

import { IconGavel, IconPhoto, IconBuildingBank, IconUser } from "@tabler/icons-react";

const tabs = [
  { label: "Auction", icon: IconGavel, active: true },
  { label: "Gallery", icon: IconPhoto, active: false },
  { label: "DAO", icon: IconBuildingBank, active: false },
  { label: "Profile", icon: IconUser, active: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full rounded-t-[20px] border-t border-zinc-800/30 bg-zinc-900/80 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-around px-4 py-3">
        {tabs.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              active
                ? "rounded-xl bg-surface-bright px-5 py-2 text-primary"
                : "p-2 text-zinc-500 hover:text-white"
            }`}
          >
            <Icon size={24} className="mb-1" />
            <span className="text-[11px] font-medium uppercase tracking-widest">
              {label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
