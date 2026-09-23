import { rgba, mix, seeded, between, type RGB } from "../engine/math";
import type { Sky } from "../engine/timeline";
import { drawGlow } from "./atmosphere";

const WALL: RGB = [20, 17, 34];
const LAMP = "rgba(255,196,128,A)";
const SCREEN = "rgba(214,228,255,A)";

type Drop = { x: number; y: number; r: number; speed: number };

export type RoomLayout = {
  floor: number;
  hipX: number;
  deskTop: number;
  deskX0: number;
  deskX1: number;
  window: { x: number; y: number; w: number; h: number };
  lamp: [number, number];
  screen: [number, number];
};

const drops: Drop[] = (() => {
  const rand = seeded(61);
  return Array.from({ length: 60 }, () => ({ x: rand(), y: rand(), r: between(rand, 0.6, 1.8), speed: between(rand, 0.02, 0.09) }));
})();

/** Everything is placed from his seat, so the room holds together at any width. */
export function layoutRoom(w: number, h: number, u: number): RoomLayout {
  const floor = h * 0.82;
  const hipX = w / 2 - u * 8;
  const deskTop = floor - u * 9.6;
  return {
    floor,
    hipX,
    deskTop,
    deskX0: hipX + u * 3,
    deskX1: hipX + u * 36,
    window: { x: hipX - u * 34, y: floor - u * 58, w: u * 26, h: u * 34 },
    lamp: [hipX + u * 27.5, deskTop - u * 11.5],
    screen: [hipX + u * 10.3, deskTop - u * 3.4],
  };
}

