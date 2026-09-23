import { seeded, between, type Rand } from "../engine/math";
import { drawFigure, walkPose, type Build } from "./figure";

/**
 * Street geometry lives in layer space: x grows along the street,
 * y is 0 at the ground and negative upward. Paths are rebuilt on resize.
 */
export type StreetLayer = {
  parallax: number;
  body: Path2D;
  warm: Path2D;
  dim: Path2D;
  /** Shop openings: lit by day, shuttered at night. */
  shop: Path2D;
  /** Shelves and goods, only seen while a shop is open. */
  goods: Path2D;
  /** Drawn last: awnings and counters. */
  detail: Path2D;
};

export type Walker = {
  x: number;
  speed: number;
  dir: 1 | -1;
  build: Build;
  phase: number;
  carry: "none" | "pot" | "basket";
};

export type Street = {
  far: StreetLayer;
  mid: StreetLayer;
  near: StreetLayer;
  bulbs: [number, number][];
  wires: Path2D;
  walkers: Walker[];
  cows: number[];
  dogs: { x: number; speed: number; dir: 1 | -1 }[];
  /** Carts, pots and a bicycle close to us, moving faster than the street. */
  foreground: Path2D;
  span: number;
};

export function createStreet(viewW: number, u: number, panLength: number): Street {
  const rand = seeded(7);
  const span = panLength + viewW * 2.5;
  const far = buildFort(rand, u, span * 0.35);
  const mid = buildHavelis(rand, u, span * 0.65);
  const near = buildShops(rand, u, span);

  const walkers: Walker[] = Array.from({ length: 26 }, (_, i) => {
    const kind = rand();
    const dir: 1 | -1 = rand() < 0.5 ? 1 : -1;
    return {
      x: between(rand, -viewW, span),
      speed: between(rand, 4.5, 8) * u * (i % 5 === 0 ? 0.6 : 1),
      dir,
      phase: rand() * Math.PI * 2,
      build: {
        height: between(rand, 17, 21) * u * (kind > 0.9 ? 0.62 : 1),
        age: kind > 0.9 ? 0.2 : 1,
        hair: kind < 0.35 ? "turban" : kind < 0.65 ? "bun" : "short",
        outfit: kind > 0.9 ? "kid" : kind < 0.35 ? "kurta" : kind < 0.65 ? "saree" : "shirt",
      },
      carry: kind >= 0.35 && kind < 0.5 ? "pot" : kind > 0.8 && kind <= 0.9 ? "basket" : "none",
    };
  });

  return {
    far,
    mid,
    near: near.layer,
    bulbs: near.bulbs,
    wires: near.wires,
    walkers,
    cows: [panLength * 0.32 + viewW * 0.55, panLength * 0.86 + viewW * 0.8],
    dogs: [
      { x: viewW * 0.2, speed: u * 7, dir: 1 },
      { x: panLength * 0.6 + viewW, speed: u * 5, dir: -1 },
    ],
    foreground: buildForeground(rand, u, span * FOREGROUND_PARALLAX),
    span,
  };
}

export const FOREGROUND_PARALLAX = 1.35;

function buildForeground(rand: Rand, u: number, length: number) {
  const path = new Path2D();
  let x = u * 30;
  while (x < length) {
    const kind = rand();
    if (kind < 0.35) {
      // A handcart with one big wheel.
      path.rect(x, -u * 6, u * 16, u * 1.4);
      path.rect(x + u * 1, -u * 9, u * 14, u * 3);
      path.moveTo(x + u * 7 + u * 3.6, -u * 3.4);
      path.arc(x + u * 7, -u * 3.4, u * 3.6, 0, Math.PI * 2);
      path.rect(x + u * 15.5, -u * 6.5, u * 6, u * 0.6);
    } else if (kind < 0.65) {
      // Clay pots, stacked.
      for (const [px, py, pr] of [[0, -2.2, 2.4], [4.6, -2.2, 2.4], [2.3, -6, 2.1], [8.8, -1.8, 1.9]]) {
        path.moveTo(x + px * u + pr * u, py * u);
        path.ellipse(x + px * u, py * u, pr * u, pr * u * 0.92, 0, 0, Math.PI * 2);
      }
    } else {
      // A bicycle, parked.
      for (const wx of [0, 9]) {
        path.moveTo(x + wx * u + u * 3.3, -u * 3.3);
        path.arc(x + wx * u, -u * 3.3, u * 3.3, 0, Math.PI * 2);
        path.moveTo(x + wx * u + u * 2.6, -u * 3.3);
        path.arc(x + wx * u, -u * 3.3, u * 2.6, 0, Math.PI * 2, true);
      }
      path.moveTo(x, -u * 3.3);
      path.lineTo(x + u * 3.5, -u * 7.5);
      path.lineTo(x + u * 8, -u * 7.5);
      path.lineTo(x + u * 9, -u * 3.3);
      path.lineTo(x + u * 8.4, -u * 3.3);
      path.lineTo(x + u * 7.6, -u * 6.8);
      path.lineTo(x + u * 4.2, -u * 6.8);
      path.lineTo(x + u * 0.8, -u * 3.3);
      path.closePath();
    }
    x += between(rand, 70, 120) * u;
  }
  return path;
}

