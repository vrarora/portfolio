"use client";

import { useEffect, useRef } from "react";

import { cuesEnabled } from "@/components/audio/cues";
import { playTap, type TapKind } from "@/components/audio/tap";

const SPARK = { count: 6, duration: 320, radius: 15, length: 7, width: 1.35, alpha: 0.34 };

/** Elements that play their own cue on press set this, so the tap stays out of the way. */
const OWN_SOUND = "[data-click-sound='off'], [disabled], [aria-disabled='true']";

type Burst = { x: number; y: number; start: number };

function kindOf(target: Element): TapKind {
  if (target.closest("a[href]")) return "link";
  if (target.closest("button, [role='button'], summary, label")) return "action";
  return "plain";
}

/**
 * Every press anywhere on the page draws a small ring of strokes at the pointer
 * and, when sounds are on, plays a tap. The strokes use a difference blend, so
 * they read dark on paper and light on the night sky.
 */
export function ClickFeedback() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bursts: Burst[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = SPARK.width;
      ctx.lineCap = "round";

      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const burst = bursts[i];
        const t = (now - burst.start) / SPARK.duration;
        if (t >= 1) {
          bursts.splice(i, 1);
          continue;
        }

        // Ease out: the strokes leap away, then slow and shrink as they fade.
        const eased = t * (2 - t);
        const inner = eased * SPARK.radius;
        const outer = inner + SPARK.length * (1 - eased);
        ctx.globalAlpha = SPARK.alpha * (1 - eased);
        ctx.beginPath();
        for (let n = 0; n < SPARK.count; n += 1) {
          const angle = (Math.PI * 2 * n) / SPARK.count;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          ctx.moveTo(burst.x + inner * cos, burst.y + inner * sin);
          ctx.lineTo(burst.x + outer * cos, burst.y + outer * sin);
        }
        ctx.stroke();
      }

      frame = bursts.length ? requestAnimationFrame(draw) : 0;
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(OWN_SOUND)) return;

      if (cuesEnabled()) playTap(target ? kindOf(target) : "plain");

      if (motion.matches) return;
      bursts.push({ x: event.clientX, y: event.clientY, start: performance.now() });
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onDown, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown, { capture: true });
    };
  }, []);

  return <canvas ref={canvasRef} className="v3-spark" aria-hidden="true" />;
}
