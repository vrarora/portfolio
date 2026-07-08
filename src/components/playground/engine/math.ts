export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

/** Quadratic ease-in-out, matching the reference field's motion. */
export const easeIO = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * Distance from a rect's centre to its edge along direction (dx, dy),
 * where (dx, dy) is a unit vector and (hw, hh) the half extents.
 */
export function edgeDist(dx: number, dy: number, hw: number, hh: number) {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  return Math.min(ax < 1e-4 ? Infinity : hw / ax, ay < 1e-4 ? Infinity : hh / ay);
}

export function rectsOverlap(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export const pad2 = (v: number) => String(v).padStart(2, "0");