export function drawForeground(ctx: CanvasRenderingContext2D, street: Street, camera: number, base: number, color: string) {
  ctx.save();
  ctx.translate(-camera * FOREGROUND_PARALLAX, base);
  ctx.fillStyle = color;
  ctx.fill(street.foreground);
  ctx.restore();
}

/** A stray dog, trotting or curled asleep. `wake` lifts the sleeping dog's head. */
export function drawDog(
  ctx: CanvasRenderingContext2D,
  x: number,
  ground: number,
  u: number,
  dir: 1 | -1,
  color: string,
  mode: "trot" | "sleep",
  time: number,
  wake = 0,
) {
  const s = u * 0.9;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  if (mode === "sleep") {
    const breathe = 1 + Math.sin(time * 1.6) * 0.03;
    ctx.beginPath();
    ctx.ellipse(x, ground - s * 1.8 * breathe, s * 5, s * 1.9 * breathe, 0, Math.PI, 0);
    ctx.lineTo(x + s * 5, ground);
    ctx.lineTo(x - s * 5, ground);
    ctx.closePath();
    ctx.fill();
    const hx = x + s * 4.2 * dir;
    const hy = ground - s * (1.4 + wake * 2.2);
    ctx.beginPath();
    ctx.ellipse(hx, hy, s * 1.5, s * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx + s * 1.4 * dir, hy + s * 0.3, s * 0.9, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.6 * dir, hy - s * 0.8);
    ctx.lineTo(hx - s * 0.2 * dir, hy - s * (1.8 + wake * 0.4));
    ctx.lineTo(hx + s * 0.5 * dir, hy - s * 0.9);
    ctx.fill();
    return;
  }
  const step = time * 9;
  const bodyY = ground - s * 5.6 + Math.abs(Math.sin(step)) * s * 0.25;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, s * 4.2, s * 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = s * 0.85;
  for (const [lx, phase] of [[-3, 0], [-2.2, Math.PI], [2.4, Math.PI], [3.2, 0]] as const) {
    const swing = Math.sin(step + phase) * s * 1.1;
    ctx.beginPath();
    ctx.moveTo(x + lx * s * dir, bodyY + s);
    ctx.lineTo(x + lx * s * dir + swing * dir, ground - s * 0.2);
    ctx.stroke();
  }
  const hx = x + s * 4.6 * dir;
  const hy = bodyY - s * 1.8;
  ctx.beginPath();
  ctx.ellipse(hx, hy, s * 1.5, s * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + s * 1.5 * dir, hy + s * 0.45, s * 1, s * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.7 * dir, hy - s * 0.9);
  ctx.lineTo(hx - s * 0.1 * dir, hy - s * 2.3);
  ctx.lineTo(hx + s * 0.5 * dir, hy - s * 1);
  ctx.fill();
  ctx.lineWidth = s * 0.55;
  ctx.beginPath();
  ctx.moveTo(x - s * 4 * dir, bodyY - s * 0.6);
  ctx.quadraticCurveTo(x - s * 6 * dir, bodyY - s * 3 + Math.sin(time * 6) * s * 0.6, x - s * 4.6 * dir, bodyY - s * 4);
  ctx.stroke();
}

