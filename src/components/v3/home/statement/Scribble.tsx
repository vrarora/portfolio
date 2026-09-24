"use client";

import { useMemo, useRef } from "react";

import { jitter, seeded, smoothPath, type Point } from "../../sketch";
import { useBoil } from "../../useBoil";

const FRAMES = 6;

/** A tangle of line that wanders around a small circle, like a ball of loose thread. */
function tangle(rand: () => number): Point[] {
  const points: Point[] = [];
  let angle = rand() * Math.PI * 2;
  for (let i = 0; i < 34; i++) {
    angle += 1.9 + rand() * 1.4;
    const r = 3 + rand() * 8.5;
    points.push([12 + Math.cos(angle) * r, 12 + Math.sin(angle) * r * 0.9]);
  }
  return points;
}

/** The scribble beside "complexity": the same tangle redrawn a little differently each frame. */
export function Scribble() {
  const ref = useRef<SVGSVGElement>(null);
  const tick = useBoil(ref, 7);

  const frames = useMemo(() => {
    const base = tangle(seeded(7));
    return Array.from({ length: FRAMES }, (_, i) => smoothPath(jitter(base, 0.9, seeded(40 + i))));
  }, []);

  return (
    <svg ref={ref} className="st-scribble" viewBox="0 0 24 24" aria-hidden="true">
      <path d={frames[tick % FRAMES]} />
    </svg>
  );
}
