import { JetBrains_Mono } from "next/font/google";

/** Labels, the section tree and figure numbers. Loaded only by case-study pages. */
export const readerMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
