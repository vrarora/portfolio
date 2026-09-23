import { seeded, between, rgba, type RGB } from "../engine/math";

export type Hill = { cx: number; cy: number; r: number };

export type Blade = { x: number; h: number; w: number; lean: number };

export const hillSurface = (hill: Hill, x: number) => {
  const dx = Math.min(Math.abs(x - hill.cx), hill.r);
  return hill.cy - Math.sqrt(hill.r * hill.r - dx * dx);
};

export function createBlades(u: number): Blade[] {
  const rand = seeded(41);
  return Array.from({ length: 220 }, () => ({
    x: between(rand, -0.6, 0.6),
    h: between(rand, 0.6, 2.2) * u,
    w: between(rand, 0.15, 0.35) * u,
    lean: between(rand, -0.8, 1.2) * u,
  }));
}

export function drawHill(ctx: CanvasRenderingContext2D, hill: Hill, fill: string, rim: RGB, rimAmount: number, blades: Blade[], viewW: number) {
  ctx.beginPath();
  ctx.arc(hill.cx, hill.cy, hill.r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  for (const b of blades) {
    const x = hill.cx + b.x * viewW;
    const y = hillSurface(hill, x);
    ctx.moveTo(x - b.w, y + 1);
    ctx.quadraticCurveTo(x + b.lean * 0.4, y - b.h * 0.6, x + b.lean, y - b.h);
    ctx.quadraticCurveTo(x + b.lean * 0.2, y - b.h * 0.4, x + b.w, y + 1);
  }
  ctx.fill();

  if (rimAmount > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(rim, 0.35 * rimAmount);
    ctx.beginPath();
    ctx.arc(hill.cx, hill.cy, hill.r, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string, time: number) {
  const sway = Math.sin(time * 0.7) * u * 0.25;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - u * 0.9, y + u * 0.5);
  ctx.quadraticCurveTo(x - u * 0.5, y - u * 6, x - u * 0.2 + sway * 0.3, y - u * 10);
  ctx.lineTo(x + u * 0.6 + sway * 0.3, y - u * 10);
  ctx.quadraticCurveTo(x + u * 0.5, y - u * 6, x + u * 1, y + u * 0.5);
  ctx.fill();
  const blobs: [number, number, number][] = [
    [0, -14, 5.2],
    [-4.4, -11.5, 3.8],
    [4.2, -12, 4],
    [-2, -17.2, 3.6],
    [2.6, -16.8, 3.4],
  ];
  ctx.beginPath();
  for (const [bx, by, br] of blobs) {
    ctx.moveTo(x + bx * u + sway + br * u, y + by * u);
    ctx.arc(x + bx * u + sway, y + by * u, br * u, 0, Math.PI * 2);
  }
  ctx.fill();
}

/** A street lamp; returns where its light sits so a glow can be drawn there. */
export function drawLampPost(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string): [number, number] {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - u * 1.4, y);
  ctx.lineTo(x + u * 1.4, y);
  ctx.lineTo(x + u * 0.8, y - u * 1.4);
  ctx.lineTo(x + u * 0.3, y - u * 1.6);
  ctx.lineTo(x + u * 0.3, y - u * 21);
  ctx.lineTo(x - u * 0.3, y - u * 21);
  ctx.lineTo(x - u * 0.3, y - u * 1.6);
  ctx.lineTo(x - u * 0.8, y - u * 1.4);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = u * 0.45;
  ctx.beginPath();
  ctx.moveTo(x, y - u * 21);
  ctx.quadraticCurveTo(x + u * 0.8, y - u * 23.4, x + u * 3.6, y - u * 22.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + u * 2.6, y - u * 22.4);
  ctx.lineTo(x + u * 4.6, y - u * 22.4);
  ctx.lineTo(x + u * 4.2, y - u * 19.8);
  ctx.lineTo(x + u * 3, y - u * 19.8);
  ctx.closePath();
  ctx.fill();
  return [x + u * 3.6, y - u * 20.6];
}

/** A plain telegraph pole with a cross arm; returns the two insulator tips for wires. */
export function drawPole(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string): [[number, number], [number, number]] {
  ctx.fillStyle = color;
  ctx.fillRect(x - u * 0.3, y - u * 24, u * 0.6, u * 24.5);
  ctx.fillRect(x - u * 3, y - u * 22.5, u * 6, u * 0.5);
  return [
    [x - u * 2.6, y - u * 22.6],
    [x + u * 2.6, y - u * 22.6],
  ];
}

/** A crossroads sign: one arm points down the paved road, the other up toward the hills. */
export function drawSignpost(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x - u * 0.35, y - u * 17, u * 0.7, u * 17.5);
  const board = (top: number, dir: 1 | -1, tilt: number) => {
    ctx.save();
    ctx.translate(x, top);
    ctx.rotate(tilt * dir);
    ctx.beginPath();
    ctx.moveTo(0, -u * 1.1);
    ctx.lineTo(u * 6.2 * dir, -u * 1.1);
    ctx.lineTo(u * 7.6 * dir, 0);
    ctx.lineTo(u * 6.2 * dir, u * 1.1);
    ctx.lineTo(0, u * 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  board(y - u * 15, 1, 0.04);
  board(y - u * 11.5, -1, 0.16);
}

/**
 * A far hill with a path winding up it into warm mist: the road he didn't take.
 * `glow` is the colour of the light behind its crest.
 */
export function drawFarHill(
  ctx: CanvasRenderingContext2D,
  x: number,
  base: number,
  u: number,
  body: string,
  path: string,
  glow: RGB,
  amount: number,
  time: number,
) {
  const w = u * 46;
  const h = u * 22;
  const crest: [number, number] = [x, base - h];

  const light = ctx.createRadialGradient(crest[0], crest[1], 0, crest[0], crest[1], u * 40);
  light.addColorStop(0, rgba(glow, 0.45 * amount));
  light.addColorStop(0.4, rgba(glow, 0.12 * amount));
  light.addColorStop(1, rgba(glow, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = light;
  ctx.fillRect(crest[0] - u * 40, crest[1] - u * 40, u * 80, u * 80);
  ctx.restore();

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x - w, base + u * 2);
  ctx.bezierCurveTo(x - w * 0.55, base - h * 0.2, x - w * 0.35, base - h, x, base - h);
  ctx.bezierCurveTo(x + w * 0.35, base - h, x + w * 0.55, base - h * 0.2, x + w, base + u * 2);
  ctx.closePath();
  ctx.fill();

  // A lone tree on the crest, swaying a little.
  const sway = Math.sin(time * 0.6) * u * 0.2;
  ctx.fillRect(crest[0] - u * 0.25, crest[1] - u * 4, u * 0.5, u * 4.2);
  ctx.beginPath();
  for (const [bx, by, br] of [[0, -5.6, 2], [-1.6, -4.6, 1.5], [1.6, -4.8, 1.5]] as const) {
    ctx.moveTo(crest[0] + bx * u + sway + br * u, crest[1] + by * u);
    ctx.arc(crest[0] + bx * u + sway, crest[1] + by * u, br * u, 0, Math.PI * 2);
  }
  ctx.fill();

  // The path winds from the foot of the hill to the tree, thinning with distance.
  ctx.strokeStyle = path;
  ctx.lineCap = "round";
  const steps = 40;
  let last: [number, number] = [x + w * 0.62, base + u];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const px = x + w * 0.62 * (1 - t) + Math.sin(t * Math.PI * 3) * u * 7 * (1 - t);
    const py = base + u - (h + u) * Math.pow(t, 0.9);
    ctx.lineWidth = Math.max(0.6, u * 0.9 * (1 - t * 0.85));
    ctx.beginPath();
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(px, py);
    ctx.stroke();
    last = [px, py];
  }
}
