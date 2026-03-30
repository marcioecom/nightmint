"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGavel, IconPhoto, IconBuildingBank, IconUser } from "@tabler/icons-react";

const tabs = [
  { label: "Auction", icon: IconGavel, href: "/", comingSoon: false },
  { label: "Gallery", icon: IconPhoto, href: "/gallery", comingSoon: false },
  { label: "DAO", icon: IconBuildingBank, href: "#", comingSoon: true },
  { label: "Profile", icon: IconUser, href: "/profile", comingSoon: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full rounded-t-[20px] border-t border-zinc-800/30 bg-zinc-900/80 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-around px-4 py-3">
        {tabs.map(({ label, icon: Icon, href, comingSoon }) => {
          const active = href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);

          if (comingSoon) {
            return (
              <div
                key={label}
                className="relative flex flex-col items-center justify-center p-2 text-zinc-700"
              >
                <Icon size={24} className="mb-1" />
                <span className="text-[11px] font-medium uppercase tracking-widest">
                  {label}
                </span>
                <span className="absolute -top-1 -right-1 rounded-full bg-surface-container-highest px-1.5 py-0.5 text-[8px] font-bold text-on-surface-variant">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={href}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
