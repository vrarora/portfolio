"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { createNoise2D } from "./noise2d";

type Sprite = { canvas: HTMLCanvasElement | OffscreenCanvas; w: number; h: number };

type Leaf = {
  x: number;
  y: number;
  scale: number;
  rot: number;
  species: number;
  far: boolean;
  seed: number;
};

const MAX_W = 1280;
const MAX_H = 800;
const FPS = 30;
const LEAF_FILL = "#26301f";

function leafPath(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, species: number, size: number) {
  const L = size;
  const W = size * (species === 0 ? 0.42 : species === 1 ? 0.32 : 0.55);
  ctx.beginPath();
  ctx.moveTo(0, -L / 2);
  if (species === 2) {
    // Rounder, three-lobed
    ctx.bezierCurveTo(W * 0.9, -L * 0.45, W * 1.1, L * 0.05, 0, L / 2);
    ctx.bezierCurveTo(-W * 1.1, L * 0.05, -W * 0.9, -L * 0.45, 0, -L / 2);
  } else {
    ctx.bezierCurveTo(W, -L * 0.3, W, L * 0.25, 0, L / 2);
    ctx.bezierCurveTo(-W, L * 0.25, -W, -L * 0.3, 0, -L / 2);
  }
  ctx.closePath();
  // Stem and midrib
  ctx.moveTo(0, L / 2);
  ctx.lineTo(0, L / 2 + L * 0.22);
  ctx.moveTo(0, -L * 0.42);
  ctx.lineTo(0, L * 0.42);
}

function makeSprite(species: number, far: boolean): Sprite {
  const size = far ? 72 : 108;
  const blur = far ? 11 : 5;
  const pad = blur * 3;
  const w = Math.ceil(size * 1.2 + pad * 2);
  const h = Math.ceil(size * 1.4 + pad * 2);
  const canvas =
    typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctx.translate(w / 2, h / 2);
  ctx.fillStyle = LEAF_FILL;
  ctx.strokeStyle = LEAF_FILL;
  ctx.lineWidth = size * 0.03;
  const c = ctx as CanvasRenderingContext2D;
  if (typeof c.filter === "string") {
    c.filter = `blur(${blur}px)`;
  } else {
    c.shadowColor = LEAF_FILL;
    c.shadowBlur = blur * 2;
  }
  leafPath(ctx, species, size);
  ctx.fill();
  ctx.stroke();
  return { canvas, w, h };
}

function seedLeaves(count: number, far: boolean, rand: () => number): Leaf[] {
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    scale: (far ? 0.75 : 0.9) + rand() * 0.5,
    rot: rand() * Math.PI * 2,
    species: Math.floor(rand() * 3),
    far,
    seed: rand() * 1000,
  }));
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Soft leaf shadows drifting over the hero. Canvas 2D, no assets. Draws one
 * static frame under reduced motion or Save-Data, otherwise 30fps while the
 * canvas is on screen and the tab is visible.
 */
export function LeafShadow({ amplitude = 1 }: { amplitude?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const staticFrame = reduced || Boolean(nav.connection?.saveData);
    const small = window.matchMedia("(max-width: 767px)").matches;

    const rand = mulberry(20260923);
    const noise = createNoise2D(7);
    const sprites = new Map<string, Sprite>();
    const sprite = (species: number, far: boolean) => {
      const key = `${species}-${far}`;
      let s = sprites.get(key);
      if (!s) {
        s = makeSprite(species, far);
        sprites.set(key, s);
      }
      return s;
    };
    const leaves = [...seedLeaves(small ? 4 : 8, true, rand), ...seedLeaves(small ? 7 : 14, false, rand)];

    let W = 0;
    let H = 0;
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      const ratio = Math.min(1, MAX_W / Math.max(1, cssW), MAX_H / Math.max(1, cssH));
      W = Math.max(1, Math.round(cssW * ratio));
      H = Math.max(1, Math.round(cssH * ratio));
      canvas.width = W;
      canvas.height = H;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const drift = ((t * 0.004) % (W + 300)) - 150;
      const sway = Math.sin(t * 0.001 * 0.03 * Math.PI * 2) * 0.0087;
      for (const leaf of leaves) {
        const s = sprite(leaf.species, leaf.far);
        const nx = noise(leaf.x * W * 0.0015 + leaf.seed, t * 0.00012);
        const ny = noise(leaf.y * H * 0.0015 + leaf.seed + 50, t * 0.00012 + 10);
        const nr = noise(leaf.seed, t * 0.0001);
        const amp = amplitude * (leaf.far ? 0.6 : 1);
        let x = leaf.x * (W + 300) - 150 + drift * (leaf.far ? 0.5 : 1) + nx * 14 * amp;
        x = ((x + 150) % (W + 300)) - 150;
        const y = leaf.y * H + ny * 8 * amp;
        const rot = leaf.rot + nr * 0.06 * amp + sway;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.scale(leaf.scale, leaf.scale);
        ctx.globalAlpha = leaf.far ? 0.55 : 0.9;
        ctx.drawImage(s.canvas as CanvasImageSource, -s.w / 2, -s.h / 2);
        ctx.restore();
      }
    };

    let raf = 0;
    let last = 0;
    let visible = true;
    let intersecting = true;
    const interval = 1000 / FPS;

    const loop = (now: number) => {
      raf = 0;
      if (!visible || !intersecting) return;
      if (now - last >= interval) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (staticFrame) return;
      if (!raf && visible && intersecting) raf = requestAnimationFrame(loop);
    };

    resize();
    draw(performance.now());
    if (!staticFrame) wake();

    const io = new IntersectionObserver(
      (entries) => {
        intersecting = entries.some((e) => e.isIntersecting);
        wake();
      },
      { rootMargin: "10%" },
    );
    io.observe(canvas);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      wake();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        draw(performance.now());
      }, 120);
    });
    ro.observe(canvas);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(resizeTimer);
    };
  }, [reduced, amplitude]);

  return <canvas ref={canvasRef} className="fx-leaf" aria-hidden="true" />;
}
