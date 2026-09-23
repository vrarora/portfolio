import { rgba, seeded, between, mix, type RGB } from "../engine/math";
import type { Sky } from "../engine/timeline";

type Star = { x: number; y: number; r: number; phase: number; speed: number };

export type SkyField = { stars: Star[]; band: { x: number; y: number; r: number }[] };

export function createSkyField(): SkyField {
  const rand = seeded(11);
  const stars: Star[] = Array.from({ length: 260 }, () => ({
    x: rand(),
    y: Math.pow(rand(), 1.4) * 0.78,
    r: rand() < 0.06 ? between(rand, 1.1, 1.7) : between(rand, 0.35, 0.95),
    phase: rand() * Math.PI * 2,
    speed: between(rand, 0.4, 1.6),
  }));
  const band = Array.from({ length: 9 }, (_, i) => ({
    x: 0.05 + i * 0.115 + between(rand, -0.03, 0.03),
    y: 0.62 - i * 0.07 + between(rand, -0.03, 0.03),
    r: between(rand, 0.12, 0.2),
  }));
  return { stars, band };
}

export function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sky: Sky,
  field: SkyField,
  time: number,
  horizonY: number,
) {
  const g = ctx.createLinearGradient(0, 0, 0, horizonY);
  g.addColorStop(0, rgba(sky.zenith));
  g.addColorStop(0.45, rgba(sky.upper));
  g.addColorStop(0.8, rgba(sky.lower));
  g.addColorStop(1, rgba(sky.horizon));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (sky.stars > 0.01) drawNight(ctx, w, h, sky, field, time);

  const sx = sky.sunX * w;
  const sy = sky.sunY * h;
  const reach = Math.max(w, h);

  if (sky.rays > 0.01) drawRays(ctx, sx, sy, reach, sky.sun, sky.rays, time);

  if (sky.glow > 0.01) {
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, reach * 0.55);
    glow.addColorStop(0, rgba(sky.sun, 0.75 * sky.glow));
    glow.addColorStop(0.12, rgba(sky.sun, 0.35 * sky.glow));
    glow.addColorStop(0.45, rgba(sky.horizon, 0.12 * sky.glow));
    glow.addColorStop(1, rgba(sky.horizon, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const disc = Math.min(w, h) * 0.045;
    ctx.fillStyle = rgba(mix(sky.sun, [255, 255, 255], 0.5), Math.min(1, sky.glow * 1.2));
    ctx.beginPath();
    ctx.arc(sx, sy, disc, 0, Math.PI * 2);
    ctx.fill();
  }

  // A thin band of warm light that sits right on the horizon.
  const haze = ctx.createLinearGradient(0, horizonY - h * 0.12, 0, horizonY + h * 0.02);
  haze.addColorStop(0, rgba(sky.horizon, 0));
  haze.addColorStop(1, rgba(sky.horizon, 0.55 * sky.haze));
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizonY - h * 0.12, w, h * 0.14);
}

function drawNight(ctx: CanvasRenderingContext2D, w: number, h: number, sky: Sky, field: SkyField, time: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const b of field.band) {
    const r = b.r * Math.max(w, h);
    const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, r);
    g.addColorStop(0, `rgba(120,110,190,${0.06 * sky.stars})`);
    g.addColorStop(1, "rgba(120,110,190,0)");
    ctx.fillStyle = g;
    ctx.fillRect(b.x * w - r, b.y * h - r, r * 2, r * 2);
  }
  for (const s of field.stars) {
    const twinkle = 0.65 + 0.35 * Math.sin(time * s.speed + s.phase);
    ctx.fillStyle = `rgba(255,248,235,${sky.stars * twinkle * (s.r > 1 ? 1 : 0.8)})`;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const moonX = w * 0.16;
  // On tall screens the story text fills the top, so the moon sits lower.
  const moonY = h > w ? h * 0.27 : h * 0.14;
  const mr = Math.min(w, h) * 0.028;
  const glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, mr * 6);
  glow.addColorStop(0, `rgba(230,230,255,${0.18 * sky.stars})`);
  glow.addColorStop(1, "rgba(230,230,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(moonX - mr * 6, moonY - mr * 6, mr * 12, mr * 12);

  ctx.save();
  ctx.beginPath();
  ctx.arc(moonX, moonY, mr, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(moonX, moonY, mr, 0, Math.PI * 2);
  ctx.arc(moonX + mr * 0.45, moonY - mr * 0.2, mr * 0.88, 0, Math.PI * 2, true);
  ctx.fillStyle = `rgba(250,246,230,${0.92 * sky.stars})`;
  ctx.fill("evenodd");
  ctx.restore();
}

function drawRays(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  reach: number,
  color: RGB,
  amount: number,
  time: number,
) {
  const count = 28;
  const spin = time * 0.012;
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, reach * 1.1);
  g.addColorStop(0, rgba(color, 0.2 * amount));
  g.addColorStop(0.5, rgba(color, 0.07 * amount));
  g.addColorStop(1, rgba(color, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < count; i += 1) {
    const a0 = spin + (i / count) * Math.PI * 2;
    const a1 = a0 + (Math.PI / count) * 0.9;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(a0) * reach * 1.5, sy + Math.sin(a0) * reach * 1.5);
    ctx.lineTo(sx + Math.cos(a1) * reach * 1.5, sy + Math.sin(a1) * reach * 1.5);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

/** Small flocks crossing the sky; `amount` fades them in and out. */
export function drawBirds(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, amount: number, color: string) {
  if (amount < 0.01) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = amount;
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.0022);
  ctx.lineCap = "round";
  const flocks = [
    { y: 0.2, speed: 0.012, offset: 0.1, size: 1 },
    { y: 0.32, speed: 0.009, offset: 0.55, size: 0.8 },
  ];
  for (const f of flocks) {
    const base = ((time * f.speed + f.offset) % 1.3) - 0.15;
    for (let i = 0; i < 5; i += 1) {
      const bx = (base - i * 0.018) * w;
      const by = (f.y + Math.sin(i * 1.7) * 0.02) * h;
      const s = Math.min(w, h) * 0.008 * f.size;
      const flap = Math.sin(time * 6 + i * 1.3) * s * 0.5;
      ctx.beginPath();
      ctx.moveTo(bx - s, by - flap);
      ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.3, bx, by);
      ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.3, bx + s, by - flap);
      ctx.stroke();
    }
  }
  ctx.restore();
}

