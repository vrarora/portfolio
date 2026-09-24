"use client";

import { useRef } from "react";

import { jitter, seeded, smoothPath } from "../../sketch";
import { useBoil } from "../../useBoil";
import type { Doodle } from "./doodles";

const FPS = 8;

/** One doodle, redrawn a few times a second with fresh wobble so the line feels hand-made. */
export function DoodleCard({ doodle }: { doodle: Doodle }) {
  const ref = useRef<SVGSVGElement>(null);
  const tick = useBoil(ref, FPS);
  const rand = seeded(tick * 97 + doodle.id.length);
  const strokes = doodle.draw(tick / FPS);

  return (
    <svg ref={ref} viewBox="14 10 100 75" role="img" aria-label={doodle.label}>
      {strokes.map((stroke, i) => (
        <path
          key={i}
          d={smoothPath(jitter(stroke.points, 0.45, rand), stroke.closed)}
          fill={stroke.fill ?? "none"}
          stroke={stroke.color ?? "#1c1b1a"}
          strokeWidth={stroke.width ?? 1.8}
          strokeOpacity={stroke.opacity}
          fillOpacity={stroke.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
