import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/styles/tokens.css";
import "@/styles/layers.css";
import "@/styles/reset.css";
import "slot-text/style.css";

import { Analytics } from "@vercel/analytics/next";
import { AgentationDevtools } from "#agentation-devtools";

import { fontClassName } from "@/styles/fonts";
import { Providers } from "./providers";

const SITE_URL = "https://vrarora.vercel.app";
const TITLE = "Vaibhav Arora, Product Designer";
const DESCRIPTION =
  "Vaibhav Arora is a product designer at IDfy working on privacy and data governance. He ships in code and keeps a wall of experiments.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Vaibhav Arora",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Vaibhav Arora",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vaibhav Arora, product designer at IDfy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfdfc",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={fontClassName}>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
        <AgentationDevtools />
      </body>
    </html>
  );
}
