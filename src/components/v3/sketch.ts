/** Small helpers for hand-drawn SVG lines: seeded noise, jitter and smooth curves. */

export type Point = readonly [number, number];

/** Mulberry32: a tiny seeded generator, so a drawing wobbles the same way on every render. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Moves each point by up to `amount` in a seeded direction. */
export function jitter(points: readonly Point[], amount: number, rand: () => number): Point[] {
  return points.map(([x, y]) => [x + (rand() - 0.5) * 2 * amount, y + (rand() - 0.5) * 2 * amount]);
}

/** A Catmull-Rom curve through the points, written as cubic Béziers. */
export function smoothPath(points: readonly Point[], closed = false): string {
  if (points.length < 2) return "";
  const pts = closed ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]];
  let d = `M${pts[1][0].toFixed(2)} ${pts[1][1].toFixed(2)}`;
  for (let i = 1; i < pts.length - 2; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return closed ? `${d} Z` : d;
}

/** Points along a straight segment, so jitter can bend it a little. */
export function segment(a: Point, b: Point, steps = 4): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as Point;
  });
}

/** Points around an ellipse, starting at `start` radians. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, steps = 12, start = 0): Point[] {
  return Array.from({ length: steps }, (_, i) => {
    const a = start + (i / steps) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Point;
  });
}

/** Points along an arc from `from` to `to` radians. */
export function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 8): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Point;
  });
}

/** The point at `length` along a limb from `origin`, at `angle` degrees (0 points right, 90 down). */
export function reach(origin: Point, length: number, angle: number): Point {
  const r = (angle * Math.PI) / 180;
  return [origin[0] + Math.cos(r) * length, origin[1] + Math.sin(r) * length];
}

/** Straight lines through the points, for shapes that keep their corners. */
export function linePath(points: readonly Point[], closed = false): string {
  if (points.length < 2) return "";
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  return closed ? `${d} Z` : d;
}
