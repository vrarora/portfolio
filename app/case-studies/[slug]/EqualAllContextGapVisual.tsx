"use client";

import { fraunces } from "@/components/equalall/fonts";
import { useInViewReveal } from "./useInViewReveal";

/**
 * The Context gap: donors arrived, scrolled deep, and were clearly moved, yet
 * gave below Ketto's own benchmark. Engagement bars stay tall; the giving bar
 * drops short of the dashed benchmark line, and the shortfall is the story.
 *
 * Deliberately number-free — the honesty guardrails keep the benchmark
 * qualitative (no raw conversion figures, revenue as a lift percentage only).
 */

const PLOT = { left: 96, right: 772, top: 96, bottom: 384 } as const;
const W = PLOT.right - PLOT.left;
const MAX_H = PLOT.bottom - PLOT.top;

const barTop = (v: number) => PLOT.bottom - MAX_H * v;
const barH = (v: number) => MAX_H * v;

type Bar = { label: string; value: number; kind: "engaged" | "gave" };
const BARS: Bar[] = [
  { label: "Arrived", value: 0.86, kind: "engaged" },
  { label: "Scrolled deep", value: 0.8, kind: "engaged" },
  { label: "Clearly moved", value: 0.74, kind: "engaged" },
  { label: "Gave", value: 0.34, kind: "gave" },
];

const BENCHMARK = 0.6;
const COL_W = W / BARS.length;
const BAR_W = 104;
const colCenter = (k: number) => PLOT.left + COL_W * (k + 0.5);

const benchY = barTop(BENCHMARK);
const gaveIdx = BARS.findIndex((b) => b.kind === "gave");
const gaveCx = colCenter(gaveIdx);
const gaveTopY = barTop(BARS[gaveIdx].value);

export default function EqualAllContextGapVisual() {
  const { ref, phase } = useInViewReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`eagap ${fraunces.variable}`}
      data-phase={phase}
      data-case-reveal
    >
      <svg viewBox="0 0 820 470" role="img" aria-label="A bar chart: donors arrived, scrolled deep, and were clearly moved, shown as three tall bars, but the amount they gave falls well short of a dashed benchmark line. The gap between the giving bar and the benchmark is labeled the shortfall.">
        <defs>
          <linearGradient id="eagap-bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8683f" />
            <stop offset="100%" stopColor="#e05430" />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke="#e2d9cb" strokeWidth="1.5" />

        {/* bars */}
        {BARS.map((bar, k) => {
          const cx = colCenter(k);
          const engaged = bar.kind === "engaged";
          return (
            <g key={bar.label}>
              <rect
                className={`eagap-bar ${engaged ? "eagap-bar-engaged" : "eagap-bar-gave"}`}
                x={cx - BAR_W / 2}
                y={barTop(bar.value)}
                width={BAR_W}
                height={barH(bar.value)}
                rx="7"
                fill={engaged ? "url(#eagap-bar-grad)" : "#faf8f4"}
                stroke={engaged ? "none" : "#e05430"}
                strokeWidth={engaged ? 0 : 2}
                style={{ ["--d" as string]: `${0.1 + k * 0.13}s` }}
              />
              <text className="eagap-axis" x={cx} y={PLOT.bottom + 26} textAnchor="middle">
                {bar.label}
              </text>
            </g>
          );
        })}

        {/* benchmark line */}
        <g className="eagap-fade eagap-bench" style={{ ["--d" as string]: "0.8s" }}>
          <line x1={PLOT.left} y1={benchY} x2={PLOT.right} y2={benchY} stroke="#5d564c" strokeWidth="1.5" strokeDasharray="5 5" />
          <text className="eagap-bench-label" x={PLOT.right} y={benchY - 10} textAnchor="end">
            Ketto&rsquo;s benchmark
          </text>
        </g>

        {/* the shortfall: the empty space above the giving bar, up to the
            benchmark it never reached */}
        <g className="eagap-fade eagap-gap" style={{ ["--d" as string]: "1.05s" }}>
          <rect
            x={gaveCx - BAR_W / 2}
            y={benchY}
            width={BAR_W}
            height={gaveTopY - benchY}
            rx="7"
            fill="#c03f1d"
            fillOpacity="0.07"
            stroke="#c03f1d"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text className="eagap-gap-label" x={gaveCx} y={(benchY + gaveTopY) / 2 + 6} textAnchor="middle">
            The shortfall
          </text>
        </g>

        {/* soft framing note over the engaged bars */}
        <text className="eagap-fade eagap-intent" x={colCenter(1)} y={PLOT.top - 34} textAnchor="middle" style={{ ["--d" as string]: "0.55s" }}>
          Strong intent
        </text>
        <line className="eagap-fade eagap-intent-rule" x1={colCenter(0) - BAR_W / 2} y1={PLOT.top - 22} x2={colCenter(2) + BAR_W / 2} y2={PLOT.top - 22} stroke="#c9bda9" strokeWidth="1.5" style={{ ["--d" as string]: "0.6s" }} />
      </svg>
    </div>
  );
}
