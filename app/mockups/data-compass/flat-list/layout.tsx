import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

const sans = Inter({ subsets: ["latin"], variable: "--fl-font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--fl-font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Explore, flat list",
  robots: { index: false, follow: false },
};

export default function FlatListLayout({ children }: { children: ReactNode }) {
  return <div className={`${sans.variable} ${mono.variable}`}>{children}</div>;
}