function buildFort(rand: Rand, u: number, length: number): StreetLayer {
  const body = new Path2D();
  const warm = new Path2D();
  const dim = new Path2D();
  // The ridge the fort sits on, well above the street.
  body.moveTo(-u * 40, 0);
  for (let x = -u * 40; x <= length; x += u * 10) {
    body.lineTo(x, -u * (11 + Math.sin(x / (u * 41)) * 3 + Math.sin(x / (u * 13)) * 1));
  }
  body.lineTo(length, 0);
  body.closePath();

  let x = u * 10;
  while (x < length) {
    const wall = between(rand, 34, 60) * u;
    const top = -between(rand, 25, 30) * u;
    body.rect(x, top, wall, -top);
    crenellate(body, x, top, wall, u * 1.2, u * 0.9);
    for (const bx of [x, x + wall]) {
      const bw = u * 6;
      const bh = top - u * 4.5;
      body.rect(bx - bw / 2, bh, bw, -bh);
      crenellate(body, bx - bw / 2, bh, bw, u * 1, u * 0.9);
    }
    if (rand() < 0.75) {
      const px = x + wall * between(rand, 0.2, 0.5);
      const pw = between(rand, 14, 20) * u;
      const ph = top - between(rand, 7, 11) * u;
      body.rect(px, ph, pw, -ph);
      for (let i = 0; i < 3; i += 1) chhatri(body, px + pw * (0.18 + i * 0.32), ph, u * 3.4);
      for (let i = 0; i < 4; i += 1) arch(rand() < 0.4 ? warm : dim, px + pw * (0.12 + i * 0.22), ph + u * 2.5, u * 1.1, u * 2);
    }
    x += wall + between(rand, 30, 60) * u;
  }
  return { parallax: 0.16, body, warm, dim, shop: new Path2D(), goods: new Path2D(), detail: new Path2D() };
}

function buildHavelis(rand: Rand, u: number, length: number): StreetLayer {
  const body = new Path2D();
  const warm = new Path2D();
  const dim = new Path2D();
  let x = -u * 30;
  let placedSpire = false;
  while (x < length) {
    const w = between(rand, 16, 30) * u;
    const top = -between(rand, 15, 28) * u;
    body.rect(x, top, w, -top);

    // A smaller room on the roof, set back from the street edge.
    if (rand() < 0.35) {
      const rw = w * between(rand, 0.35, 0.55);
      const rx = x + (w - rw) * rand();
      const rh = between(rand, 5, 7) * u;
      body.rect(rx, top - rh, rw, rh);
      arch(rand() < 0.5 ? warm : dim, rx + rw / 2 - u * 1, top - rh + u * 1.5, u * 2, u * 3);
    }

    if (rand() < 0.35) crenellate(body, x - u * 0.6, top, w + u * 1.2, u * 1.4, u * 1);
    else railing(body, x, top, w, u);

    const roll = rand();
    if (!placedSpire && x > length * 0.3) {
      spire(body, x + w / 2, top, w * 0.42, u * 12);
      placedSpire = true;
    } else if (roll < 0.35) {
      chhatri(body, x + w * between(rand, 0.25, 0.75), top - u * 1.4, u * between(rand, 4, 5.5));
    } else if (roll < 0.47) {
      const fx = x + w * 0.8;
      body.rect(fx, top - u * 8, u * 0.35, u * 8);
      body.moveTo(fx + u * 0.35, top - u * 8);
      body.lineTo(fx + u * 3.4, top - u * 7);
      body.lineTo(fx + u * 0.35, top - u * 6);
      body.closePath();
    }

    // Jharokha windows, a few lit and most dim.
    const rows = Math.floor(-top / (u * 8));
    for (let r = 1; r < rows; r += 1) {
      const wy = top + r * u * 7.5;
      const cols = Math.max(1, Math.floor(w / (u * 6.5)));
      for (let c = 0; c < cols; c += 1) {
        const wx = x + (w / cols) * (c + 0.5);
        if (rand() < 0.55) arch(rand() < 0.3 ? warm : dim, wx - u * 1.1, wy, u * 2.2, u * 3.4);
      }
    }
    // Now and then a neem tree grows in the gap between two houses.
    if (rand() < 0.22) {
      const tx = x + w + u * 3;
      const top = -between(rand, 24, 32) * u;
      body.rect(tx - u * 0.5, top * 0.6, u * 1, -top * 0.6);
      for (const [bx, by, br] of [[0, 0, 5], [-4, 2.5, 3.8], [4, 2.2, 4], [-1.5, -3, 3.6], [2.4, -2.6, 3.2]]) {
        body.moveTo(tx + bx * u + br * u, top + by * u);
        body.arc(tx + bx * u, top + by * u, br * u, 0, Math.PI * 2);
      }
      x += u * 6;
    }
    x += w + between(rand, 0.5, 4) * u;
  }
  return { parallax: 0.5, body, warm, dim, shop: new Path2D(), goods: new Path2D(), detail: new Path2D() };
}

