"use client";

import { useId, useRef } from "react";

import { jitter, linePath, seeded, smoothPath } from "../../sketch";
import { useBoil } from "../../useBoil";
import { VIEW_H, VIEW_W, type Doodle } from "./doodles";

const FPS = 6;
const WOBBLE = 0.3;

/**
 * One scene: a glowing sky with silhouettes, redrawn a few times a second with
 * fresh wobble so the line feels hand-made.
 */
export function DoodleCard({ doodle }: { doodle: Doodle }) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const tick = useBoil(ref, FPS);
  const rand = seeded(tick * 97 + doodle.id.length);
  const t = tick / FPS;
  const marks = doodle.draw(t);
  const skyId = `${uid}-sky`;

  return (
    <svg ref={ref} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={doodle.label}>
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          {doodle.sky.map((color, i) => (
            <stop key={i} offset={i / (doodle.sky.length - 1)} stopColor={color} />
          ))}
        </linearGradient>
        {marks.map((mark, i) =>
          "glow" in mark ? (
            <radialGradient key={i} id={`${uid}-g${i}`}>
              <stop offset="0" stopColor={mark.glow.color} stopOpacity={mark.glow.opacity ?? 0.8} />
              <stop offset="1" stopColor={mark.glow.color} stopOpacity={0} />
            </radialGradient>
          ) : null,
        )}
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${skyId})`} />

      {marks.map((mark, i) => {
        if ("glow" in mark) {
          const { x, y, r } = mark.glow;
          return <circle key={i} cx={x} cy={y} r={r} fill={`url(#${uid}-g${i})`} />;
        }
        const color = mark.color ?? doodle.ink;
        return (
          <path
            key={i}
            d={(mark.sharp ? linePath : smoothPath)(jitter(mark.points, mark.steady ? 0 : WOBBLE, rand), mark.closed)}
            fill={mark.fill === "ink" ? color : (mark.fill ?? "none")}
            stroke={mark.width === 0 ? "none" : color}
            strokeWidth={mark.width ?? 1.2}
            opacity={mark.opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
