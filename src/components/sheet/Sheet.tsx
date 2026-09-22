"use client";

import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PanInfo } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { cue } from "@/components/audio/cues";
import { ScrollRootContext } from "@/components/case-study/ScrollRootContext";
import { EASE_OUT_QUART, SPRING_SHEET } from "@/styles/motion";
import { useReturnFocus } from "./useReturnFocus";
import { useScrollLock } from "./useScrollLock";

import "./sheet.css";

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Element that regains focus on close when the trigger is gone. */
  fallbackFocus?: () => HTMLElement | null;
  children: ReactNode;
};

const INERT_SELECTOR = "#page-shell, .site-footer, [data-fixed-control]";

function setBackgroundInert(inert: boolean) {
  document.querySelectorAll<HTMLElement>(INERT_SELECTOR).forEach((el) => {
    if (inert) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  });
}

export function Sheet({ open, onClose, title, subtitle, fallbackFocus, children }: SheetProps) {
  const reduced = useReducedMotion();
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setRoot(document.getElementById("sheet-root"));
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useScrollLock(open);
  useReturnFocus(open, fallbackFocus);

  useEffect(() => {
    if (!open) return;
    cue("page");
    setBackgroundInert(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30);
    return () => {
      setBackgroundInert(false);
      cue("release");
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  const onBodyScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const next = el.scrollTop > 8;
    setScrolled((prev) => (prev === next ? prev : next));
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 800) onClose();
  };

  if (!root) return null;

  const panelMotion = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0, transition: SPRING_SHEET },
        exit: { y: "100%", transition: { duration: 0.36, ease: EASE_OUT_QUART } },
      };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="scrim"
            className="sheet-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.dialog
            key="panel"
            open
            className="sheet-panel"
            aria-modal="true"
            aria-labelledby={titleId}
            data-scrolled={scrolled ? "" : undefined}
            drag={coarse && !reduced ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={onDragEnd}
            {...panelMotion}
          >
            {coarse ? <span className="sheet-grabber" aria-hidden="true" /> : null}
            <header className="sheet-head">
              <div className="sheet-head-text">
                <h2 id={titleId} className="sheet-title">
                  {title}
                </h2>
                {subtitle ? <p className="sheet-subtitle t-caption">{subtitle}</p> : null}
              </div>
              <button ref={closeRef} type="button" className="sheet-close" onClick={onClose} aria-label="Close">
                <X size={16} weight="bold" />
              </button>
            </header>
            <motion.div
              ref={bodyRef}
              className="sheet-body"
              onScroll={onBodyScroll}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.24, delay: reduced ? 0 : 0.12 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <ScrollRootContext.Provider value={bodyRef}>{children}</ScrollRootContext.Provider>
            </motion.div>
          </motion.dialog>
        </>
      ) : null}
    </AnimatePresence>,
    root,
  );
}
