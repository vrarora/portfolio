"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import { useRightPanel } from "@/components/site/RightPanelProvider";

type AskContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  launcherRef: React.RefObject<HTMLButtonElement | null>;
};

const AskContext = createContext<AskContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  launcherRef: { current: null },
});

export function useAsk() {
  return useContext(AskContext);
}

/** Open state for the assistant. Renders inside RightPanelProvider. */
export function AskProvider({ children }: { children: ReactNode }) {
  const { active, show, hide } = useRightPanel();
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const open = active === "ask";

  const setOpen = useCallback((next: boolean) => (next ? show("ask") : hide("ask")), [show, hide]);
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  const value = useMemo(() => ({ open, setOpen, toggle, launcherRef }), [open, setOpen, toggle]);
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}
