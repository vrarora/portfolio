"use client";

import { useNotesDrawer } from "./NotesDrawerProvider";

/** Nav or footer entry that opens the notes drawer in place of a page. */
export function NotesLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, openFrom } = useNotesDrawer();
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => openFrom(event.currentTarget)}
      aria-expanded={open}
      aria-controls="notes-drawer"
    >
      {children}
    </button>
  );
}
