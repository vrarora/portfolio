"use client";

import { useEffect, useRef, useState } from "react";
import { SlotText } from "slot-text/react";

export type OutcomeMetric = { start: string; end: string; desc: string };

const DEFAULT_METRICS: OutcomeMetric[] = [
  { start: "0 weeks", end: "3 weeks", desc: "From kickoff to POC evaluation" },
  { start: "₹000Cr",  end: "₹250Cr",  desc: "In penalty exposure the bank faced" },
  { start: "₹00Cr+",  end: "₹10Cr+",  desc: "ARR won for IDfy when the bank signed" },
];

const SEG_HALF = 60; // half-length of each gradient segment (120px total)

type Seg = {
  pos:    number;
  speed:  number;
  axis:   "h" | "v";
  coord:  number; // lineY for horizontal, lineX for vertical — set in init
};

export default function OutcomeImpactVisual({ metrics = DEFAULT_METRICS }: { metrics?: OutcomeMetric[] }) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  // 4 independent segments: top, bottom, left divider, right divider
  const segs = useRef<Seg[]>([
    { pos:  20, speed: 1.1,  axis: "h", coord: 0 },
    { pos: 180, speed: 1.45, axis: "h", coord: 0 },
    { pos:  60, speed: 1.25, axis: "v", coord: 0 },
    { pos: 140, speed: 0.95, axis: "v", coord: 0 },
  ]);

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

    const init = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;

      // Top & bottom border lines are always horizontal.
      segs.current[0].axis = "h";
      segs.current[0].coord = 0.5;
      segs.current[1].axis = "h";
      segs.current[1].coord = H - 0.5;

      // When the metrics stack (mobile), the two dividers between them are
      // horizontal — follow the actual row separators instead of running
      // vertically through the stacked content.
      const stacked = window.matchMedia("(max-width: 767px)").matches;
      if (stacked) {
        const wrapTop = wrap.getBoundingClientRect().top;
        const metricEls = wrap.querySelectorAll(".oiv-metric");
        const dividerY = (i: number, fallback: number) =>
          metricEls[i]
            ? metricEls[i].getBoundingClientRect().bottom - wrapTop
            : fallback;
        segs.current[2].axis = "h";
        segs.current[2].coord = dividerY(0, H / 3);
        segs.current[3].axis = "h";
        segs.current[3].coord = dividerY(1, (2 * H) / 3);
      } else {
        segs.current[2].axis = "v";
        segs.current[2].coord = W / 3;
        segs.current[3].axis = "v";
        segs.current[3].coord = (2 * W) / 3;
      }
    };

    init();
    const ro = new ResizeObserver(init);
    ro.observe(wrap);

    const ctx = canvas.getContext("2d")!;

    const drawHSeg = (cx: number, lineY: number, W: number, _isTop: boolean) => {
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

    const drawVSeg = (cy: number, lineX: number, H: number) => {
      const y0 = cy - SEG_HALF;
      const y1 = cy + SEG_HALF;
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0,    "rgba(0,0,0,0)");
      g.addColorStop(0.25, "rgba(110,110,120,0.35)");
      g.addColorStop(0.5,  "rgba(195,195,205,0.92)");
      g.addColorStop(0.75, "rgba(110,110,120,0.35)");
      g.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lineX, Math.max(y0, 0));
      ctx.lineTo(lineX, Math.min(y1, H));
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const tick = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Advance and draw each segment independently
      for (let i = 0; i < segs.current.length; i++) {
        const s = segs.current[i];
        s.pos += s.speed;
        const max = s.axis === "h" ? W : H;
        if (s.pos > max + SEG_HALF) s.pos = -SEG_HALF;
        if (s.axis === "h") drawHSeg(s.pos, s.coord, W, i === 0); // top line is index 0
        else                drawVSeg(s.pos, s.coord, H);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="outcome-impact-visual" ref={wrapRef}>
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
