"use client";

import { useEffect, useRef } from "react";

import { ConvexScope, useConvexGate } from "@/components/providers/ConvexClientProvider";
import { notesCopy } from "@/content/about";
import { seedNotes } from "@/content/notes-seed";
import { NoteCard } from "./NoteCard";
import { NotesWall } from "./NotesWall";

import "./notes.css";

/** Static seed cards when Convex is unavailable; the live wall once the section is near. */
function StaticBoard() {
  const now = Date.now();
  return (
    <div className="notes-board">
      {seedNotes.map((seed) => (
        <NoteCard
          key={seed.id}
          note={{ ...seed, id: seed.id, createdAt: now, owner: true }}
        />
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

export function NotesWallSection() {
  const gate = useConvexGate();
  const ref = useRef<HTMLElement>(null);

  // Connect when the section approaches the viewport, not on page load.
  useEffect(() => {
    if (!gate.configured || gate.ready) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gate.connect();
          io.disconnect();
        }
      },
      { rootMargin: "50%" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gate]);

  return (
    <section ref={ref} className="home-section home-bleed notes-section" id="notes" aria-labelledby="notes-heading">
      <div className="home-work-head">
        <h2 id="notes-heading" className="home-section-heading">
          {notesCopy.label}
        </h2>
        <p className="home-section-intro">{notesCopy.subline}</p>
      </div>
      {gate.configured ? (
        gate.ready ? (
          <ConvexScope>
            <NotesWall />
          </ConvexScope>
        ) : (
          <div className="notes-board" data-loading="" aria-busy="true" />
        )
      ) : (
        <StaticBoard />
      )}
    </section>
  );
}
