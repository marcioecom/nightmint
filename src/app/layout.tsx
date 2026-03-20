import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "NightMint - Daily NFT Auction",
  description: "One NFT minted every 24 hours, auctioned automatically, proceeds to DAO treasury.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body className="bg-background text-on-surface font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
