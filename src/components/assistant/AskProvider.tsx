"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

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

const PANEL_W = 380;
const READING_MAX = 582;
const MAX_PUSH = 190;

function computePush() {
  const vw = window.innerWidth;
  if (vw < 768) return 0;
  const contentRight = vw / 2 + Math.min(vw, READING_MAX) / 2;
  return -Math.min(MAX_PUSH, Math.max(0, contentRight + 24 - (vw - PANEL_W)));
}

/** Open state for the assistant, plus the page push that makes room for it. */
export function AskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.style.removeProperty("--push");
      root.classList.remove("ask-open");
      return;
    }
    root.classList.add("ask-open");
    const apply = () => root.style.setProperty("--push", `${computePush()}px`);
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.removeProperty("--push");
      root.classList.remove("ask-open");
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((o) => !o), []);
  const value = useMemo(() => ({ open, setOpen, toggle, launcherRef }), [open, toggle]);
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}
