"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { STAMP_LAND } from "./keepsakeTiming";

const STAMP_SPRING = { type: "spring", stiffness: 420, damping: 22 } as const;

/** Ink specks thrown at contact — just outside the stamp's rings. */
const SPECKS: ReadonlyArray<readonly [number, number, number]> = [
  [7, 72, 1.5],
  [88, 27, 1.2],
  [76, 88, 1.0],
];

/** The certifying rubber stamp. Slams in with a spring, edges roughened by
 * displacement, ink patchily erased by a second turbulence taken into alpha
 * (feComposite "out") — real ink, not clean vectors. Position and size come
 * from the host's `.ea-stamp` styling context. */
export function InkStamp({ delay }: { delay: number }) {
  const rawId = useId();
  const inkId = `ea-ink-${rawId.replace(/[^a-zA-Z0-9-]/g, "")}`;

  return (
    <motion.span
      className="ea-stamp"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 2.1, rotate: 5 }}
      animate={{ opacity: 1, scale: 1, rotate: -11 }}
      transition={{
        ...STAMP_SPRING,
        delay,
        opacity: { duration: 0.16, delay, ease: "easeOut" },
      }}
    >
      <svg viewBox="0 0 96 96" overflow="visible">
        <defs>
          <path
            id={`${inkId}-arc`}
            d="M48 12 a36 36 0 1 1 -0.01 0"
            fill="none"
          />
          <filter id={inkId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="7"
              result="rough"
            />
            <feDisplacementMap in="SourceGraphic" in2="rough" scale="1.8" result="disp" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.14 0.11"
              numOctaves="2"
              seed="3"
              result="patch"
            />
            <feColorMatrix
              in="patch"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0 0 0 -0.08"
              result="patchA"
            />
            <feComposite in="disp" in2="patchA" operator="out" />
          </filter>
        </defs>
        <g filter={`url(#${inkId})`}>
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle
            cx="48"
            cy="48"
            r="33"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <text className="ea-stamp-text">
            <textPath href={`#${inkId}-arc`} startOffset="0%">
              GIFT RECEIVED • WITH THANKS • GIFT RECEIVED •
            </textPath>
          </text>
          <path
            d="M48 56.5 L41 49.5 a4.6 4.6 0 1 1 7 -6 a4.6 4.6 0 1 1 7 6 Z"
            fill="currentColor"
          />
          {SPECKS.map(([cx, cy, r], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="currentColor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{
                duration: 0.28,
                delay: delay + STAMP_LAND + 0.04 + i * 0.05,
                ease: "easeOut",
              }}
            />
          ))}
        </g>
      </svg>
    </motion.span>
  );
}
