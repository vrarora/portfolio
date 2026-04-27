import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../src/styles/tokens.css";

export const metadata: Metadata = {
  title: "Vaibhav Arora Portfolio",
  description: "Static portfolio foundation for Vaibhav Arora.",
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
