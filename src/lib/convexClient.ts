import { ConvexReactClient } from "convex/react";

export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

export const convexConfigured = CONVEX_URL.length > 0;

let client: ConvexReactClient | null = null;

/** Builds the client once, in the browser, only when a feature asks for it. */
export function getConvexClient(): ConvexReactClient | null {
  if (!convexConfigured || typeof window === "undefined") return null;
  if (!client) client = new ConvexReactClient(CONVEX_URL);
  return client;
}
