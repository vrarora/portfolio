import type { ConvexReactClient } from "convex/react";

export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

export const convexConfigured = CONVEX_URL.length > 0;

let client: ConvexReactClient | null = null;
let loading: Promise<ConvexReactClient | null> | null = null;

/** Loads convex/react and builds the client once, in the browser, only when a feature asks for it. */
export function loadConvexClient(): Promise<ConvexReactClient | null> {
  if (!convexConfigured || typeof window === "undefined") return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (!loading) {
    loading = import("convex/react").then(({ ConvexReactClient }) => {
      client = new ConvexReactClient(CONVEX_URL);
      return client;
    });
  }
  return loading;
}
