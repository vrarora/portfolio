"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { applyPanelPush } from "@/lib/panelPush";

export type RightPanel = "ask" | "notes";

/** Panel widths the page shell shifts away from. The notes canvas is modal and needs no push. */
const PANEL_PUSH: Partial<Record<RightPanel, number>> = { ask: 380 };

type RightPanelValue = {
  active: RightPanel | null;
  /** Opens `panel`, closing whichever right-edge panel was open. */
  show: (panel: RightPanel) => void;
  /** Closes `panel` if it is the one open. */
  hide: (panel: RightPanel) => void;
};

const RightPanelContext = createContext<RightPanelValue>({ active: null, show: () => {}, hide: () => {} });

export function useRightPanel() {
  return useContext(RightPanelContext);
}

/**
 * One right-edge panel at a time (assistant or notes). Owns the
 * `<panel>-open` class on <html> and, for pushing panels, the `--push` shift.
 */
export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<RightPanel | null>(null);

  useEffect(() => {
    if (!active) return;
    const className = `${active}-open`;
    const push = PANEL_PUSH[active];
    if (push !== undefined) return applyPanelPush(className, push);
    document.documentElement.classList.add(className);
    return () => document.documentElement.classList.remove(className);
  }, [active]);

  const show = useCallback((panel: RightPanel) => setActive(panel), []);
  const hide = useCallback((panel: RightPanel) => setActive((current) => (current === panel ? null : current)), []);

  const value = useMemo(() => ({ active, show, hide }), [active, show, hide]);
  return <RightPanelContext.Provider value={value}>{children}</RightPanelContext.Provider>;
}
