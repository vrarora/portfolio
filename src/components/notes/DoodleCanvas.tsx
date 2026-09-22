"use client";

import { ArrowCounterClockwise, Eraser, Trash } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { NOTE_COORD_MAX, NOTE_STROKES_MAX, NOTE_STROKE_COLORS } from "@/shared/limits";
import { encodeStroke } from "@/shared/strokeCodec";
import type { Stroke } from "@/shared/strokeCodec";

type Pt = { x: number; y: number };
type Tool = "ink" | "moss" | "eraser";

type Props = {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
};

const WIDTH = 2.2;

function drawStroke(ctx: CanvasRenderingContext2D, pts: Pt[], colour: string, scale: number) {
  if (pts.length === 0) return;
  ctx.strokeStyle = colour;
  ctx.lineWidth = WIDTH * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x * scale, pts[0].y * scale);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i + 1].x) / 2) * scale;
    const my = ((pts[i].y + pts[i + 1].y) / 2) * scale;
    ctx.quadraticCurveTo(pts[i].x * scale, pts[i].y * scale, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x * scale, last.y * scale);
  ctx.stroke();
}

function strokePoints(s: Stroke): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < s.p.length; i += 2) out.push({ x: s.p[i], y: s.p[i + 1] });
  return out;
}

/** Square drawing surface. Strokes are stored in 0..1000 space; the canvas scales to fit. */
export function DoodleCanvas({ strokes, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("ink");
  const live = useRef<Pt[]>([]);
  const drawing = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const size = canvas.width;
    const scale = size / NOTE_COORD_MAX;
    ctx.clearRect(0, 0, size, size);
    for (const s of strokes) {
      ctx.lineWidth = s.w * scale;
      drawStroke(ctx, strokePoints(s), s.c, scale);
    }
    if (live.current.length > 0) {
      drawStroke(ctx, live.current, tool === "moss" ? NOTE_STROKE_COLORS[1] : NOTE_STROKE_COLORS[0], scale);
    }
  }, [strokes, tool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.width * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(redraw, [redraw]);

  const toCanvasSpace = (event: PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * NOTE_COORD_MAX,
      y: ((event.clientY - rect.top) / rect.height) * NOTE_COORD_MAX,
    };
  };

  const eraseAt = (pt: Pt) => {
    const radius = 40;
    const keep = strokes.filter((s) => {
      for (let i = 0; i < s.p.length; i += 2) {
        if (Math.hypot(s.p[i] - pt.x, s.p[i + 1] - pt.y) < radius) return false;
      }
      return true;
    });
    if (keep.length !== strokes.length) onChange(keep);
  };

  const onDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const pt = toCanvasSpace(event);
    if (tool === "eraser") {
      eraseAt(pt);
      return;
    }
    if (strokes.length >= NOTE_STROKES_MAX) return;
    drawing.current = true;
    live.current = [pt];
    redraw();
  };

  const onMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const pt = toCanvasSpace(event);
    if (tool === "eraser") {
      if (event.buttons > 0) eraseAt(pt);
      return;
    }
    if (!drawing.current) return;
    const last = live.current[live.current.length - 1];
    if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < 3) return;
    live.current.push(pt);
    redraw();
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = live.current;
    live.current = [];
    if (pts.length === 1) pts.push({ x: pts[0].x + 1, y: pts[0].y + 1 });
    const colour = tool === "moss" ? NOTE_STROKE_COLORS[1] : NOTE_STROKE_COLORS[0];
    onChange([...strokes, encodeStroke(pts, colour, WIDTH)]);
  };

  return (
    <div className="notes-doodle">
      <canvas
        ref={canvasRef}
        className="notes-doodle-canvas"
        aria-label="Drawing area"
        role="img"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        data-tool={tool}
      />
      <div className="notes-doodle-tools" role="toolbar" aria-label="Drawing tools">
        <button
          type="button"
          className="notes-tool notes-tool--swatch"
          style={{ ["--swatch" as string]: NOTE_STROKE_COLORS[0] }}
          aria-pressed={tool === "ink"}
          aria-label="Ink"
          onClick={() => setTool("ink")}
        />
        <button
          type="button"
          className="notes-tool notes-tool--swatch"
          style={{ ["--swatch" as string]: NOTE_STROKE_COLORS[1] }}
          aria-pressed={tool === "moss"}
          aria-label="Moss"
          onClick={() => setTool("moss")}
        />
        <button type="button" className="notes-tool" aria-pressed={tool === "eraser"} aria-label="Eraser" onClick={() => setTool("eraser")}>
          <Eraser size={15} />
        </button>
        <span className="notes-tool-gap" />
        <button type="button" className="notes-tool" aria-label="Undo" disabled={strokes.length === 0} onClick={() => onChange(strokes.slice(0, -1))}>
          <ArrowCounterClockwise size={15} />
        </button>
        <button type="button" className="notes-tool" aria-label="Clear" disabled={strokes.length === 0} onClick={() => onChange([])}>
          <Trash size={15} />
        </button>
      </div>
    </div>
  );
}
