"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useDonationFlow } from "../flow/DonationFlowProvider";

const DRAW_EASE = [0.22, 1, 0.36, 1] as const;

/** The Kept Promise motif: a stitched coral thread connecting the donor's
 * act to its outcome. Drawn top-down when it enters.
 *
 * The dot pattern is a dashed stroke, and motion's `pathLength` animation
 * works by writing `stroke-dasharray` — animating the dotted line directly
 * would clobber the dots. So the dotted line is static, and a solid line
 * inside an SVG mask does the drawing.
 *
 * The SVG occupies its final height from mount, so sheet height measurement
 * (StepPager's ResizeObserver) never sees a growing pane. */
export function StitchThread({
  length,
  delay = 0,
  duration = 0.45,
  drawn = false,
  className,
}: {
  /** Total height in px. */
  length: number;
  delay?: number;
  duration?: number;
  /** Render fully drawn, no animation (static poses). */
  drawn?: boolean;
  className?: string;
}) {
  const { reducedMotion } = useDonationFlow();
  const rawId = useId();
  const maskId = `ea-stitch-${rawId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const isStatic = drawn || reducedMotion;

  return (
    <svg
      className={className ? `ea-stitch ${className}` : "ea-stitch"}
      width={3}
      height={length}
      viewBox={`0 0 3 ${length}`}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {isStatic ? (
            <rect x="0" y="0" width="3" height={length} fill="#fff" />
          ) : (
            <motion.line
              x1="1.5"
              y1="1.5"
              x2="1.5"
              y2={length - 1.5}
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration, delay, ease: DRAW_EASE }}
            />
          )}
        </mask>
      </defs>
      <line
        x1="1.5"
        y1="1.5"
        x2="1.5"
        y2={length - 1.5}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.1 8"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