function buildShops(rand: Rand, u: number, length: number) {
  const body = new Path2D();
  const warm = new Path2D();
  const dim = new Path2D();
  const shop = new Path2D();
  const goods = new Path2D();
  const detail = new Path2D();
  const wires = new Path2D();
  const bulbs: [number, number][] = [];
  let x = -u * 40;
  let lastPole: [number, number] | null = null;

  while (x < length) {
    const w = between(rand, 16, 26) * u;
    const top = -between(rand, 19, 27) * u;
    body.rect(x, top, w, -top);
    if (rand() < 0.5) crenellate(body, x, top, w, u * 1.6, u * 0.8);
    else railing(body, x, top, w, u);

    // Lit shop opening, with a few goods on the shelves in silhouette.
    const ox = x + u * 2;
    const ow = w - u * 4;
    const oy = -u * 12.5;
    shop.rect(ox, oy, ow, -oy);
    for (const shelf of [-9.6, -6.8]) {
      const sy = shelf * u;
      goods.rect(ox, sy, ow, u * 0.3);
      let jx = ox + u * between(rand, 0.6, 2);
      while (jx < ox + ow - u * 2) {
        const kind = rand();
        if (kind < 0.35) {
          goods.moveTo(jx + u * 1.2, sy - u * 0.9);
          goods.ellipse(jx + u * 0.6, sy - u * 0.9, u * 0.6, u * 0.9, 0, 0, Math.PI * 2);
        } else if (kind < 0.6) {
          goods.rect(jx, sy - u * 1.6, u * 1.4, u * 1.6);
        } else if (kind < 0.75) {
          goods.rect(jx, sy - u * 1, u * 2.2, u * 1);
          goods.rect(jx + u * 0.4, sy - u * 1.9, u * 1.4, u * 0.9);
        }
        jx += u * between(rand, 2, 4.2);
      }
    }
    // Hanging lanterns or garlands from the awning.
    for (let hx = ox + u * between(rand, 1, 3); hx < ox + ow - u; hx += u * between(rand, 4, 7)) {
      goods.rect(hx - u * 0.06, oy, u * 0.12, u * 1.4);
      goods.moveTo(hx + u * 0.5, oy + u * 1.9);
      goods.arc(hx, oy + u * 1.9, u * 0.5, 0, Math.PI * 2);
    }
    // Counter, and the awning with a scalloped cloth edge.
    detail.rect(ox - u * 0.5, -u * 3.4, ow + u * 1, u * 3.4);
    detail.moveTo(x - u * 1.5, oy - u * 1.2);
    detail.lineTo(x + w + u * 1.5, oy - u * 1.2);
    const scallops = Math.max(4, Math.round(w / (u * 2.6)));
    const step = (w + u * 3) / scallops;
    detail.lineTo(x + w + u * 1.5, oy + u * 1.2);
    for (let i = scallops; i > 0; i -= 1) {
      const sx = x - u * 1.5 + step * i;
      detail.quadraticCurveTo(sx - step / 2, oy + u * 2.6, sx - step, oy + u * 1.2);
    }
    detail.closePath();

    // Upper windows.
    if (-top > u * 18) arch(rand() < 0.5 ? warm : dim, x + w / 2 - u * 1.4, top + u * 3, u * 2.8, u * 3.4);

    // Poles every other shop carry the strings of bulbs.
    if (rand() < 0.55) {
      const px = x + w + u * 0.2;
      const py = top - u * 3;
      body.rect(px - u * 0.25, py, u * 0.5, -py);
      if (lastPole) {
        const [lx, ly] = lastPole;
        const sag = u * 5;
        const midX = (lx + px) / 2;
        const midY = Math.max(ly, py) + sag;
        wires.moveTo(lx, ly);
        wires.quadraticCurveTo(midX, midY, px, py);
        const n = Math.max(4, Math.round((px - lx) / (u * 3.2)));
        for (let i = 1; i < n; i += 1) {
          const t = i / n;
          const bx = (1 - t) * (1 - t) * lx + 2 * (1 - t) * t * midX + t * t * px;
          const by = (1 - t) * (1 - t) * ly + 2 * (1 - t) * t * midY + t * t * py;
          bulbs.push([bx, by + u * 0.5]);
        }
      }
      lastPole = [px, py];
    }
    x += w + between(rand, 0, 1.5) * u;
  }
  return { layer: { parallax: 1, body, warm, dim, shop, goods, detail } as StreetLayer, bulbs, wires };
}

