"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { notesCopy } from "@/content/about";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";
import { useNotes } from "./useNotes";

export const COMPOSE_EVENT = "vp:notes:compose";

type Layout = "board" | "stack";

/** Live board. Renders inside ConvexScope. */
export function NotesWall({ layout = "board" }: { layout?: Layout }) {
  const { notes, paused, loading, submit, remove } = useNotes();
  const [composing, setComposing] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    const open = () => setComposing(true);
    window.addEventListener(COMPOSE_EVENT, open);
    return () => window.removeEventListener(COMPOSE_EVENT, open);
  }, []);

  useEffect(() => {
    if (!posted) return;
    const id = window.setTimeout(() => setPosted(false), 4000);
    return () => window.clearTimeout(id);
  }, [posted]);

  const close = useCallback(() => setComposing(false), []);

  return (
    <>
      <div className={`notes-board notes-board--${layout}`} data-loading={loading ? "" : undefined}>
        {notes && notes.length === 0 ? <p className="notes-empty">{notesCopy.empty}</p> : null}
        <AnimatePresence initial={false}>
          {(notes ?? []).map((note) => (
            <NoteCard key={note.id} note={note} layout={layout} onRemove={note.mine ? () => remove(note.id) : undefined} />
          ))}
        </AnimatePresence>
        <div className="notes-board-cta">
          <span className="t-caption notes-board-hint" role="status">
            {posted ? "Pinned. Thanks for stopping by." : paused ? "The wall is closed for a bit." : ""}
          </span>
          <button type="button" className="home-btn" onClick={() => setComposing(true)} disabled={paused}>
            {notesCopy.button}
          </button>
        </div>
      </div>
      <NoteComposer open={composing} onClose={close} onSubmit={submit} onPosted={() => setPosted(true)} />
    </>
  );
}
