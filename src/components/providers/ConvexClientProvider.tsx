"use client";

import dynamic from "next/dynamic";
import type { ConvexReactClient } from "convex/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { convexConfigured, loadConvexClient } from "@/lib/convexClient";

const ConvexProvider = dynamic(() => import("convex/react").then((m) => m.ConvexProvider), { ssr: false });

type ConvexGate = {
  /** True when NEXT_PUBLIC_CONVEX_URL was present at build time. */
  configured: boolean;
  /** True once a client exists. */
  ready: boolean;
  client: ConvexReactClient | null;
  /** Creates the client and opens the socket. Safe to call repeatedly. */
  connect: () => void;
};

const ConvexGateContext = createContext<ConvexGate>({
  configured: false,
  ready: false,
  client: null,
  connect: () => {},
});

/**
 * Holds the Convex client without wrapping the page in a ConvexProvider, so
 * connecting later never remounts the tree. Features that call Convex hooks
 * render inside <ConvexScope>. With no URL configured every consumer sees
 * `configured: false` and shows its static fallback.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const requested = useRef(false);

  const connect = useCallback(() => {
    if (requested.current) return;
    requested.current = true;
    void loadConvexClient().then((next) => {
      if (next) setClient(next);
      else requested.current = false;
    });
  }, []);

  const value = useMemo<ConvexGate>(
    () => ({ configured: convexConfigured, ready: client !== null, client, connect }),
    [client, connect],
  );

  return <ConvexGateContext.Provider value={value}>{children}</ConvexGateContext.Provider>;
}

/** Wraps Convex-hook-using children in a provider. Renders nothing until connected. */
export function ConvexScope({ children }: { children: ReactNode }) {
  const { client } = useContext(ConvexGateContext);
  if (!client) return null;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

export function useConvexGate() {
  return useContext(ConvexGateContext);
}

export function useConvexAvailable() {
  return useContext(ConvexGateContext).configured;
}
