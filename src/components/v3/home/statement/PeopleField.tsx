"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";

import { DoodleCard } from "./DoodleCard";
import { DOODLES } from "./doodles";

/** Where each card lands, in viewport units, kept clear of the word in the middle. */
const SPOTS = [
  { x: 10, y: 20, r: -7, s: 0.94 },
  { x: 25, y: 11, r: 5, s: 0.84 },
  { x: 76, y: 14, r: 4, s: 0.9 },
  { x: 89, y: 30, r: -5, s: 0.84 },
  { x: 13, y: 58, r: 6, s: 0.9 },
  { x: 82, y: 62, r: -7, s: 1.02 },
  { x: 66, y: 82, r: 5, s: 0.86 },
  { x: 32, y: 83, r: -4, s: 0.92 },
] as const;

type Label = { left: number; top: number; size: string; weight: string; family: string; lineHeight: string; spacing: string };

/**
 * The people behind the work. The page blurs, the word stays in place, and
 * hand-drawn cards settle around it. The word, the scrim or Escape closes it.
 */
export function PeopleField({ anchor, onClose }: { anchor: RefObject<HTMLElement | null>; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [label, setLabel] = useState<Label | null>(null);
  const [visible, setVisible] = useState(false);

  // Sit the word exactly where it is on the page, in the same type.
  useLayoutEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    setLabel({
      left: rect.left,
      top: rect.top,
      size: style.fontSize,
      weight: style.fontWeight,
      family: style.fontFamily,
      lineHeight: style.lineHeight,
      spacing: style.letterSpacing,
    });
  }, [anchor]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-people-open");
    const frame = requestAnimationFrame(() => setVisible(true));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // The word is the only control, so focus stays on it.
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("is-people-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (label) closeRef.current?.focus({ preventScroll: true });
  }, [label]);

  return createPortal(
    <div className="pf" data-visible={visible ? "" : undefined} role="dialog" aria-modal="true" aria-label="The people I design for">
      <div className="pf-scrim" onClick={onClose} aria-hidden="true" />
      {DOODLES.map((doodle, i) => {
        const spot = SPOTS[i % SPOTS.length];
        const style = { "--x": `${spot.x}vw`, "--y": `${spot.y}vh`, "--r": `${spot.r}deg`, "--s": spot.s, "--delay": `${i * 50}ms` } as CSSProperties;
        return (
          <figure key={doodle.id} className="pf-card" style={style}>
            <DoodleCard doodle={doodle} />
          </figure>
        );
      })}
      {label ? (
        <button
          ref={closeRef}
          type="button"
          className="pf-word"
          style={{
            left: label.left,
            top: label.top,
            fontSize: label.size,
            fontWeight: label.weight,
            fontFamily: label.family,
            lineHeight: label.lineHeight,
            letterSpacing: label.spacing,
          }}
          onClick={onClose}
          aria-label="Close the people"
        >
          people
        </button>
      ) : null}
    </div>,
    document.body,
  );
}
