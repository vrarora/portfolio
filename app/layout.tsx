import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../src/styles/tokens.css";
import "../src/styles/data-compass-tokens.css";
import "slot-text/style.css";

import { Providers } from "./providers";
import { AgentationDevtools } from "./agentation-devtools";

export const metadata: Metadata = {
  title: "Vaibhav Arora | Product Design Portfolio",
  description:
    "Vaibhav Arora is a product designer who ships in code. Flat, editorial, high-signal.",
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
          <AgentationDevtools />
        </Providers>
      </body>
    </html>
  );
}
