"use client";

import { useEffect, useState } from "react";

import { useConvexAvailable } from "@/components/providers/ConvexClientProvider";
import { notesCopy } from "@/content/about";
import { useNotesDrawer } from "./NotesDrawerProvider";

import "./notes.css";

/** Right-edge tab that opens the notes drawer. */
export function NotesPeek() {
  const available = useConvexAvailable();
  const { openFrom } = useNotesDrawer();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!available) return null;

  return (
    <button
      type="button"
      className="notes-peek"
      data-visible={visible ? "" : undefined}
      onClick={(event) => openFrom(event.currentTarget)}
      aria-controls="notes-drawer"
      data-fixed-control
    >
      {notesCopy.button}
    </button>
  );
}
