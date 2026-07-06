import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../src/styles/tokens.css";
import "../src/styles/data-compass-tokens.css";
import "slot-text/style.css";

import { Providers } from "./providers";
import AgentationDevtools from "#agentation-devtools";

const SITE_URL = "https://vrarora.vercel.app";
const OG_DESCRIPTION =
  "Systems-minded designer who ships in code. Flat, editorial, high-signal.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vaibhav Arora | Product Design Portfolio",
  description:
    "Vaibhav Arora is a product designer who ships in code. Flat, editorial, high-signal.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Vaibhav Arora",
    title: "Vaibhav Arora | Product Design Portfolio",
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vaibhav Arora — systems-minded product designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaibhav Arora | Product Design Portfolio",
    description: OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <AgentationDevtools />
      </body>
    </html>
  );
}
