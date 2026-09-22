import type { Stroke } from "../shared/strokeCodec";

export type SeedNote = {
  id: string;
  authorName: string;
  text: string;
  strokes: Stroke[];
  color: "paper" | "accent" | "gold" | "green" | "blue";
  x: number;
  y: number;
  rotation: number;
};

function circle(cx: number, cy: number, r: number, from = 0, to = Math.PI * 2, steps = 28): number[] {
  const out: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    out.push(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r));
  }
  return out;
}

const INK = "#111111";
const MOSS = "#5b7f5e";

/** Two owner notes that seed the wall and stand in when Convex is offline. */
export const seedNotes: SeedNote[] = [
  {
    id: "seed-hello",
    authorName: "Vaibhav",
    text: "First note's mine. Say hi, draw something, be kind. I read all of them.",
    strokes: [
      { c: INK, w: 2.2, p: circle(500, 500, 300) },
      { c: INK, w: 2.2, p: circle(390, 420, 22) },
      { c: INK, w: 2.2, p: circle(610, 420, 22) },
      { c: INK, w: 2.2, p: circle(500, 520, 170, Math.PI * 0.2, Math.PI * 0.8, 16) },
    ],
    color: "paper",
    x: 0.26,
    y: 0.38,
    rotation: -2,
  },
  {
    id: "seed-sky",
    authorName: "Vaibhav",
    text: "The sky in the footer is set to your hour. Scroll down and check.",
    strokes: [
      { c: INK, w: 2.2, p: [120, 640, 880, 640] },
      { c: MOSS, w: 2.2, p: circle(500, 640, 220, Math.PI, Math.PI * 2, 24) },
      { c: MOSS, w: 2.2, p: [500, 300, 500, 220] },
      { c: MOSS, w: 2.2, p: [300, 380, 250, 330] },
      { c: MOSS, w: 2.2, p: [700, 380, 750, 330] },
    ],
    color: "blue",
    x: 0.7,
    y: 0.6,
    rotation: 2.5,
  },
];
