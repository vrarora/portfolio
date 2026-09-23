/**
 * The small constellation that links to the playground. The canvas draws it
 * and the DOM places its link, so both read positions from here.
 */

/** One star per playground experiment, in a 0..1 box. */
export const STARS: readonly (readonly [number, number])[] = [
  [0, 0.62],
  [0.17, 0.34],
  [0.35, 0.47],
  [0.52, 0.12],
  [0.7, 0.3],
  [0.88, 0],
  [1, 0.44],
];

/** Pairs of star indices joined by a line, in the order they are drawn. */
export const EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 6],
];

export type Box = { x: number; y: number; w: number; h: number };

/** Below the stanza and above the mountains; centred on tall screens where the text is wide. */
export function constellationBox(w: number, h: number): Box {
  if (h > w) return { x: w * 0.2, y: h * 0.42, w: w * 0.6, h: h * 0.14 };
  return { x: w * 0.56, y: h * 0.34, w: w * 0.28, h: h * 0.18 };
}

export const starAt = (box: Box, [sx, sy]: readonly [number, number]): [number, number] => [
  box.x + sx * box.w,
  box.y + sy * box.h,
];
