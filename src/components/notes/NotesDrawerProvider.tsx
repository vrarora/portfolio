"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import { useRightPanel } from "@/components/site/RightPanelProvider";

type NotesDrawerValue = {
  open: boolean;
  close: () => void;
  /** Opens the drawer; focus returns to `trigger` on close. */
  openFrom: (trigger: HTMLElement | null) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const NotesDrawerContext = createContext<NotesDrawerValue>({
  open: false,
  close: () => {},
  openFrom: () => {},
  triggerRef: { current: null },
});

export function useNotesDrawer() {
  return useContext(NotesDrawerContext);
}

/** Open state for the notes drawer. Renders inside RightPanelProvider. */
export function NotesDrawerProvider({ children }: { children: ReactNode }) {
  const { active, show, hide } = useRightPanel();
  const triggerRef = useRef<HTMLElement | null>(null);
  const open = active === "notes";

  const openFrom = useCallback(
    (trigger: HTMLElement | null) => {
      triggerRef.current = trigger;
      show("notes");
    },
    [show],
  );
  const close = useCallback(() => hide("notes"), [hide]);

  const value = useMemo(() => ({ open, close, openFrom, triggerRef }), [open, close, openFrom]);
  return <NotesDrawerContext.Provider value={value}>{children}</NotesDrawerContext.Provider>;
}