export function drawRoomBack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  u: number,
  room: RoomLayout,
  sky: Sky,
  time: number,
  rain: number,
  lampAmount: number,
  seatY: number,
) {
  ctx.fillStyle = rgba(WALL);
  ctx.fillRect(0, 0, w, h);

  // The window: night outside, far rooftops, rain on the glass.
  const { x, y, w: ww, h: wh } = room.window;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, ww, wh);
  ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + wh);
  g.addColorStop(0, rgba(sky.zenith));
  g.addColorStop(0.7, rgba(sky.lower));
  g.addColorStop(1, rgba(sky.horizon));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, ww, wh);
  ctx.fillStyle = `rgba(255,248,235,${0.7 * sky.stars})`;
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect(x + ((i * 0.618) % 1) * ww, y + ((i * 0.37) % 0.6) * wh, 1.2, 1.2);
  }
  const roof = rgba(mix(WALL, sky.lower, 0.25));
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x, y + wh);
  const steps = [0.78, 0.7, 0.74, 0.62, 0.72, 0.66, 0.76];
  steps.forEach((s, i) => {
    ctx.lineTo(x + (i / steps.length) * ww, y + wh * s);
    ctx.lineTo(x + ((i + 1) / steps.length) * ww, y + wh * s);
  });
  ctx.lineTo(x + ww, y + wh);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + ww * 0.52, y + wh * 0.62, ww * 0.07, wh * 0.06, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(255,196,122,0.55)";
  for (const [fx, fy] of [[0.12, 0.84], [0.33, 0.8], [0.61, 0.76], [0.86, 0.86]]) ctx.fillRect(x + ww * fx, y + wh * fy, u * 0.8, u * 1.1);

  if (rain > 0.01) {
    ctx.strokeStyle = `rgba(200,212,240,${0.22 * rain})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of drops) {
      const dy = ((d.y + time * d.speed) % 1) * wh;
      ctx.moveTo(x + d.x * ww, y + dy);
      ctx.lineTo(x + d.x * ww + 0.6, y + dy + d.r * u * 1.4);
    }
    ctx.stroke();
    ctx.fillStyle = `rgba(210,222,250,${0.3 * rain})`;
    for (const d of drops) {
      ctx.beginPath();
      ctx.arc(x + ((d.x * 1.7) % 1) * ww, y + ((d.y * 1.3 + time * d.speed * 0.3) % 1) * wh, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  const frame = rgba(mix(WALL, [0, 0, 0], 0.5));
  ctx.fillStyle = frame;
  ctx.fillRect(x - u * 0.8, y - u * 0.8, ww + u * 1.6, u * 0.8);
  ctx.fillRect(x - u * 0.8, y + wh, ww + u * 1.6, u * 1.2);
  ctx.fillRect(x - u * 0.8, y, u * 0.8, wh);
  ctx.fillRect(x + ww, y, u * 0.8, wh);
  ctx.fillRect(x + ww / 2 - u * 0.3, y, u * 0.6, wh);
  ctx.fillRect(x, y + wh * 0.45, ww, u * 0.5);

  // Moonlight falling through the window onto the floor.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(150,170,230,${0.05 * sky.stars})`;
  ctx.beginPath();
  ctx.moveTo(x, y + wh);
  ctx.lineTo(x + ww, y + wh);
  ctx.lineTo(x + ww + u * 18, room.floor);
  ctx.lineTo(x + u * 10, room.floor);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawGlow(ctx, room.lamp[0], room.lamp[1] + u * 3, u * 40, LAMP, 0.55 * lampAmount);

  const ink = rgba(mix(WALL, [0, 0, 0], 0.62));
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";

  // Floor.
  ctx.fillRect(0, room.floor, w, h - room.floor);

  // Shelf with books and a small plant.
  const shelfY = room.deskTop - u * 20;
  ctx.fillRect(room.deskX0 + u * 6, shelfY, u * 22, u * 0.6);
  const books = [3.2, 3.8, 2.6, 3.4, 4, 2.8, 3.6];
  let bx = room.deskX0 + u * 7;
  books.forEach((bh, i) => {
    const bw = u * (0.9 + (i % 3) * 0.25);
    ctx.fillRect(bx, shelfY - bh * u, bw, bh * u);
    bx += bw + u * 0.15;
  });
  ctx.fillRect(bx + u * 5, shelfY - u * 1.6, u * 1.8, u * 1.6);
  ctx.beginPath();
  for (const [lx, ly, lr] of [[0.2, -3, 1.1], [1.4, -3.4, 1], [0.8, -4.3, 0.9]]) {
    ctx.moveTo(bx + u * (5 + lx) + lr * u, shelfY + ly * u);
    ctx.arc(bx + u * (5 + lx), shelfY + ly * u, lr * u, 0, Math.PI * 2);
  }
  ctx.fill();

  // Desk.
  ctx.fillRect(room.deskX0, room.deskTop, room.deskX1 - room.deskX0, u * 1);
  ctx.fillRect(room.deskX1 - u * 1.4, room.deskTop, u * 0.9, room.floor - room.deskTop);
  ctx.fillRect(room.deskX0 + u * 12, room.deskTop, u * 0.9, room.floor - room.deskTop);

  // Lamp on the desk.
  const [lx, ly] = room.lamp;
  ctx.beginPath();
  ctx.ellipse(lx + u * 2.4, room.deskTop - u * 0.3, u * 2, u * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = u * 0.4;
  ctx.beginPath();
  ctx.moveTo(lx + u * 2.4, room.deskTop - u * 0.4);
  ctx.lineTo(lx + u * 3.4, ly + u * 4);
  ctx.lineTo(lx + u * 1, ly + u * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx + u * 1.8, ly - u * 0.6);
  ctx.lineTo(lx - u * 1.6, ly + u * 1.2);
  ctx.lineTo(lx - u * 0.4, ly + u * 3.2);
  ctx.closePath();
  ctx.fill();

  // Journal and a cup beside the lamp.
  ctx.fillRect(lx - u * 6, room.deskTop - u * 0.6, u * 4, u * 0.6);
  ctx.fillRect(lx - u * 10.5, room.deskTop - u * 2, u * 1.6, u * 2);

  // Chair, built up to meet his hips.
  ctx.fillRect(room.hipX - u * 3.2, seatY, u * 5.4, u * 0.8);
  ctx.fillRect(room.hipX - u * 3.2, seatY - u * 9, u * 0.8, u * 9.8);
  ctx.fillRect(room.hipX - u * 3, seatY, u * 0.6, room.floor - seatY);
  ctx.fillRect(room.hipX + u * 1.4, seatY, u * 0.6, room.floor - seatY);

  return ink;
}

/** The laptop, and its light on his face; `pulse` makes the light breathe with his heartbeat. */
export function drawRoomLight(ctx: CanvasRenderingContext2D, u: number, room: RoomLayout, ink: string, screen: number, pulse: number, time: number) {
  const hingeX = room.hipX + u * 10;
  const baseY = room.deskTop;
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineWidth = u * 0.45;
  ctx.beginPath();
  ctx.moveTo(room.hipX + u * 5, baseY - u * 0.2);
  ctx.lineTo(hingeX, baseY - u * 0.2);
  ctx.lineTo(hingeX + u * 0.9, baseY - u * 6.4);
  ctx.stroke();

  const beat = pulse > 0 ? Math.pow(Math.max(0, Math.sin(time * Math.PI * 2.2)), 6) * 0.35 * pulse : 0;
  const light = screen * (0.9 + beat);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = SCREEN.replace("A", String(0.9 * light));
  ctx.lineWidth = u * 0.25;
  ctx.beginPath();
  ctx.moveTo(hingeX - u * 0.25, baseY - u * 0.6);
  ctx.lineTo(hingeX + u * 0.55, baseY - u * 6.1);
  ctx.stroke();
  ctx.restore();
  drawGlow(ctx, room.screen[0] - u * 1, room.screen[1], u * (26 + 8 * beat), SCREEN, light);
}
