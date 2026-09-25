/**
 * Hand-drawn diagram parts for boards. Every function returns SVG paths in
 * world px, in the order the pen draws them, with a seeded wobble so a
 * diagram looks the same on every render.
 */
import { ellipse, jitter, linePath, seeded, segment, smoothPath, type Point } from "../sketch";
import type { Rect } from "./marks";

/** Points along a rectangle's edges, starting at one corner, without repeating corners. */
function outline(r: Rect, start: number, steps: number): Point[] {
  const corners: Point[] = [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x, r.y + r.h],
  ];
  const pts: Point[] = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[(start + i) % 4];
    const b = corners[(start + i + 1) % 4];
    pts.push(...segment(a, b, steps).slice(0, -1));
  }
  return pts;
}

/**
 * A box drawn in two loose passes, the way a quick sketch goes round twice.
 * The second pass starts at the opposite corner and overshoots a little.
 */
export function box(r: Rect, seed: number, passes = 2): string[] {
  const rand = seeded(seed);
  const wobble = Math.min(5, 1.5 + Math.min(r.w, r.h) * 0.012);
  const out: string[] = [];
  for (let p = 0; p < passes; p++) {
    const start = p * 2;
    const pts = outline(r, start, 3);
    const loop = [...pts, pts[0], pts[1]];
    out.push(linePath(jitter(loop, wobble, rand)));
  }
  return out;
}

/**
 * A stack of pages: the front page as a box, and behind it only the edges
 * that peek out above and to the right, so no line crosses the front page.
 */
export function stack(front: Rect, behind: number, step: number, seed: number): string[] {
  const rand = seeded(seed);
  const out: string[] = [];
  for (let i = behind; i >= 1; i--) {
    const x = front.x + i * step;
    const y = front.y - i * step;
    const peek: Point[] = [
      [x, front.y - (i - 1) * step],
      [x, y],
      [x + front.w, y],
      [x + front.w, y + front.h],
      [front.x + front.w + (i - 1) * step, y + front.h],
    ];
    out.push(linePath(jitter(peek, 1.6, rand)));
  }
  return [...out, ...box(front, seed + 1)];
}

/** A slightly bent straight line. */
export function line(a: Point, b: Point, seed: number): string[] {
  const steps = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 160));
  return [smoothPath(jitter(segment(a, b, steps), 2.4, seeded(seed)))];
}

/** A dashed line, one path per dash. */
export function dashed(a: Point, b: Point, seed: number, dash = 30, gap = 22): string[] {
  const rand = seeded(seed);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const out: string[] = [];
  for (let t = 0; t < len; t += dash + gap) {
    const e = Math.min(len, t + dash);
    const p0: Point = [a[0] + ux * t, a[1] + uy * t];
    const p1: Point = [a[0] + ux * e, a[1] + uy * e];
    out.push(smoothPath(jitter([p0, p1], 1.6, rand)));
  }
  return out;
}

/** A straight arrow from `a` to `b`, bowed sideways by `bend` px. */
export function arrowLine(a: Point, b: Point, seed: number, bend = 0): string[] {
  const rand = seeded(seed);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  const via: Point = [mx + nx * bend, my + ny * bend];
  const shaft: Point[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const u = 1 - t;
    shaft.push([u * u * a[0] + 2 * u * t * via[0] + t * t * b[0], u * u * a[1] + 2 * u * t * via[1] + t * t * b[1]]);
  }
  const [px, py] = shaft[shaft.length - 2];
  const angle = Math.atan2(b[1] - py, b[0] - px);
  const head = Math.min(26, len * 0.3);
  const wing = (side: number): Point => [b[0] - head * Math.cos(angle + side * 0.5), b[1] - head * Math.sin(angle + side * 0.5)];
  return [smoothPath(jitter(shaft, 1.6, rand)), smoothPath([wing(-1), b, wing(1)])];
}

/** A cross mark, two quick strokes. */
export function cross(cx: number, cy: number, size: number, seed: number): string[] {
  const rand = seeded(seed);
  const h = size / 2;
  return [
    smoothPath(jitter(segment([cx - h, cy - h], [cx + h, cy + h], 3), size * 0.04, rand)),
    smoothPath(jitter(segment([cx + h, cy - h * 1.05], [cx - h * 0.95, cy + h], 3), size * 0.04, rand)),
  ];
}

