"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import "./board.css";

/** The board needs room and motion. Everyone else reads the case study. */
const BOARD_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

type Mode = "board" | "read" | "pending";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(BOARD_QUERY);
  media.addEventListener("change", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function mode(): Mode {
  if (new URLSearchParams(window.location.search).has("read")) return "read";
  return window.matchMedia(BOARD_QUERY).matches ? "board" : "read";
}

/**
 * Picks between the scroll board and the reading version. Before hydration
 * both render and CSS picks one, so neither layout flashes on first paint.
 */
export function StudyExperience({ board, reader }: { board: ReactNode; reader: ReactNode }) {
  const current = useSyncExternalStore(subscribe, mode, () => "pending" as Mode);

  return (
    <div className="study-experience" data-mode={current}>
      {current !== "read" && <div className="study-board">{board}</div>}
      {current !== "board" && <div className="study-reader">{reader}</div>}
    </div>
  );
}
