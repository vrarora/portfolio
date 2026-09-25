/**
 * Shared pieces for writing a board story: grid geometry, camera framing and
 * a builder that collects frames, drawings and steps in order.
 */
import type { Rect } from "./marks";
import { penText, penWidth, type PenFont } from "./pen/text";
import type { Drawing, Frame, Ink, Script, Step } from "./timeline";

export type SnapMeta = { width: number; height: number; anchors: Record<string, Rect> };
export type Anchors = Record<string, SnapMeta>;

/** Browser chrome above each snapshot, in world px. */
export const CHROME = 44;
export const SNAP_W = 1440;
export const SNAP_H = 900;

export const CELL_W = 2000;
export const CELL_H = 1300;
export const GAP = 240;

export const cell = (col: number, row: number): Rect => ({
  x: col * (CELL_W + GAP),
  y: row * (CELL_H + GAP),
  w: CELL_W,
  h: CELL_H,
});

export const pad = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + p * 2, h: r.h + p * 2 });

export const union = (...rs: Rect[]): Rect => {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
};

/** A camera rect of at least `minW` world px wide, centred on `r`. */
export function focus(r: Rect, minW = 1100): Rect {
  const w = Math.max(r.w + 240, minW);
  const h = Math.max(r.h + 240, w * 0.56);
  return { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h };
}

/** Fits the size so the longest line stays within `maxW`. */
export const fitSize = (text: string, maxW: number, max: number, font: PenFont = "allure") =>
  Math.min(max, (maxW / penWidth(text, 1000, font)) * 1000);

type DrawingOptions = Pick<Drawing, "layer" | "at" | "figure">;

/** A bare layer is shorthand for `{ layer }`, which keeps snapshot notes short to write. */
type InkOptions = Drawing["layer"] | DrawingOptions;

const toOptions = (options?: InkOptions): DrawingOptions => (options && "frame" in options ? { layer: options } : (options ?? {}));

/** Collects a story's frames, drawings and steps in the order they are declared. Text is written in `font`. */
export function createKit(font: PenFont = "allure") {
  const frames: Frame[] = [];
  const drawings: Drawing[] = [];
  const steps: Step[] = [];
  const figures: Record<string, Rect> = {};
  let seed = 1;

  const ink = (id: string, color: Ink, paths: string[], width: number, options?: InkOptions) => {
    drawings.push({ id, ink: color, paths, width, ...toOptions(options) });
  };

  /** Writes text with its box's top-left at (x, y). Returns the text box. */
  const write = (id: string, text: string, x: number, y: number, size: number, color: Ink = "graphite", options?: InkOptions) => {
    const t = penText(text, size, x, y, font);
    const width = t.outline ? Math.max(0.8, size * 0.012) : Math.max(2.2, size * 0.035);
    drawings.push({ id, ink: color, paths: t.paths, width, outline: t.outline, ...toOptions(options) });
    return { x, y, w: t.width, h: t.height };
  };

  const frame = (id: string, x: number, y: number, snaps: string[], extra?: Pick<Frame, "kind" | "w" | "h" | "figure">) => {
    const f: Frame = { id, x, y, snaps, ...extra };
    frames.push(f);
    return f;
  };

  const cam = (to: Rect, weight = 1.2, withPrev = false) => steps.push({ kind: "camera", to, weight, with: withPrev });
  const draw = (id: string, weight?: number, withPrev = false) => steps.push({ kind: "draw", id, weight, with: withPrev });
  const show = (f: Frame, snap: number, weight = 0.8, withPrev = false) => steps.push({ kind: "show", frame: f.id, snap, weight, with: withPrev });
  const hold = (weight: number) => steps.push({ kind: "hold", weight });

  /** Names the world rect a reading-version figure crops to. */
  const figure = (id: string, rect: Rect) => {
    figures[id] = rect;
  };

  const nextSeed = () => seed++;

  const finish = (world: Script["world"]): Script => ({ world, frames, drawings, steps, figures });

  return { ink, write, frame, cam, draw, show, hold, figure, nextSeed, finish };
}

export type Kit = ReturnType<typeof createKit>;
