import { NOTE_COORD_MAX, NOTE_POINTS_PER_STROKE_MAX, NOTE_POINTS_TOTAL_MAX, NOTE_STROKES_MAX } from "./limits";

/** A stroke: colour, width, and a flat list of x,y pairs in 0..1000 space. */
export type Stroke = { c: string; w: number; p: number[] };

type Pt = { x: number; y: number };

function perpDistance(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

/** Ramer-Douglas-Peucker simplification. */
export function simplify(points: Pt[], epsilon: number): Pt[] {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let index = 0;
  const last = points.length - 1;
  for (let i = 1; i < last; i++) {
    const d = perpDistance(points[i], points[0], points[last]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon);
    const right = simplify(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[last]];
}

/** Rounds and clamps to the 0..1000 integer grid, capping point counts. */
export function encodeStroke(points: Pt[], colour: string, width: number): Stroke {
  const clamp = (v: number) => Math.max(0, Math.min(NOTE_COORD_MAX, Math.round(v)));
  const simplified = simplify(points, 4).slice(0, NOTE_POINTS_PER_STROKE_MAX);
  const flat: number[] = [];
  for (const pt of simplified) flat.push(clamp(pt.x), clamp(pt.y));
  return { c: colour, w: Math.round(width * 10) / 10, p: flat };
}

export function countPoints(strokes: Stroke[]) {
  return strokes.reduce((n, s) => n + s.p.length / 2, 0);
}

/** Server-side shape check. Rejects anything outside the schema's limits. */
export function validateStrokes(strokes: unknown): strokes is Stroke[] {
  if (!Array.isArray(strokes) || strokes.length > NOTE_STROKES_MAX) return false;
  let total = 0;
  for (const s of strokes) {
    if (!s || typeof s !== "object") return false;
    const { c, w, p } = s as Stroke;
    if (typeof c !== "string" || !/^#[0-9a-f]{6}$/i.test(c)) return false;
    if (typeof w !== "number" || w <= 0 || w > 12) return false;
    if (!Array.isArray(p) || p.length % 2 !== 0 || p.length / 2 > NOTE_POINTS_PER_STROKE_MAX) return false;
    for (const v of p) if (!Number.isInteger(v) || v < 0 || v > NOTE_COORD_MAX) return false;
    total += p.length / 2;
  }
  return total <= NOTE_POINTS_TOTAL_MAX;
}

export function strokeToPolyline(stroke: Stroke) {
  const pts: string[] = [];
  for (let i = 0; i < stroke.p.length; i += 2) pts.push(`${stroke.p[i]},${stroke.p[i + 1]}`);
  return pts.join(" ");
}
