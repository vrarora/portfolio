import { seeded, between } from "../engine/math";

type Drop = { x: number; y: number; len: number; speed: number };
type Mote = { x: number; phase: number; speed: number; sway: number; size: number };

export type Atmosphere = {
  drops: Drop[];
  motes: Mote[];
  grain: HTMLCanvasElement[];
  paper: HTMLCanvasElement;
};

const GRAIN_SIZE = 160;

export function createAtmosphere(): Atmosphere {
  const rand = seeded(29);
  const drops = Array.from({ length: 170 }, () => ({
    x: rand(),
    y: rand(),
    len: between(rand, 0.018, 0.04),
    speed: between(rand, 0.9, 1.4),
  }));
  const motes = Array.from({ length: 46 }, () => ({
    x: rand(),
    phase: rand(),
    speed: between(rand, 0.035, 0.07),
    sway: between(rand, 0.004, 0.014),
    size: between(rand, 0.8, 2),
  }));
  const grain = Array.from({ length: 3 }, (_, i) => makeGrainTile(seeded(101 + i)));
  return { drops, motes, grain, paper: makePaperTile(seeded(131)) };
}

function makeGrainTile(rand: () => number) {
  const canvas = document.createElement("canvas");
  canvas.width = GRAIN_SIZE;
  canvas.height = GRAIN_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rand() - 0.5) * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

const PAPER_SIZE = 512;

/** Soft, blotchy variation like watercolour paper, so no gradient looks machine-flat. */
function makePaperTile(rand: () => number) {
  const small = document.createElement("canvas");
  small.width = 48;
  small.height = 48;
  const sctx = small.getContext("2d");
  const canvas = document.createElement("canvas");
  canvas.width = PAPER_SIZE;
  canvas.height = PAPER_SIZE;
  const ctx = canvas.getContext("2d");
  if (!sctx || !ctx) return canvas;
  const img = sctx.createImageData(48, 48);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + rand() * 36;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, PAPER_SIZE, PAPER_SIZE);
  return canvas;
}

/** One sheet stretched over the whole frame, so there are no tile seams. */
export function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number, atmos: Atmosphere) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.5;
  ctx.drawImage(atmos.paper, 0, 0, w, h);
  ctx.restore();
}

export function drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, atmos: Atmosphere, time: number, amount: number) {
  if (amount < 0.01) return;
  ctx.save();
  ctx.strokeStyle = `rgba(190,205,235,${0.32 * amount})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const d of atmos.drops) {
    const y = ((d.y + time * d.speed * 0.9) % 1.1) - 0.05;
    const x = d.x * w - y * h * 0.06;
    ctx.moveTo(x, y * h);
    ctx.lineTo(x - d.len * h * 0.06, (y + d.len) * h);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Tiny warm lights that drift up, one small thing learned each day.
 * `band` limits them to a stretch of the screen.
 */
export function drawCuriosity(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  atmos: Atmosphere,
  time: number,
  amount: number,
  groundY: number,
  band: [number, number] = [0, w],
) {
  if (amount < 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const m of atmos.motes) {
    const life = (m.phase + time * m.speed) % 1;
    const y = groundY - h * 0.08 - life * groundY * 0.85;
    const x = band[0] + (m.x + Math.sin((life + m.phase) * Math.PI * 4) * m.sway) * (band[1] - band[0]);
    const fade = Math.sin(life * Math.PI) * amount;
    const r = m.size * (1 + (1 - life) * 0.6);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
    g.addColorStop(0, `rgba(255,226,160,${0.9 * fade})`);
    g.addColorStop(0.3, `rgba(255,200,120,${0.3 * fade})`);
    g.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
  }
  ctx.restore();
}

export function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number, atmos: Atmosphere, frame: number, still: boolean) {
  const tile = atmos.grain[still ? 0 : Math.floor(frame / 3) % atmos.grain.length];
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  const ox = still ? 0 : (frame * 37) % GRAIN_SIZE;
  const oy = still ? 0 : (frame * 53) % GRAIN_SIZE;
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.07;
  ctx.translate(-ox, -oy);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w + GRAIN_SIZE, h + GRAIN_SIZE);
  ctx.restore();
}

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const r = Math.hypot(w, h) * 0.62;
  const g = ctx.createRadialGradient(w / 2, h * 0.48, r * 0.35, w / 2, h * 0.48, r);
  g.addColorStop(0, "rgba(8,6,16,0)");
  g.addColorStop(1, `rgba(8,6,16,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A soft additive light. `color` is an rgba string with A where the alpha goes. */
export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, amount: number) {
  if (amount < 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color.replace("A", String(0.5 * amount)));
  g.addColorStop(0.15, color.replace("A", String(0.18 * amount)));
  g.addColorStop(1, color.replace("A", "0"));
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}
