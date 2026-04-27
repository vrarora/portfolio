import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../src/styles/tokens.css";

export const metadata: Metadata = {
  title: "Vaibhav Arora Portfolio",
  description:
    "An Oriol-inspired static portfolio for Vaibhav Arora, built for hiring-manager scanning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
