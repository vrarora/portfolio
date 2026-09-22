"use client";

import { ConvexProvider } from "convex/react";
import type { ConvexReactClient } from "convex/react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { convexConfigured, getConvexClient } from "@/lib/convexClient";

type ConvexGate = {
  /** True when NEXT_PUBLIC_CONVEX_URL was present at build time. */
  configured: boolean;
  /** True once a client exists and children sit under a ConvexProvider. */
  ready: boolean;
  /** Creates the client and opens the socket. Safe to call repeatedly. */
  connect: () => void;
};

const ConvexGateContext = createContext<ConvexGate>({
  configured: false,
  ready: false,
  connect: () => {},
});

/**
 * Wraps the app in a ConvexProvider only after a feature asks for it, so
 * pages that never touch the assistant or the notes wall open no socket.
 * With no URL configured every consumer sees `configured: false` and
 * renders its static fallback.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  const connect = useCallback(() => {
    if (client) return;
    const next = getConvexClient();
    if (next) setClient(next);
  }, [client]);

  const value = useMemo<ConvexGate>(
    () => ({ configured: convexConfigured, ready: client !== null, connect }),
    [client, connect],
  );

  return (
    <ConvexGateContext.Provider value={value}>
      {client ? <ConvexProvider client={client}>{children}</ConvexProvider> : children}
    </ConvexGateContext.Provider>
  );
}

export function useConvexGate() {
  return useContext(ConvexGateContext);
}

export function useConvexAvailable() {
  return useContext(ConvexGateContext).configured;
}
