import { seeded, between } from "../engine/math";
import { drawTree } from "./hill";

/**
 * Open country for the second act. Ridges are drawn from a few summed waves,
 * so they cost nothing to build and scroll forever. Positions along the way
 * are world x: screen x plus the camera, scaled by each layer's parallax.
 */

type Wave = { f: number; a: number; phase: number };

/** Rolling hills, mountain peaks, or the rounded tops of a line of trees. */
export type RidgeShape = "roll" | "peak" | "puff";

export type Ridge = { base: number; amp: number; parallax: number; shape: RidgeShape; waves: readonly Wave[] };

type RidgeSpec = {
  /** Height of the ridge's lowest point above the ground, in px. */
  base: number;
  /** How far the ridge rises above its base, in px. */
  amp: number;
  /** Length of the broadest wave, in px. */
  length: number;
  parallax: number;
  shape?: RidgeShape;
  detail?: number;
};

export function createRidge(seed: number, spec: RidgeSpec): Ridge {
  const rand = seeded(seed);
  const detail = spec.detail ?? 3;
  const raw = Array.from({ length: detail }, (_, i) => ({
    f: ((Math.PI * 2) / spec.length) * (1 + i * 1.9 + rand() * 0.6),
    a: 1 / (1 + i * 1.4),
    phase: rand() * Math.PI * 2,
  }));
  const total = raw.reduce((sum, w) => sum + w.a, 0);
  return {
    base: spec.base,
    amp: spec.amp,
    parallax: spec.parallax,
    shape: spec.shape ?? "roll",
    waves: raw.map((w) => ({ ...w, a: w.a / total })),
  };
}

/** Height of the ridge at a world x, 0..1. */
function ridgeHeight(r: Ridge, x: number) {
  let y = 0;
  for (const w of r.waves) {
    const s = Math.sin(w.f * x + w.phase);
    y += w.a * (r.shape === "peak" ? 1 - Math.abs(s) : r.shape === "puff" ? Math.abs(s) : 0.5 + 0.5 * s);
  }
  return y;
}

export function drawRidge(ctx: CanvasRenderingContext2D, r: Ridge, camera: number, ground: number, w: number, h: number, color: string) {
  const step = 6;
  const offset = camera * r.parallax;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w + step; x += step) {
    ctx.lineTo(x, ground - r.base - r.amp * ridgeHeight(r, x + offset));
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

export type Tree = { x: number; scale: number; lean: number };

/** Trees along the way, thicker after `parkFrom`, kept clear of the places he passes. */
export function createTrees(u: number, span: number, parkFrom: number, clear: readonly number[]): Tree[] {
  const rand = seeded(53);
  const trees: Tree[] = [];
  let x = -u * 20;
  while (x < span) {
    const park = x > parkFrom;
    x += between(rand, park ? 16 : 30, park ? 34 : 70) * u;
    if (clear.some((c) => Math.abs(c - x) < u * 18)) continue;
    trees.push({ x, scale: between(rand, 0.7, 1.15), lean: between(rand, -0.04, 0.04) });
  }
  return trees;
}

export function drawTrees(ctx: CanvasRenderingContext2D, trees: readonly Tree[], camera: number, ground: number, u: number, w: number, color: string, time: number) {
  for (const t of trees) {
    const x = t.x - camera;
    if (x < -u * 20 || x > w + u * 20) continue;
    ctx.save();
    ctx.translate(x, ground);
    ctx.rotate(t.lean);
    ctx.scale(t.scale, t.scale);
    drawTree(ctx, 0, 0, u, color, time + t.x);
    ctx.restore();
  }
}

export type Blade = { x: number; h: number; w: number; lean: number; phase: number };

/** Grass along the ground, in world x across `span`. */
export function createGrass(seed: number, u: number, span: number, count: number): Blade[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * span,
    h: between(rand, 0.8, 2.8) * u,
    w: between(rand, 0.18, 0.4) * u,
    lean: between(rand, -0.4, 0.9) * u,
    phase: rand() * Math.PI * 2,
  }));
}

/** Blades wrap around `span`, so the grass never runs out. `breeze` sets how far they bend. */
export function drawGrass(
  ctx: CanvasRenderingContext2D,
  blades: readonly Blade[],
  camera: number,
  ground: number,
  span: number,
  w: number,
  color: string,
  time: number,
  breeze: number,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const b of blades) {
    const x = ((((b.x - camera) % span) + span) % span) - (span - w) / 2;
    if (x < -10 || x > w + 10) continue;
    const bend = b.lean + Math.sin(time * 1.3 + b.phase + x * 0.004) * b.h * 0.35 * breeze;
    ctx.moveTo(x - b.w, ground + 1);
    ctx.quadraticCurveTo(x + bend * 0.4, ground - b.h * 0.6, x + bend, ground - b.h);
    ctx.quadraticCurveTo(x + bend * 0.2, ground - b.h * 0.4, x + b.w, ground + 1);
  }
  ctx.fill();
}