function crenellate(path: Path2D, x: number, top: number, width: number, size: number, height: number) {
  const n = Math.max(2, Math.floor(width / (size * 1.8)));
  const gap = (width - n * size) / (n - 1 || 1);
  for (let i = 0; i < n; i += 1) path.rect(x + i * (size + gap), top - height, size, height);
}

/** A roof rail on slim posts. */
function railing(path: Path2D, x: number, top: number, width: number, u: number) {
  path.rect(x, top - u * 1.5, width, u * 0.35);
  for (let px = x; px <= x + width - u * 0.3; px += u * 1.6) path.rect(px, top - u * 1.5, u * 0.3, u * 1.5);
}

function arch(path: Path2D, x: number, y: number, w: number, h: number) {
  path.moveTo(x, y + h);
  path.lineTo(x, y + w / 2);
  path.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
  path.lineTo(x + w, y + h);
  path.closePath();
}

/** A domed pavilion on slim pillars, with sky visible between them. */
function chhatri(path: Path2D, cx: number, base: number, size: number) {
  const w = size;
  const pillarH = size * 0.55;
  path.rect(cx - w * 0.6, base - size * 0.12, w * 1.2, size * 0.12);
  for (const px of [-0.5, -0.17, 0.17, 0.5]) path.rect(cx + px * w - size * 0.05, base - size * 0.12 - pillarH, size * 0.1, pillarH);
  const eave = base - size * 0.12 - pillarH;
  path.rect(cx - w * 0.62, eave - size * 0.1, w * 1.24, size * 0.12);
  path.moveTo(cx - w * 0.5, eave - size * 0.1);
  path.ellipse(cx, eave - size * 0.1, w * 0.5, size * 0.55, 0, Math.PI, 0);
  path.rect(cx - size * 0.03, eave - size * 0.85, size * 0.06, size * 0.22);
  path.moveTo(cx + size * 0.07, eave - size * 0.9);
  path.arc(cx, eave - size * 0.9, size * 0.07, 0, Math.PI * 2);
}

/** A curved temple spire (shikhara) with a finial. */
function spire(path: Path2D, cx: number, base: number, width: number, height: number) {
  path.moveTo(cx - width / 2, base);
  path.bezierCurveTo(cx - width * 0.5, base - height * 0.55, cx - width * 0.18, base - height * 0.9, cx, base - height);
  path.bezierCurveTo(cx + width * 0.18, base - height * 0.9, cx + width * 0.5, base - height * 0.55, cx + width / 2, base);
  path.closePath();
  path.rect(cx - width * 0.03, base - height * 1.12, width * 0.06, height * 0.14);
  path.moveTo(cx + width * 0.06, base - height * 1.12);
  path.arc(cx, base - height * 1.12, width * 0.06, 0, Math.PI * 2);
}

export type StreetPaint = {
  far: string;
  mid: string;
  near: string;
  buildings: string;
  crowd: string;
  shutter: string;
  warm: string;
  dim: string;
  bulb: string;
};

/** `open` runs from 1, shops lit and full, to 0, shutters down for the night. */
export function drawStreetLayer(
  ctx: CanvasRenderingContext2D,
  layer: StreetLayer,
  camera: number,
  ground: number,
  body: string,
  paint: StreetPaint,
  open = 1,
) {
  ctx.save();
  ctx.translate(-camera * layer.parallax, ground);
  ctx.fillStyle = body;
  ctx.fill(layer.body);
  ctx.fillStyle = paint.warm;
  ctx.fill(layer.warm);
  ctx.fillStyle = paint.dim;
  ctx.fill(layer.dim);
  ctx.fillStyle = open > 0.5 ? paint.warm : paint.shutter;
  ctx.fill(layer.shop);
  if (open > 0.5) {
    ctx.fillStyle = body;
    ctx.fill(layer.goods);
  }
  ctx.fillStyle = body;
  ctx.fill(layer.detail);
  ctx.restore();
}