type Cloud = { x: number; y: number; scale: number; speed: number; blobs: { dx: number; dy: number; r: number }[] };

export function createClouds(): Cloud[] {
  const rand = seeded(23);
  return Array.from({ length: 9 }, (_, i) => ({
    x: rand() * 1.4 - 0.2,
    y: 0.08 + (i % 3) * 0.1 + rand() * 0.08,
    scale: between(rand, 0.7, 1.3),
    speed: between(rand, 0.002, 0.006),
    blobs: Array.from({ length: 7 }, (_, b) => ({
      dx: (b - 3) * between(rand, 0.025, 0.04),
      dy: -Math.sin((b / 6) * Math.PI) * between(rand, 0.015, 0.03),
      r: between(rand, 0.035, 0.06) * (1 - Math.abs(b - 3) * 0.12),
    })),
  }));
}

/**
 * Soft clouds lit from below by the horizon. `amount` sets how many show;
 * `heavy` pulls them low and dark into a monsoon bank.
 */
export function drawClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  clouds: Cloud[],
  sky: Sky,
  time: number,
  amount: number,
  heavy: number,
) {
  if (amount < 0.01) return;
  const size = Math.max(w, h);
  const lit = mix(mix(sky.horizon, sky.sun, 0.3), sky.upper, heavy * 0.8);
  const shade = mix(mix(sky.upper, sky.zenith, 0.5), [18, 20, 32], heavy * 0.6);
  const visible = Math.ceil(clouds.length * amount);
  for (let i = 0; i < visible; i += 1) {
    const c = clouds[i];
    const cx = (((c.x + time * c.speed) % 1.4) - 0.2) * w;
    const cy = (c.y * (1 - heavy * 0.4)) * h;
    const scale = c.scale * (1 + heavy * 0.8);
    for (const b of c.blobs) {
      const bx = cx + b.dx * size * scale;
      const by = cy + b.dy * size * scale;
      const r = b.r * size * scale;
      const g = ctx.createRadialGradient(bx, by + r * 0.35, r * 0.1, bx, by, r);
      g.addColorStop(0, rgba(lit, 0.32 * amount));
      g.addColorStop(0.55, rgba(shade, 0.22 * amount));
      g.addColorStop(1, rgba(shade, 0));
      ctx.fillStyle = g;
      ctx.fillRect(bx - r, by - r, r * 2, r * 2);
    }
  }
}

/** Sunlight that spills over the edges of whatever stands in front of it. */
export function drawBloom(ctx: CanvasRenderingContext2D, w: number, h: number, sky: Sky, strength: number) {
  const amount = sky.glow * strength;
  if (amount < 0.01) return;
  const sx = sky.sunX * w;
  const sy = sky.sunY * h;
  const r = Math.max(w, h) * 0.5;
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
  g.addColorStop(0, rgba(sky.sun, 0.35 * amount));
  g.addColorStop(0.3, rgba(sky.sun, 0.1 * amount));
  g.addColorStop(1, rgba(sky.sun, 0));
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * A handful of stars that draw themselves into a shape. `reveal` runs the
 * joining lines out one after another; `amount` fades the whole figure.
 */
export function drawConstellation(
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  edges: readonly (readonly [number, number])[],
  time: number,
  amount: number,
  reveal: number,
) {
  if (amount < 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(214,222,255,${0.32 * amount})`;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.beginPath();
  edges.forEach(([a, b], i) => {
    const t = Math.min(1, reveal * edges.length - i);
    if (t <= 0) return;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * t);
  });
  ctx.stroke();

  points.forEach(([x, y], i) => {
    const twinkle = 0.75 + 0.25 * Math.sin(time * (1.1 + i * 0.23) + i * 1.9);
    const r = 12 + (i % 3) * 3;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,244,222,${0.55 * amount * twinkle})`);
    g.addColorStop(0.25, `rgba(255,226,180,${0.16 * amount * twinkle})`);
    g.addColorStop(1, "rgba(255,226,180,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = `rgba(255,250,238,${amount})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + (i % 2) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}
