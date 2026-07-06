"use client";

import { fraunces } from "@/components/equalall/fonts";
import { useInViewReveal } from "./useInViewReveal";

/**
 * "A gift is a race against a fading feeling" — the case study's spine, drawn.
 *
 * Emotional intensity peaks the instant the ad lands and decays across the
 * steps the old flow asked the donor to complete. The design's job is the
 * highlighted early window: catch the gift before the feeling cools, well
 * before the point where the checkout used to ask for it.
 *
 * Pure SVG so it scales crisply and carries no `<p>` that the case-study
 * page's body typography could recolor. Warm Paper & Glass palette, shared
 * with the EqualAll mockup.
 */

const PLOT = { left: 96, right: 772, top: 74, bottom: 384 } as const;
const W = PLOT.right - PLOT.left;
const H = PLOT.bottom - PLOT.top;

const x = (t: number) => PLOT.left + W * t;
const y = (intensity: number) => PLOT.bottom - H * intensity;

// [journey fraction, emotional intensity]
const CURVE: [number, number][] = [
  [0.0, 0.95],
  [0.12, 0.9],
  [0.28, 0.72],
  [0.45, 0.53],
  [0.55, 0.45],
  [0.7, 0.33],
  [0.82, 0.25],
  [1.0, 0.17],
];

const STEPS: [number, string][] = [
  [0.0, "The ad"],
  [0.5, "Chooses an amount"],
  [0.9, "Enters payment"],
];

const CATCH_END = 0.18; // early window the design fights to win
const RECEDED = 0.82; // where the old flow finally asked

/** Catmull-Rom spline through the points, emitted as smooth cubic beziers. */
function smoothPath(pts: [number, number][]): string {
  const p = pts.map(([t, i]) => [x(t), y(i)] as const);
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let k = 0; k < p.length - 1; k++) {
    const p0 = p[k - 1] ?? p[k];
    const p1 = p[k];
    const p2 = p[k + 1];
    const p3 = p[k + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const curveD = smoothPath(CURVE);
const areaD = `${curveD} L ${x(1)} ${PLOT.bottom} L ${x(0)} ${PLOT.bottom} Z`;
const peak = { x: x(CURVE[0][0]), y: y(CURVE[0][1]) };
const recededPt = { x: x(RECEDED), y: y(0.25) };

export default function EqualAllFadingFeelingVisual() {
  const { ref, phase } = useInViewReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`eaff ${fraunces.variable}`}
      data-phase={phase}
      data-case-reveal
    >
      <svg viewBox="0 0 820 470" role="img" aria-label="A line chart of emotional intensity over the donor's journey: it peaks the moment the ad lands and fades through choosing an amount and entering payment. An early window is highlighted as the moment to catch the gift before the feeling cools.">
        <defs>
          <linearGradient id="eaff-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e05430" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#e05430" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eaff-curve-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e05430" />
            <stop offset="100%" stopColor="#c88a6f" />
          </linearGradient>
        </defs>

        {/* baseline + y axis */}
        <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke="#e2d9cb" strokeWidth="1.5" />
        <line x1={PLOT.left} y1={PLOT.top - 6} x2={PLOT.left} y2={PLOT.bottom} stroke="#e2d9cb" strokeWidth="1.5" />
        <text
          className="eaff-axis"
          x={34}
          y={(PLOT.top + PLOT.bottom) / 2}
          transform={`rotate(-90 34 ${(PLOT.top + PLOT.bottom) / 2})`}
          textAnchor="middle"
        >
          Emotional intensity
        </text>

        {/* the window the design fights to win */}
        <g className="eaff-fade eaff-window" style={{ ["--d" as string]: "1.35s" }}>
          <rect
            x={x(0)}
            y={PLOT.top - 6}
            width={x(CATCH_END) - x(0)}
            height={PLOT.bottom - (PLOT.top - 6)}
            fill="#e05430"
            fillOpacity="0.08"
          />
          <line x1={x(CATCH_END)} y1={PLOT.top - 6} x2={x(CATCH_END)} y2={PLOT.bottom} stroke="#e05430" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 4" />
          <text className="eaff-catch" x={x(0.02)} y={PLOT.top + 168}>
            <tspan x={x(0.02)} dy="0">Catch the gift</tspan>
            <tspan x={x(0.02)} dy="20">before it cools</tspan>
          </text>
        </g>

        {/* area + decay curve */}
        <path className="eaff-area" d={areaD} fill="url(#eaff-area-grad)" />
        <path
          id="eaff-curve-path"
          className="eaff-curve"
          d={curveD}
          fill="none"
          stroke="url(#eaff-curve-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={1}
        />

        {/* where the old flow finally asked — the feeling has receded. The
            note floats in the open space above the low tail of the curve, with
            a leader up from the marker, so it never sits on the line. */}
        <g className="eaff-fade eaff-late" style={{ ["--d" as string]: "1.5s" }}>
          <line x1={recededPt.x} y1={recededPt.y - 8} x2={recededPt.x} y2={186} stroke="#a09786" strokeWidth="1.5" strokeDasharray="3 4" />
          <circle cx={recededPt.x} cy={recededPt.y} r="5" fill="#faf8f4" stroke="#a09786" strokeWidth="2" />
          <text className="eaff-note" x={recededPt.x} y={156} textAnchor="middle">
            <tspan x={recededPt.x} dy="0">By here, the wave</tspan>
            <tspan x={recededPt.x} dy="16">has receded</tspan>
          </text>
        </g>

        {/* peak label */}
        <text className="eaff-fade eaff-peak-label" x={peak.x + 16} y={peak.y - 6} style={{ ["--d" as string]: "1.2s" }}>
          The feeling, at its peak
        </text>

        {/* The feeling itself: a pulsing dot that rides DOWN the curve while
            playing — starting at the peak and cooling until it comes to rest at
            the "wave has receded" marker (~0.83 along the curve), then freezes.
            Reduced motion / off-screen shows it resting at the peak. */}
        {phase === "play" ? (
          <g className="eaff-traveler" opacity="0">
            <circle className="eaff-traveler-ring" cx="0" cy="0" r="9" fill="#e05430" fillOpacity="0.45" />
            <circle cx="0" cy="0" r="6" fill="#e05430" stroke="#faf8f4" strokeWidth="2" />
            <animate
              attributeName="opacity"
              dur="3.2s"
              begin="1.5s"
              fill="freeze"
              values="0;1;1"
              keyTimes="0;0.12;1"
            />
            <animateMotion
              dur="3.2s"
              begin="1.5s"
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keyPoints="0;0.83"
              keySplines="0.4 0 0.5 1"
            >
              <mpath href="#eaff-curve-path" />
            </animateMotion>
          </g>
        ) : (
          <circle cx={peak.x} cy={peak.y} r="6" fill="#e05430" stroke="#faf8f4" strokeWidth="2" />
        )}

        {/* journey steps */}
        {STEPS.map(([t, label]) => (
          <g key={label} className="eaff-fade eaff-step" style={{ ["--d" as string]: "1.55s" }}>
            <line x1={x(t)} y1={PLOT.bottom} x2={x(t)} y2={PLOT.bottom + 7} stroke="#c9bda9" strokeWidth="1.5" />
            <text className="eaff-axis" x={x(t)} y={PLOT.bottom + 24} textAnchor={t === 0 ? "start" : t === STEPS[STEPS.length - 1][0] ? "end" : "middle"}>
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
