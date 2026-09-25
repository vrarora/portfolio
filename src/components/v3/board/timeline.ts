/**
 * The board's timeline. A script is a list of steps that run one after
 * another. Each step gets a weight, and the weights share one 0..1 scroll
 * timeline, so every visual is a pure function of scroll progress and
 * scrolling up plays the story backwards exactly.
 */
import { clamp01, easeInOut, lerp, range } from "@/components/story/engine/math";

import type { Rect } from "./marks";

export type Ink = "graphite" | "red" | "green";

export type Drawing = {
  id: string;
  ink: Ink;
  paths: string[];
  /** Stroke width in world px. */
  width: number;
  /** Ties the drawing to one snapshot in a frame, so it fades with that snapshot. */
  layer?: { frame: string; snap: number };
  /** Places paths drawn in their own units, such as a 24-unit icon, at (x, y) and scale. */
  at?: { x: number; y: number; scale: number };
  /** The reading-version figure this drawing belongs to. */
  figure?: string;
  /**
   * Outline-font text. The paths are the pen's centre lines and stay unseen;
   * drawn `reveal[i]` wide they uncover the filled letters in `d`.
   */
  outline?: { d: string; reveal: number[] };
};

export type Frame = {
  id: string;
  x: number;
  y: number;
  /** Snapshot sources, shown one at a time. */
  snaps: string[];
  /** "window" shows product snapshots in a browser window. "art" shows images on a plain card. */
  kind?: "window" | "art";
  /** Size of an art frame in world px. Windows are always one snapshot in size. */
  w?: number;
  h?: number;
  /** The reading-version figure this frame belongs to. */
  figure?: string;
};

export type Step =
  | { kind: "camera"; to: Rect; weight?: number; with?: boolean }
  | { kind: "draw"; id: string; weight?: number; with?: boolean }
  | { kind: "show"; frame: string; snap: number; weight?: number; with?: boolean }
  | { kind: "hold"; weight: number };

export type Script = {
  world: { w: number; h: number };
  frames: Frame[];
  drawings: Drawing[];
  steps: Step[];
  /** World rects that reading-version figures crop to, by figure id. */
  figures?: Record<string, Rect>;
};

export type Span = { t0: number; t1: number };

export type Compiled = {
  script: Script;
  /** Scroll length in timeline units. */
  units: number;
  draw: Map<string, Span>;
  cameras: { from: Rect; to: Rect; span: Span }[];
  shows: { frame: string; snap: number; span: Span }[];
};

/** World px of pen stroke that one timeline unit covers. */
const INK_PER_UNIT = 2600;

/** Rough ink length of a drawing in world px, for weighting how long it takes to draw. */
function inkLength(drawing: Drawing) {
  let total = 0;
  for (const d of drawing.paths) {
    const nums = d.match(/-?[\d.]+/g)?.map(Number) ?? [];
    for (let i = 2; i + 1 < nums.length; i += 2) {
      total += Math.hypot(nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]);
    }
  }
  return total * (drawing.at?.scale ?? 1);
}

export function compile(script: Script): Compiled {
  const drawings = new Map(script.drawings.map((d) => [d.id, d]));
  const raw: { step: Step; start: number; end: number }[] = [];
  let cursor = 0;
  let prevStart = 0;

  for (const step of script.steps) {
    let weight: number;
    if (step.kind === "draw") {
      const drawing = drawings.get(step.id);
      weight = step.weight ?? Math.max(0.25, (drawing ? inkLength(drawing) : 0) / INK_PER_UNIT);
    } else {
      weight = step.weight ?? 1;
    }
    const parallel = step.kind !== "hold" && step.with;
    const start = parallel ? prevStart : cursor;
    const end = start + weight;
    raw.push({ step, start, end });
    cursor = Math.max(cursor, end);
    prevStart = start;
  }

  const units = cursor;
  const span = (a: number, b: number): Span => ({ t0: a / units, t1: b / units });

  const draw = new Map<string, Span>();
  const cameras: Compiled["cameras"] = [];
  const shows: Compiled["shows"] = [];
  let camera: Rect | null = null;

  for (const { step, start, end } of raw) {
    if (step.kind === "draw") draw.set(step.id, span(start, end));
    if (step.kind === "show") shows.push({ frame: step.frame, snap: step.snap, span: span(start, end) });
    if (step.kind === "camera") {
      cameras.push({ from: camera ?? step.to, to: step.to, span: span(start, end) });
      camera = step.to;
    }
  }

  return { script, units, draw, cameras, shows };
}

export const progressOf = (t: number, s: Span) => range(t, s.t0, s.t1);

/** The world rect the camera frames at time t. */
export function cameraAt(c: Compiled, t: number): Rect {
  let rect = c.cameras[0]?.to ?? { x: 0, y: 0, w: c.script.world.w, h: c.script.world.h };
  for (const cam of c.cameras) {
    if (t < cam.span.t0) break;
    const p = easeInOut(progressOf(t, cam.span));
    rect = {
      x: lerp(cam.from.x, cam.to.x, p),
      y: lerp(cam.from.y, cam.to.y, p),
      w: Math.exp(lerp(Math.log(cam.from.w), Math.log(cam.to.w), p)),
      h: Math.exp(lerp(Math.log(cam.from.h), Math.log(cam.to.h), p)),
    };
  }
  return rect;
}

/**
 * Opacity of each snapshot in a frame at time t. The first show fades the
 * frame in; later shows crossfade from the previous snapshot.
 */
export function snapOpacities(c: Compiled, frame: string, count: number, t: number): number[] {
  const out = new Array<number>(count).fill(0);
  let current = -1;
  for (const show of c.shows) {
    if (show.frame !== frame || t < show.span.t0) continue;
    const p = easeInOut(progressOf(t, show.span));
    if (current >= 0) out[current] = 1 - p;
    out[show.snap] = p;
    current = show.snap;
  }
  return out.map(clamp01);
}
