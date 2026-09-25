"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SlotText } from "slot-text/react";

import "./outcome-impact.css";

export type OutcomeMetric = { start: string; end: string; desc: string };

const DEFAULT_METRICS: OutcomeMetric[] = [
  { start: "0 weeks", end: "3 weeks", desc: "From kickoff to POC evaluation" },
  { start: "₹000Cr",  end: "₹250Cr",  desc: "In penalty exposure the bank faced" },
  { start: "₹00Cr+",  end: "₹10Cr+",  desc: "ARR won for IDfy when the bank signed" },
];

const SEG_HALF = 60; // half-length of each gradient segment (120px total)
const SEG_STARTS = [20, 180, 60, 140];
const SEG_SPEEDS = [1.1, 1.45, 1.25, 0.95];

type Seg = {
  pos:   number;
  speed: number;
  y:     number; // set in init
};

export default function OutcomeImpactVisual({ metrics = DEFAULT_METRICS }: { metrics?: OutcomeMetric[] }) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  // Segments run along horizontal lines only: the top and bottom borders,
  // plus the row separators when the metrics stack.
  const count = metrics.length;
  const segs = useRef<Seg[]>([]);

  const [fired, setFired] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setFired(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const makeSeg = (i: number, y: number): Seg => ({
      pos:   SEG_STARTS[i % SEG_STARTS.length],
      speed: SEG_SPEEDS[i % SEG_SPEEDS.length],
      y,
    });

    const init = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
      const H = canvas.height;

      const lines = [0.5, H - 0.5];

      const grid = wrap.querySelector(".oiv-metrics");
      const stacked = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length === 1 : false;
      if (stacked) {
        const wrapTop = wrap.getBoundingClientRect().top;
        const metricEls = wrap.querySelectorAll(".oiv-metric");
        for (let d = 0; d < count - 1; d++) {
          const el = metricEls[d];
          lines.push(el ? el.getBoundingClientRect().bottom - wrapTop : ((d + 1) * H) / count);
        }
      }

      segs.current = lines.map((y, i) => segs.current[i] ? { ...segs.current[i], y } : makeSeg(i, y));
    };

    init();
    const ro = new ResizeObserver(init);
    ro.observe(wrap);

    const ctx = canvas.getContext("2d")!;

    const drawSeg = (cx: number, lineY: number, W: number) => {
      const x0 = Math.max(cx - SEG_HALF, 0);
      const x1 = Math.min(cx + SEG_HALF, W);
      if (x1 <= x0) return;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0,    "rgba(0,0,0,0)");
      g.addColorStop(0.25, "rgba(110,110,120,0.35)");
      g.addColorStop(0.5,  "rgba(195,195,205,0.92)");
      g.addColorStop(0.75, "rgba(110,110,120,0.35)");
      g.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, lineY);
      ctx.lineTo(x1, lineY);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const tick = () => {
      const W = canvas.width;
      ctx.clearRect(0, 0, W, canvas.height);

      for (const s of segs.current) {
        s.pos += s.speed;
        if (s.pos > W + SEG_HALF) s.pos = -SEG_HALF;
        drawSeg(s.pos, s.y, W);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [count]);

  return (
    <div
      className="outcome-impact-visual"
      ref={wrapRef}
      style={{ "--oiv-count": count } as CSSProperties}
    >
      <canvas ref={canvasRef} className="oiv-canvas" aria-hidden="true" />
      <div className="oiv-metrics">
        {metrics.map((m, i) => (
          <div key={i} className="oiv-metric">
            <p className="oiv-metric-num">
              <SlotText
                text={fired ? m.end : m.start}
                options={{ direction: "up", stagger: 55, duration: 360 }}
              />
            </p>
            <p className="oiv-metric-desc">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