export function drawBulbs(ctx: CanvasRenderingContext2D, street: Street, camera: number, ground: number, u: number, paint: StreetPaint, time: number, viewW: number, lit = 1) {
  ctx.save();
  ctx.translate(-camera, ground);
  ctx.strokeStyle = paint.near;
  ctx.lineWidth = Math.max(1, u * 0.18);
  ctx.stroke(street.wires);
  if (lit < 0.01) {
    ctx.restore();
    return;
  }
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < street.bulbs.length; i += 1) {
    const [bx, by] = street.bulbs[i];
    if (bx - camera < -u * 10 || bx - camera > viewW + u * 10) continue;
    const flicker = (0.85 + 0.15 * Math.sin(time * 3 + i * 2.1)) * lit;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, u * 2.4);
    g.addColorStop(0, paint.bulb.replace("ALPHA", String(0.95 * flicker)));
    g.addColorStop(0.25, paint.bulb.replace("ALPHA", String(0.35 * flicker)));
    g.addColorStop(1, paint.bulb.replace("ALPHA", "0"));
    ctx.fillStyle = g;
    ctx.fillRect(bx - u * 2.4, by - u * 2.4, u * 4.8, u * 4.8);
  }
  ctx.restore();
}

export function drawWalkers(ctx: CanvasRenderingContext2D, street: Street, camera: number, ground: number, u: number, time: number, color: string, viewW: number) {
  for (const w of street.walkers) {
    const travelled = w.x + w.dir * w.speed * time;
    const span = street.span + viewW;
    const wx = ((((travelled + viewW) % span) + span) % span) - viewW;
    const sx = wx - camera;
    if (sx < -u * 20 || sx > viewW + u * 20) continue;
    const phase = w.phase + (w.speed * time) / (w.build.height * 0.28);
    const joints = drawFigure(ctx, sx, ground, w.dir, walkPose(phase, 0.9), w.build, color);
    if (w.carry === "pot") {
      ctx.beginPath();
      ctx.ellipse(joints.head[0], joints.head[1] - w.build.height * 0.1, w.build.height * 0.06, w.build.height * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (w.carry === "basket") {
      ctx.fillRect(joints.head[0] - w.build.height * 0.09, joints.head[1] - w.build.height * 0.13, w.build.height * 0.18, w.build.height * 0.06);
    }
  }
  for (const cx of street.cows) drawCow(ctx, cx - camera, ground, u, time, color, viewW);
  for (const d of street.dogs) {
    const span = street.span + viewW;
    const dx = ((((d.x + d.dir * d.speed * time + viewW) % span) + span) % span) - viewW - camera;
    if (dx > -u * 20 && dx < viewW + u * 20) drawDog(ctx, dx, ground, u, d.dir, color, "trot", time);
  }
}

function drawCow(ctx: CanvasRenderingContext2D, x: number, ground: number, u: number, time: number, color: string, viewW: number) {
  if (x < -u * 30 || x > viewW + u * 30) return;
  const s = u * 1.1;
  const chew = Math.sin(time * 1.3) * s * 0.3;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(x, ground - s * 7.2, s * 6, s * 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hump, head and horns.
  ctx.beginPath();
  ctx.ellipse(x + s * 3.8, ground - s * 9.4, s * 1.6, s * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 7, ground - s * 6.8 + chew, s * 1.3, s * 2.3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = s * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + s * 6.6, ground - s * 8.6 + chew);
  ctx.quadraticCurveTo(x + s * 6.2, ground - s * 10.4, x + s * 7, ground - s * 10.8 + chew);
  ctx.stroke();
  ctx.lineWidth = s * 0.9;
  for (const lx of [-4.2, -2.8, 2.6, 4]) {
    ctx.beginPath();
    ctx.moveTo(x + lx * s, ground - s * 6);
    ctx.lineTo(x + lx * s, ground - s * 0.3);
    ctx.stroke();
  }
  ctx.lineWidth = s * 0.35;
  ctx.beginPath();
  ctx.moveTo(x - s * 5.8, ground - s * 8);
  ctx.quadraticCurveTo(x - s * 7.2, ground - s * 5 + Math.sin(time * 2) * s * 0.6, x - s * 6.8, ground - s * 3);
  ctx.stroke();
}