/** A park bench seen side on. `seat` is the seat's height above the ground. */
export function drawBench(ctx: CanvasRenderingContext2D, x: number, ground: number, u: number, seat: number, color: string) {
  const half = u * 5;
  const top = ground - seat;
  ctx.fillStyle = color;
  ctx.fillRect(x - half, top - u * 0.3, half * 2, u * 0.7);
  ctx.fillRect(x - half + u * 0.8, top, u * 0.5, seat);
  ctx.fillRect(x + half - u * 1.3, top, u * 0.5, seat);
  // The backrest, on the far side from where the sitter faces.
  ctx.fillRect(x + u * 1.2, top - u * 4.6, u * 0.45, u * 4.6);
  ctx.fillRect(x - half + u * 0.4, top - u * 4.4, half * 2 - u * 0.8, u * 0.55);
  ctx.fillRect(x - half + u * 0.4, top - u * 2.6, half * 2 - u * 0.8, u * 0.45);
}

/** A tall arched doorway; returns the middle of its opening, where the light sits. */
export function drawGate(ctx: CanvasRenderingContext2D, x: number, ground: number, u: number, color: string, light: string): [number, number] {
  const inner = u * 3.2;
  const tall = u * 17;
  const pillar = u * 1.6;
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(x - inner, ground);
  ctx.lineTo(x - inner, ground - tall + inner);
  ctx.arc(x, ground - tall + inner, inner, Math.PI, 0);
  ctx.lineTo(x + inner, ground);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - inner - pillar, ground);
  ctx.lineTo(x - inner - pillar, ground - tall - u * 1.2);
  ctx.lineTo(x + inner + pillar, ground - tall - u * 1.2);
  ctx.lineTo(x + inner + pillar, ground);
  ctx.lineTo(x + inner, ground);
  ctx.lineTo(x + inner, ground - tall + inner);
  ctx.arc(x, ground - tall + inner, inner, 0, Math.PI, true);
  ctx.lineTo(x - inner, ground);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x - inner - pillar - u * 0.8, ground - tall - u * 2.2, (inner + pillar) * 2 + u * 1.6, u * 1);
  return [x, ground - tall * 0.45];
}

/** A sweets cart on two wheels, under a canopy with a lamp; returns where the lamp hangs. */
export function drawCart(ctx: CanvasRenderingContext2D, x: number, ground: number, u: number, color: string): [number, number] {
  const half = u * 6.5;
  const wheel = u * 2.3;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";

  ctx.lineWidth = u * 0.45;
  for (const wx of [x - half * 0.55, x + half * 0.55]) {
    ctx.beginPath();
    ctx.arc(wx, ground - wheel, wheel, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(a) * wheel, ground - wheel - Math.sin(a) * wheel);
      ctx.lineTo(wx + Math.cos(a) * wheel, ground - wheel + Math.sin(a) * wheel);
      ctx.stroke();
    }
  }

  const deck = ground - wheel * 1.4;
  ctx.fillRect(x - half, deck - u * 4.2, half * 2, u * 4.2);
  // Trays of sweets heaped on the counter.
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const tx = x - half * 0.75 + i * half * 0.5;
    ctx.moveTo(tx - u * 1.4, deck - u * 4.2);
    ctx.quadraticCurveTo(tx, deck - u * 6, tx + u * 1.4, deck - u * 4.2);
  }
  ctx.fill();
  // The handles, reaching back toward whoever pushes it.
  ctx.lineWidth = u * 0.5;
  ctx.beginPath();
  ctx.moveTo(x - half, deck - u * 1.5);
  ctx.lineTo(x - half - u * 4, deck - u * 3.2);
  ctx.stroke();

  ctx.lineWidth = u * 0.35;
  ctx.beginPath();
  ctx.moveTo(x - half + u * 0.5, deck - u * 4.2);
  ctx.lineTo(x - half + u * 0.5, deck - u * 13);
  ctx.moveTo(x + half - u * 0.5, deck - u * 4.2);
  ctx.lineTo(x + half - u * 0.5, deck - u * 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - half - u * 1.4, deck - u * 12.4);
  ctx.quadraticCurveTo(x, deck - u * 15.2, x + half + u * 1.4, deck - u * 12.4);
  ctx.lineTo(x + half + u * 1.4, deck - u * 11.6);
  ctx.quadraticCurveTo(x, deck - u * 14, x - half - u * 1.4, deck - u * 11.6);
  ctx.closePath();
  ctx.fill();

  const lampX = x + half * 0.2;
  const lampY = deck - u * 9.6;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lampX, deck - u * 13.6);
  ctx.lineTo(lampX, lampY - u * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(lampX, lampY, u * 0.7, u * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  return [lampX, lampY];
}
