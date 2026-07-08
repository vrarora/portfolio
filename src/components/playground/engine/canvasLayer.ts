import type { DustParticle, EngineState, ThreadEdge } from "./types";

/**
 * Ambient canvas: depth dust plus particle threads connecting every node pair.
 * Ink is pure black at slightly lower alphas than the reference (a pure white
 * background reads harder than warm paper).
 */
export function createCanvasLayer(canvas: HTMLCanvasElement, state: EngineState) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("playground canvas: 2d context unavailable");
  const ctx: CanvasRenderingContext2D = context;

  function seedDust() {
    const dust: DustParticle[] = [];
    const count = Math.round((state.W * state.H) / 26000);
    for (let i = 0; i < count; i++) {
      dust.push({
        x: Math.random() * state.W,
        y: Math.random() * state.H,
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
      });
    }
    state.dust = dust;
  }

  function seedEdges() {
    const edges: ThreadEdge[] = [];
    const nodes = state.nodes;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const parts = [];
        const count = 16 + ((Math.random() * 8) | 0);
        for (let k = 0; k < count; k++) {
          const stray = Math.random() < 0.22;
          parts.push({
            off: Math.random(),
            spd: (0.025 + Math.random() * 0.055) * (Math.random() < 0.5 ? 1 : -1),
            amp: stray ? 5 + Math.random() * 13 : Math.random() * 2.4,
            ph: Math.random() * Math.PI * 2,
            freq: 0.6 + Math.random() * 1.8,
            size: stray ? 0.5 + Math.random() * 0.9 : 0.7 + Math.random() * 1.2,
            a0: stray ? 0.075 : 0.22,
          });
        }
        edges.push({ a: nodes[i], b: nodes[j], parts });
      }
    }
    state.edges = edges;
  }

  function resize() {
    canvas.width = state.W * state.dpr;
    canvas.height = state.H * state.dpr;
    canvas.style.width = `${state.W}px`;
    canvas.style.height = `${state.H}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    seedDust();
  }

  function drawDust(time: number) {
    const cx = state.W / 2;
    const cy = state.fieldCenterY;
    const still = state.reducedMotion;
    for (const pt of state.dust) {
      if (!still) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.x < -20) pt.x = state.W + 20;
        if (pt.x > state.W + 20) pt.x = -20;
        if (pt.y < -20) pt.y = state.H + 20;
        if (pt.y > state.H + 20) pt.y = -20;
      }
      const px = pt.x + (state.mouse.ex - cx) * pt.z * 0.05;
      const py = pt.y + (state.mouse.ey - cy) * pt.z * 0.05;
      ctx.fillStyle = `rgba(0,0,0,${(0.034 + pt.z * 0.085).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, 0.5 + pt.z * 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    void time;
  }

  function drawThreads(time: number) {
    for (const e of state.edges) {
      const ax = e.a.sx;
      const ay = e.a.sy;
      const bx = e.b.sx;
      const by = e.b.sy;
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const touchesCentral = e.a === state.central || e.b === state.central;
      const depth = ((e.a.data.z + e.b.data.z) / 2 + 0.62) / 1.27;
      const mul = state.stageVisible ? (touchesCentral ? 1 : 0.4) : 1;

      ctx.strokeStyle = `rgba(0,0,0,${(0.038 * mul).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      if (state.reducedMotion) continue;

      for (const p of e.parts) {
        const u = (((time * p.spd + p.off) % 1) + 1) % 1;
        const perp = Math.sin(u * p.freq * Math.PI * 2 + time * 0.7 + p.ph) * p.amp;
        const x = ax + dx * u + nx * perp;
        const y = ay + dy * u + ny * perp;
        const fade = Math.min(1, Math.sin(u * Math.PI) * 1.6);
        const alpha = (p.a0 + depth * 0.068) * fade * mul;
        ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function draw(time: number) {
    ctx.clearRect(0, 0, state.W, state.H);
    drawDust(time);
    drawThreads(time);
  }

  seedEdges();

  return {
    resize,
    draw,
    destroy() {
      ctx.clearRect(0, 0, state.W, state.H);
    },
  };
}

export type CanvasLayer = ReturnType<typeof createCanvasLayer>;
