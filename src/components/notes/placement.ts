import { NOTE_ROTATION_MAX } from "@/shared/limits";

type Placed = { x: number; y: number };

const COLS = 4;
const ROWS = 3;
const MARGIN_X = 0.19;
const MARGIN_Y = 0.22;

/** Picks a spot in the emptiest grid cell, jittered, so new notes avoid piles. */
export function pickPlacement(existing: Placed[], random = Math.random): Placed & { rotation: number } {
  const counts = new Array(COLS * ROWS).fill(0) as number[];
  for (const n of existing) {
    const c = Math.min(COLS - 1, Math.floor(n.x * COLS));
    const r = Math.min(ROWS - 1, Math.floor(n.y * ROWS));
    counts[r * COLS + c] += 1;
  }
  // The bottom-right cell holds the "Leave a note" button.
  counts[COLS * ROWS - 1] = Number.POSITIVE_INFINITY;
  const min = Math.min(...counts);
  const candidates = counts.map((v, i) => (v === min ? i : -1)).filter((i) => i >= 0);
  const cell = candidates[Math.floor(random() * candidates.length)];
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  const cx = (col + 0.5) / COLS;
  const cy = (row + 0.5) / ROWS;
  const jx = (random() - 0.5) * (1 / COLS) * 0.6;
  const jy = (random() - 0.5) * (1 / ROWS) * 0.6;
  return {
    x: Math.min(1 - MARGIN_X, Math.max(MARGIN_X, cx + jx)),
    y: Math.min(1 - MARGIN_Y, Math.max(MARGIN_Y, cy + jy)),
    rotation: (random() * 2 - 1) * NOTE_ROTATION_MAX * 0.6,
  };
}
