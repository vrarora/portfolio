"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";

import type { NoteColor } from "@/shared/limits";
import type { Stroke } from "@/shared/strokeCodec";
import { SPRING_POP } from "@/styles/motion";
import { DoodleSvg } from "./DoodleSvg";

export type NoteView = {
  id: string;
  authorName: string;
  text: string;
  strokes?: Stroke[];
  color: NoteColor;
  x: number;
  y: number;
  rotation: number;
  createdAt: number;
  owner?: boolean;
  mine?: boolean;
};

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(ms));
}

export function NoteCard({ note, onRemove, layout = "board" }: { note: NoteView; onRemove?: () => void; layout?: "board" | "stack" }) {
  const style: CSSProperties & Record<string, string> = {
    "--x": `${note.x * 100}%`,
    "--y": `${note.y * 100}%`,
    "--rot": `${note.rotation}deg`,
  };
  return (
    <motion.article
      className={`notes-card notes-card--${note.color} notes-card--${layout}`}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: SPRING_POP }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
      layout={layout === "stack"}
    >
      {note.strokes && note.strokes.length > 0 ? <DoodleSvg className="notes-card-doodle" strokes={note.strokes} /> : null}
      {note.text ? <p className="notes-card-text">{note.text}</p> : null}
      <p className="notes-card-meta t-caption">
        <span className="notes-card-author">{note.authorName}</span>
        {note.owner ? <span className="notes-owner">me</span> : null}
        <span className="notes-card-date"> · {formatDate(note.createdAt)}</span>
        {note.mine && onRemove ? (
          <button type="button" className="notes-card-remove" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </p>
    </motion.article>
  );
}
