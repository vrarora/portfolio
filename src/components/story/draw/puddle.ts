import { rgba, mix, type RGB } from "../engine/math";
import type { Sky } from "../engine/timeline";

export type Puddle = { x: number; y: number; rx: number; ry: number };

/**
 * A still puddle on the road. It mirrors the sky, and `reflect` draws whoever
 * stands at its edge, flipped about `mirrorY`, faded in by `reflection`.
 */
export function drawPuddle(
  ctx: CanvasRenderingContext2D,
  puddle: Puddle,
  sky: Sky,
  mirrorY: number,
  time: number,
  road: RGB,
  reflection: number,
  reflect: () => void,
) {
  const { x, y, rx, ry } = puddle;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  // Upside down: the horizon sits at the near edge, the zenith at the far one.
  const g = ctx.createLinearGradient(0, y - ry, 0, y + ry);
  g.addColorStop(0, rgba(mix(sky.horizon, road, 0.25)));
  g.addColorStop(0.5, rgba(mix(sky.lower, road, 0.3)));
  g.addColorStop(1, rgba(mix(sky.upper, road, 0.4)));
  ctx.fillStyle = g;
  ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2);

  ctx.save();
  ctx.translate(0, mirrorY * 2);
  ctx.scale(1, -1);
  ctx.globalAlpha *= 0.82 * reflection;
  if (reflection > 0.01) reflect();
  ctx.restore();

  // Two soft rings, forever spreading and fading.
  for (let i = 0; i < 2; i += 1) {
    const t = (time * 0.22 + i * 0.5) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.18 * (1 - t)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x + rx * 0.35, y + ry * 0.1, rx * 0.5 * t, ry * 0.5 * t, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // A thin wet rim catches the light.
  ctx.strokeStyle = rgba(mix(sky.horizon, road, 0.5), 0.35);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
}
