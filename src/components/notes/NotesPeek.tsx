"use client";

import { useEffect, useState } from "react";

import { useConvexAvailable, useConvexGate } from "@/components/providers/ConvexClientProvider";
import { COMPOSE_EVENT } from "./NotesWall";

import "./notes.css";

/** Right-edge tab that scrolls to the wall and opens the composer. */
export function NotesPeek() {
  const available = useConvexAvailable();
  const gate = useConvexGate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!available) return null;

  const go = () => {
    gate.connect();
    const target = document.getElementById("notes");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => window.dispatchEvent(new CustomEvent(COMPOSE_EVENT)), 500);
    } else {
      window.location.href = "/#notes";
    }
  };

  return (
    <button type="button" className="notes-peek" data-visible={visible ? "" : undefined} onClick={go} data-fixed-control>
      Leave a note
    </button>
  );
}
