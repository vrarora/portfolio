/** Hand-drawn annotation marks. Each returns SVG paths in drawing order. */
import { ellipse, jitter, seeded, segment, smoothPath, type Point } from "../sketch";

export type Rect = { x: number; y: number; w: number; h: number };

/** Two passes through the middle of a box, like a quick strike-through. */
export function strike(r: Rect, seed: number): string[] {
  const rand = seeded(seed);
  const y = r.y + r.h * 0.55;
  const out = jitter(segment([r.x - 10, y + 2], [r.x + r.w + 12, y - 4], 6), 2.2, rand);
  const back = jitter(segment([r.x + r.w + 8, y + 5], [r.x - 6, y + 3], 6), 2.2, rand);
  return [smoothPath(out), smoothPath(back)];
}

/** A loose underline that overshoots a little on the right. */
export function underline(r: Rect, seed: number): string[] {
  const rand = seeded(seed);
  const y = r.y + r.h + 8;
  return [smoothPath(jitter(segment([r.x - 6, y], [r.x + r.w + 18, y - 5], 8), 2, rand))];
}

/** A hand-drawn loop around a box that closes past its start. */
export function circle(r: Rect, seed: number, pad = 14): string[] {
  const rand = seeded(seed);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const pts = ellipse(cx, cy, r.w / 2 + pad, r.h / 2 + pad, 18, -2.4);
  const loop: Point[] = [...pts, pts[0], pts[1], pts[2]].map(([x, y], i) => [x + i * 0.9, y - i * 0.5]);
  return [smoothPath(jitter(loop, 3, rand))];
}

/** A bracket down the left side of a box. */
export function bracket(r: Rect, seed: number, gap = 22): string[] {
  const rand = seeded(seed);
  const x = r.x - gap;
  const pts: Point[] = [
    [x + 16, r.y],
    [x, r.y + 8],
    [x - 2, r.y + r.h / 2 - 12],
    [x - 14, r.y + r.h / 2],
    [x - 2, r.y + r.h / 2 + 12],
    [x, r.y + r.h - 8],
    [x + 16, r.y + r.h],
  ];
  return [smoothPath(jitter(pts, 1.6, rand))];
}

/** A curved arrow from `from` to `to`, bending through `via`. */
export function arrow(from: Point, to: Point, via: Point, seed: number): string[] {
  const rand = seeded(seed);
  const shaft: Point[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = 1 - t;
    shaft.push([
      u * u * from[0] + 2 * u * t * via[0] + t * t * to[0],
      u * u * from[1] + 2 * u * t * via[1] + t * t * to[1],
    ]);
  }
  const [px, py] = shaft[shaft.length - 3];
  const angle = Math.atan2(to[1] - py, to[0] - px);
  const head = 24;
  const wing = (side: number): Point => [
    to[0] - head * Math.cos(angle + side * 0.5),
    to[1] - head * Math.sin(angle + side * 0.5),
  ];
  return [smoothPath(jitter(shaft, 1.8, rand)), smoothPath([wing(-1), to, wing(1)])];
}

/** A zigzag scribble across a box, for crossing out an area. */
export function scribble(r: Rect, seed: number, rows = 7): string[] {
  const rand = seeded(seed);
  const pts: Point[] = [];
  for (let i = 0; i <= rows; i++) {
    const y = r.y + (r.h * i) / rows;
    pts.push(i % 2 ? [r.x + r.w, y] : [r.x, y]);
  }
  return [smoothPath(jitter(pts, 10, rand))];
}

/** A line through a list of points, for tracing a path through the UI. */
export function trace(points: readonly Point[], seed: number): string[] {
  return [smoothPath(jitter(points, 2, seeded(seed)))];
}