/** A tick mark in one stroke. */
export function tick(cx: number, cy: number, size: number, seed: number): string[] {
  const rand = seeded(seed);
  const s = size / 2;
  return [smoothPath(jitter([[cx - s, cy], [cx - s * 0.25, cy + s * 0.7], [cx + s, cy - s * 0.8]], size * 0.03, rand))];
}

/** Short lines standing in for text, one per width. */
export function bars(x: number, y: number, widths: number[], gap: number, seed: number): string[] {
  const rand = seeded(seed);
  return widths.map((w, i) => smoothPath(jitter(segment([x, y + i * gap], [x + w, y + i * gap], 3), 1.6, rand)));
}

/** A person as a head and shoulders, `h` px tall, standing on (cx, bottom). */
export function person(cx: number, bottom: number, h: number, seed: number): string[] {
  const rand = seeded(seed);
  const r = h * 0.2;
  const headY = bottom - h + r;
  const head = ellipse(cx, headY, r, r, 10, -1.6);
  const shoulders: Point[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    shoulders.push([cx + Math.cos(a) * h * 0.38, bottom + Math.sin(a) * h * 0.46]);
  }
  return [smoothPath(jitter([...head, head[0]], h * 0.02, rand), false), smoothPath(jitter(shoulders, h * 0.02, rand))];
}

/** A document with a folded top-right corner. */
export function doc(r: Rect, seed: number): string[] {
  const rand = seeded(seed);
  const f = Math.min(r.w, r.h) * 0.22;
  const body: Point[] = [
    [r.x + r.w - f, r.y],
    [r.x, r.y],
    [r.x, r.y + r.h],
    [r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + f],
    [r.x + r.w - f, r.y],
  ];
  const fold: Point[] = [
    [r.x + r.w - f, r.y],
    [r.x + r.w - f, r.y + f],
    [r.x + r.w, r.y + f],
  ];
  return [linePath(jitter(body, 2.4, rand)), linePath(jitter(fold, 1.6, rand))];
}

/** A loose loop around a point, for numbered stations and small circles. */
export function dot(cx: number, cy: number, r: number, seed: number): string[] {
  const pts = ellipse(cx, cy, r, r, 12, -1.2);
  return [smoothPath(jitter([...pts, pts[0], pts[1]], r * 0.06, seeded(seed)))];
}

/** Diagonal hatching inside a rect, for a filled bar. */
export function hatch(r: Rect, seed: number, spacing = 26): string[] {
  const rand = seeded(seed);
  const out: string[] = [];
  for (let x = r.x - r.h; x < r.x + r.w; x += spacing) {
    const a: Point = [Math.max(r.x, x), Math.min(r.y + r.h, r.y + r.h - (Math.max(r.x, x) - x))];
    const bx = Math.min(r.x + r.w, x + r.h);
    const b: Point = [bx, r.y + r.h - (bx - x)];
    if (a[0] < b[0]) out.push(smoothPath(jitter([a, b], 1.4, rand)));
  }
  return out;
}

/**
 * Lucide icons on a 24-unit grid (ISC licence). Place them with a drawing's
 * `at` so the browser scales the arcs.
 */
export const ICONS = {
  scanLine: ["M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2", "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2", "M7 12h10"],
  scanSearch: ["M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2", "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2", "M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0", "m16 16-1.9-1.9"],
  fingerprint: ["M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4", "M14 13.12c0 2.38 0 6.38-1 8.88", "M17.29 21.02c.12-.6.43-2.3.5-3.02", "M2 12a10 10 0 0 1 18-6", "M21.8 16c.2-2 .131-5.354 0-6", "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2", "M8.65 22c.21-.66.45-1.32.57-2", "M9 6.8a6 6 0 0 1 9 5.2v2"],
  idCard: ["M16 10h2", "M16 14h2", "M6.17 15a3 3 0 0 1 5.66 0", "M11 11a2 2 0 1 1-4 0a2 2 0 1 1 4 0", "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"],
  tag: ["M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z", "M8 7.5a.5.5 0 1 1-1 0a.5.5 0 1 1 1 0"],
  info: ["M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0", "M12 16v-4", "M12 8h.01"],
  triangleAlert: ["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", "M12 9v4", "M12 17h.01"],
} as const;

export type IconName = keyof typeof ICONS;
