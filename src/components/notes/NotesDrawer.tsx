"use client";

import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cue } from "@/components/audio/cues";
import { ConvexScope, useConvexGate } from "@/components/providers/ConvexClientProvider";
import { useReturnFocus } from "@/components/sheet/useReturnFocus";
import { useScrollLock } from "@/components/sheet/useScrollLock";
import { notesCopy } from "@/content/about";
import { seedNotes } from "@/content/notes-seed";
import { EASE_OUT_QUART, SPRING_PANEL, SPRING_SHEET } from "@/styles/motion";
import { NoteCard } from "./NoteCard";
import { useNotesDrawer } from "./NotesDrawerProvider";
import { NotesWall } from "./NotesWall";

import "./notes.css";

type Layout = "board" | "stack";

/** Seed cards while Convex is unavailable. */
function StaticBoard({ layout }: { layout: Layout }) {
  const now = Date.now();
  return (
    <div className={`notes-board notes-board--${layout}`}>
      {seedNotes.map((seed) => (
        <NoteCard key={seed.id} note={{ ...seed, createdAt: now, owner: true }} layout={layout} />
      ))}
      <div className="notes-board-cta">
        <span className="t-caption notes-board-hint">The wall is offline right now.</span>
        <button type="button" className="home-btn" disabled aria-disabled="true">
          {notesCopy.button}
        </button>
      </div>
    </div>
  );
}

/**
 * The notes canvas, sliding in from the right edge over a scrim. Cards keep
 * their scattered board placement; phones get a full-screen stacked sheet.
 */
export function NotesDrawer() {
  const { open, close, triggerRef } = useNotesDrawer();
  const gate = useConvexGate();
  const reduced = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const layout: Layout = mobile ? "stack" : "board";

  useScrollLock(open);
  useReturnFocus(open, () => triggerRef.current);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Connect to Convex the first time the canvas opens, never on page load.
  useEffect(() => {
    if (open && gate.configured && !gate.ready) gate.connect();
  }, [open, gate]);

  useEffect(() => {
    if (!open) return;
    cue("page");
    const onKey = (event: KeyboardEvent) => {
      // The composer dialog handles its own Escape while it is open.
      if (event.key === "Escape" && !document.querySelector("dialog.notes-dialog[open]")) close();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 350);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, close]);

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : mobile
      ? {
          initial: { y: "100%" },
          animate: { y: 0, transition: SPRING_SHEET },
          exit: { y: "100%", transition: { duration: 0.32, ease: EASE_OUT_QUART } },
        }
      : {
          initial: { x: "100%" },
          animate: { x: 0, transition: SPRING_PANEL },
          exit: { x: "100%", transition: { duration: 0.28, ease: EASE_OUT_QUART } },
        };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="notes-scrim"
            className="notes-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={close}
            aria-hidden="true"
          />
          <motion.aside
            key="notes-canvas"
            id="notes-drawer"
            className={`notes-canvas${mobile ? " notes-canvas--sheet" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notes-heading"
            {...panelMotion}
          >
            <header className="notes-canvas-head">
              <div className="notes-canvas-text">
                <h2 id="notes-heading" className="notes-canvas-title">
                  {notesCopy.label}
                </h2>
                <p className="notes-canvas-sub t-caption">{notesCopy.subline}</p>
              </div>
              <button ref={closeRef} type="button" className="notes-canvas-close" onClick={close} aria-label="Close">
                <X size={15} weight="bold" />
              </button>
            </header>
            <div className="notes-canvas-body">
              {gate.configured ? (
                gate.ready ? (
                  <ConvexScope>
                    <NotesWall layout={layout} />
                  </ConvexScope>
                ) : (
                  <div className={`notes-board notes-board--${layout}`} data-loading="" aria-busy="true" />
                )
              ) : (
                <StaticBoard layout={layout} />
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
