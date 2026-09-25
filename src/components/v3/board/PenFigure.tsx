"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { STORIES, type StoryId } from "./stories";
import { InkDrawing } from "./ink";
import type { Script } from "./timeline";
import "./pen-figure.css";

/** Seconds between one drawing starting and the next. */
const STAGGER = 0.09;

const scripts = new Map<StoryId, Script>();

/** Builds each story once per page, however many figures read from it. */
function scriptFor(story: StoryId) {
  let script = scripts.get(story);
  if (!script) {
    script = STORIES[story].build({});
    scripts.set(story, script);
  }
  return script;
}

/**
 * One board diagram, cropped for the reading version. The pen draws it in
 * order the first time it scrolls into view.
 */
export function PenFigure({ story, id }: { story: StoryId; id: string }) {
  const script = scriptFor(story);
  const rect = script.figures?.[id];
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^\w-]/g, "");
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!rect) return null;

  // Drawings and art share one running order, the order the board shows them in

  const drawings = script.drawings.filter((d) => d.figure === id);
  const frames = script.frames.filter((f) => f.figure === id);
  const order = new Map<string, number>();
  for (const step of script.steps) {
    const key = step.kind === "draw" ? step.id : step.kind === "show" ? step.frame : undefined;
    if (key && !order.has(key)) order.set(key, order.size);
  }
  const first = Math.min(...[...drawings.map((d) => d.id), ...frames.map((f) => f.id)].map((k) => order.get(k) ?? 0));
  const delay = (key: string) => ({ "--pen-delay": `${(((order.get(key) ?? first) - first) * STAGGER).toFixed(2)}s` }) as CSSProperties;

  return (
    <svg
      ref={ref}
      className="pen-figure"
      data-drawn={drawn}
      viewBox={`${rect.x} ${rect.y} ${rect.w} ${rect.h}`}
      aria-hidden="true"
    >
      {frames.map((f) => (
        <g key={f.id} className="pen-figure-art" style={delay(f.id)}>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={24} />
          <image href={f.snaps[0]} x={f.x} y={f.y} width={f.w} height={f.h} preserveAspectRatio="xMidYMid meet" />
        </g>
      ))}
      {drawings.map((d, i) => (
        <InkDrawing key={d.id} drawing={d} maskId={`${uid}-ink-${i}`} penLength={1} style={delay(d.id)} />
      ))}
    </svg>
  );
}
