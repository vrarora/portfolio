"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import { NOTE_COLORS, NOTE_NAME_MAX, NOTE_POINTS_TOTAL_MAX, NOTE_STROKES_MAX, NOTE_TEXT_MAX } from "@/shared/limits";
import type { NoteColor } from "@/shared/limits";
import { countPoints } from "@/shared/strokeCodec";
import type { Stroke } from "@/shared/strokeCodec";
import { validateNoteInput } from "@/shared/textFilters";
import { DoodleCanvas } from "./DoodleCanvas";
import type { PostInput, PostOutcome } from "./useNotes";

export const notesValidationCopy = {
  empty: "Write or draw something before pinning.",
  text_long: `Keep it under ${NOTE_TEXT_MAX} characters.`,
  name_long: `Names stop at ${NOTE_NAME_MAX} characters.`,
  url: "Links don't go on the wall. Words and doodles only.",
  blocked: "That one won't make it onto the wall. Try again?",
  doodle_large: "That drawing is a bit much for the wall. Fewer strokes?",
  duplicate: "You already pinned that one.",
  rate_limited: "You left a note a moment ago. Give it a little while.",
  daily: "Three notes a day is the limit. Come back tomorrow.",
  global: "The wall is busy right now. Try again in a little while.",
  network: "The wall didn't take that. Try once more.",
  paused: "The wall is closed for a bit. Come back later.",
  invalid: "The wall didn't take that. Try once more.",
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: PostInput) => Promise<PostOutcome>;
  onPosted: () => void;
};

export function NoteComposer({ open, onClose, onSubmit, onPosted }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState<NoteColor>("paper");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ids = { name: useId(), text: useId(), error: useId(), title: useId() };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const reset = () => {
    setName("");
    setText("");
    setStrokes([]);
    setColor("paper");
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const check = validateNoteInput({
      text,
      name,
      strokeCount: strokes.length,
      pointCount: countPoints(strokes),
      limits: { textMax: NOTE_TEXT_MAX, nameMax: NOTE_NAME_MAX, strokesMax: NOTE_STROKES_MAX, pointsMax: NOTE_POINTS_TOTAL_MAX },
    });
    if (!check.ok) {
      setError(notesValidationCopy[check.reason]);
      return;
    }
    setBusy(true);
    setError(null);
    const outcome = await onSubmit({ authorName: name, text, strokes, color, website });
    setBusy(false);
    if (outcome.ok) {
      reset();
      onPosted();
      onClose();
      return;
    }
    if (outcome.reason === "rate_limited") {
      const daily = (outcome.retryAfter ?? 0) > 60 * 60 * 1000;
      setError(outcome.scope === "global" ? notesValidationCopy.global : daily ? notesValidationCopy.daily : notesValidationCopy.rate_limited);
      return;
    }
    if (outcome.reason === "blocked") {
      setError(outcome.detail === "url" ? notesValidationCopy.url : notesValidationCopy.blocked);
      return;
    }
    if (outcome.reason === "invalid" && outcome.detail === "duplicate") {
      setError(notesValidationCopy.duplicate);
      return;
    }
    setError(notesValidationCopy[outcome.reason] ?? notesValidationCopy.network);
  };

  return (
    <dialog
      ref={dialogRef}
      className="notes-dialog"
      aria-labelledby={ids.title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="notes-form" onSubmit={submit} noValidate>
        <div className="notes-form-head">
          <h2 id={ids.title} className="notes-form-title">
            Leave a note
          </h2>
          <button type="button" className="notes-form-cancel link-quiet" onClick={onClose}>
            Never mind
          </button>
        </div>

        <div className="notes-form-body">
          <div className="notes-form-fields">
            <label className="notes-field">
              <span className="t-caption notes-field-label">Name</span>
              <input
                id={ids.name}
                type="text"
                value={name}
                maxLength={NOTE_NAME_MAX}
                placeholder="Your name, or leave it blank"
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="notes-field">
              <span className="t-caption notes-field-label">
                Note <span className="notes-count t-num">{text.length}/{NOTE_TEXT_MAX}</span>
              </span>
              <textarea
                id={ids.text}
                value={text}
                maxLength={NOTE_TEXT_MAX}
                rows={4}
                placeholder="Something short. A line or two is plenty."
                onChange={(e) => setText(e.target.value)}
                aria-describedby={error ? ids.error : undefined}
              />
            </label>
            <fieldset className="notes-colors">
              <legend className="t-caption notes-field-label">Paper</legend>
              {NOTE_COLORS.map((c) => (
                <label key={c} className={`notes-color notes-card--${c}`} title={c}>
                  <input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} />
                  <span className="visually-hidden">{c}</span>
                </label>
              ))}
            </fieldset>
            {/* Honeypot: hidden from people, filled by bots. */}
            <label className="notes-honeypot" aria-hidden="true">
              Website
              <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>
          <div className="notes-form-doodle">
            <span className="t-caption notes-field-label">Or draw something small</span>
            <DoodleCanvas strokes={strokes} onChange={setStrokes} />
          </div>
        </div>

        <div className="notes-form-foot">
          <p id={ids.error} className="notes-error t-caption" role="alert">
            {error}
          </p>
          <button type="submit" className="home-btn notes-submit" disabled={busy}>
            {busy ? "Pinning" : "Pin it"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
