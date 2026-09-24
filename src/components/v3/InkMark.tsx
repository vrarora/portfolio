"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { jitter, seeded, segment, smoothPath } from "./sketch";

type Kind = "underline" | "highlight";

type Size = { w: number; h: number };

/** Paths for a mark over a box of this size; seeded so it keeps its shape across renders. */
function strokes(kind: Kind, { w, h }: Size, seed: number) {
  const rand = seeded(seed);
  if (kind === "underline") {
    const y = h * 0.86 + 1;
    const line = jitter(segment([-1, y], [w + 1, y - 1], 6), h * 0.03, rand);
    const smear = jitter(segment([-2, y + h * 0.08], [w, y + h * 0.05], 5), h * 0.04, rand);
    return { line: smoothPath(line), smear: smoothPath(smear) };
  }
  // A marker swipe: one pass along the middle of the text, slightly uphill.
  const mid = h * 0.58;
  const swipe = jitter(segment([-2, mid + 1], [w + 2, mid - 1], 5), h * 0.04, rand);
  return { line: smoothPath(swipe), smear: "" };
}

/**
 * Wraps a phrase and draws a hand-drawn underline or marker highlight on it.
 * The mark draws in when `on` turns true, or, with `on` left out, when the phrase scrolls into view.
 */
export function InkMark({ kind, on, seed = 3, children }: { kind: Kind; on?: boolean; seed?: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [seen, setSeen] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (on !== undefined) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on]);

  const drawn = on ?? seen;
  const paths = size ? strokes(kind, size, seed) : null;

  return (
    <span ref={ref} className={`ink ink--${kind}`} data-drawn={drawn ? "" : undefined}>
      {paths && size ? (
        <svg className="ink-svg" width={size.w} height={size.h} aria-hidden="true">
          {paths.smear ? <path className="ink-smear" d={paths.smear} pathLength={1} style={{ strokeWidth: Math.max(2.5, size.h * 0.16) }} /> : null}
          <path className="ink-line" d={paths.line} pathLength={1} style={kind === "highlight" ? { strokeWidth: size.h * 0.62 } : undefined} />
        </svg>
      ) : null}
      <span className="ink-text">{children}</span>
    </span>
  );
}
