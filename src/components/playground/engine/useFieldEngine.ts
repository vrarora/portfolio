"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PlaygroundNode } from "@/content/playground";
import { createCanvasLayer } from "./canvasLayer";
import { clamp } from "./math";
import {
  FIELD_BOTTOM_PAD,
  FIELD_TOP_GAP,
  boxRect,
  inHoverBox,
  stepSimulation,
} from "./simulation";
import {
  HBOX_H,
  HBOX_W,
  ZOOM_MAX,
  ZOOM_MIN,
  type EngineState,
  type NodeRuntime,
} from "./types";

type UseFieldEngineOptions = {
  nodes: PlaygroundNode[];
  reducedMotion: boolean;
};

/**
 * The rAF field engine. React renders the DOM once from the content file;
 * this hook owns all per-frame geometry and mutates transforms, opacities,
 * the zoom readout and the canvas imperatively through refs.
 *
 * Everything mutable lives in one EngineState constructed inside the main
 * effect (StrictMode-safe: listeners hang off one AbortController, the rAF is
 * cancelled in cleanup, and every Math.random() runs inside the effect so the
 * static export stays hydration-safe).
 */
export function useFieldEngine({ nodes, reducedMotion }: UseFieldEngineOptions) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const zoomReadoutRef = useRef<HTMLSpanElement | null>(null);
  const nodeElsRef = useRef(new Map<string, HTMLElement>());

  const registerNode = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodeElsRef.current.set(id, el);
      else nodeElsRef.current.delete(id);
    },
    [],
  );

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const intro = introRef.current;
    const zoomReadout = zoomReadoutRef.current;
    if (!root || !canvas || !intro || !zoomReadout) return;

    const runtimes: NodeRuntime[] = nodes.map((data) => {
      const el = nodeElsRef.current.get(data.id);
      if (!el) throw new Error(`playground: node element missing for "${data.id}"`);
      const thumbEl = el.querySelector<HTMLVideoElement | HTMLImageElement>(".pg-node-thumb");
      if (!thumbEl) throw new Error(`playground: thumb element missing for "${data.id}"`);
      return {
        data,
        el,
        thumbEl,
        fl: {
          ax: 16 + Math.random() * 24,
          ay: 16 + Math.random() * 24,
          fx: 0.05 + Math.random() * 0.09,
          fy: 0.05 + Math.random() * 0.09,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
        },
        ax: 0,
        ay: 0,
        sx: 0,
        sy: 0,
        dx: 0,
        dy: 0,
        m: 0,
        ox: 0,
        oy: 0,
        sc: 1,
        thumbLoaded: false,
      };
    });

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const state: EngineState = {
      W: window.innerWidth,
      H: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      zoom: 1,
      zoomTarget: 1,
      mouse: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        ex: window.innerWidth / 2,
        ey: window.innerHeight / 2,
      },
      nodes: runtimes,
      edges: [],
      dust: [],
      fieldTop: 230,
      fieldBottom: window.innerHeight - FIELD_BOTTOM_PAD,
      fieldHeight: 0,
      fieldCenterY: 0,
      active: null,
      central: null,
      closing: false,
      stageVisible: false,
      sg: { x: window.innerWidth / 2, y: window.innerHeight / 2, w: HBOX_W, h: HBOX_H },
      p: 0,
      cf: 0,
      hovered: null,
      playingThumb: null,
      drag: {
        candidate: null,
        node: null,
        startX: 0,
        startY: 0,
        grabDX: 0,
        grabDY: 0,
        suppressClick: null,
        pointerId: null,
      },
      pinch: { pointers: new Map(), startDist: 0, startZoom: 0 },
      reducedMotion,
      coarsePointer,
      t0: performance.now(),
    };

    const canvasLayer = createCanvasLayer(canvas, state);

    function layout() {
      state.W = window.innerWidth;
      state.H = window.innerHeight;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const introRect = intro!.getBoundingClientRect();
      state.fieldTop = introRect.bottom + FIELD_TOP_GAP;
      state.fieldBottom = state.H - FIELD_BOTTOM_PAD;
      state.fieldHeight = Math.max(120, state.fieldBottom - state.fieldTop);
      state.fieldCenterY = (state.fieldTop + state.fieldBottom) / 2;
      canvasLayer.resize();
    }

    // ---- living previews -------------------------------------------------
    function loadThumb(n: NodeRuntime) {
      if (n.thumbLoaded) return;
      n.thumbLoaded = true;
      if (n.thumbEl instanceof HTMLVideoElement) {
        // Safari: muted + playsinline must be in place before src is assigned.
        n.thumbEl.muted = true;
        n.thumbEl.setAttribute("muted", "");
        n.thumbEl.src = n.data.src;
      } else {
        n.thumbEl.src = n.data.src;
      }
    }

    function setHovered(next: NodeRuntime | null) {
      if (state.hovered === next) return;
      state.hovered = next;
      if (state.playingThumb) {
        state.playingThumb.pause();
        state.playingThumb = null;
      }
      if (!next) return;
      if (state.reducedMotion) return; // poster only, the video never plays
      loadThumb(next);
      if (next.thumbEl instanceof HTMLVideoElement) {
        const video = next.thumbEl;
        video.play().catch(() => {});
        state.playingThumb = video;
      }
    }

    function resolveHover() {
      if (state.stageVisible || state.coarsePointer) {
        setHovered(null);
        return;
      }
      if (state.hovered && !inHoverBox(state.hovered, state.mouse.x, state.mouse.y)) {
        setHovered(null);
      }
      if (!state.hovered) {
        let nearestDist = Infinity;
        let nearest: NodeRuntime | null = null;
        for (const n of state.nodes) {
          const d = Math.hypot(n.sx - state.mouse.x, n.sy - state.mouse.y);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = n;
          }
        }
        if (nearest && nearestDist < 90) setHovered(nearest);
      }
    }

    // ---- frame -----------------------------------------------------------
    function renderFrame(now: number) {
      const t = state.reducedMotion ? 0 : (now - state.t0) / 1000;
      resolveHover();
      stepSimulation(state, t, state.central ? boxRect(state.central) : null);

      for (const n of state.nodes) {
        n.el.style.transform = `translate3d(${n.dx.toFixed(1)}px, ${n.dy.toFixed(1)}px, 0) scale(${n.sc.toFixed(3)})`;
        n.el.classList.toggle("is-hover", n === state.hovered);
        n.el.style.zIndex = n === state.hovered ? "40" : "20";
      }

      zoomReadout!.textContent = `${Math.round(state.zoom * 100)}%`;
      canvasLayer.draw(now / 1000);
    }

    // ---- scheduling ------------------------------------------------------
    let rafId = 0;
    let running = false;
    let frameQueued = false;
    let hiddenAt = 0;

    function loop(now: number) {
      renderFrame(now);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running || state.reducedMotion) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    }

    /** Reduced motion renders discrete frames instead of a continuous loop. */
    function scheduleFrame() {
      if (!state.reducedMotion || frameQueued) return;
      frameQueued = true;
      requestAnimationFrame((now) => {
        frameQueued = false;
        renderFrame(now);
      });
    }

    // ---- input -----------------------------------------------------------
    const abort = new AbortController();
    const { signal } = abort;
    const dragThreshold = coarsePointer ? 8 : 4;

    root.addEventListener(
      "pointerdown",
      (e) => {
        const nodeEl = (e.target as Element).closest<HTMLElement>("[data-pg-node]");
        if (!nodeEl || state.stageVisible) return;
        const runtime = runtimes.find((n) => n.el === nodeEl);
        if (!runtime) return;
        state.drag.suppressClick = null;
        state.drag.candidate = runtime;
        state.drag.startX = e.clientX;
        state.drag.startY = e.clientY;
        state.drag.pointerId = e.pointerId;
      },
      { signal },
    );

    root.addEventListener(
      "pointermove",
      (e) => {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
        const drag = state.drag;
        if (
          drag.candidate &&
          !drag.node &&
          e.pointerId === drag.pointerId &&
          Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > dragThreshold
        ) {
          drag.node = drag.candidate;
          drag.grabDX = e.clientX - drag.node.ax;
          drag.grabDY = e.clientY - drag.node.ay;
          root.setPointerCapture(e.pointerId);
        }
        scheduleFrame();
      },
      { signal },
    );

    function endDrag() {
      const drag = state.drag;
      if (drag.node) drag.suppressClick = drag.node;
      drag.candidate = null;
      drag.node = null;
      drag.pointerId = null;
      scheduleFrame();
    }
    root.addEventListener("pointerup", endDrag, { signal });
    root.addEventListener("pointercancel", endDrag, { signal });

    root.addEventListener(
      "click",
      (e) => {
        const nodeEl = (e.target as Element).closest<HTMLElement>("[data-pg-node]");
        if (!nodeEl) return;
        const runtime = runtimes.find((n) => n.el === nodeEl);
        if (!runtime) return;
        if (state.drag.suppressClick === runtime) {
          state.drag.suppressClick = null;
          e.stopPropagation();
        }
      },
      { signal, capture: true },
    );

    root.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const multiplier = e.ctrlKey ? 0.004 : 0.0011;
        const minZoom = state.stageVisible ? 1 : ZOOM_MIN;
        state.zoomTarget = clamp(state.zoomTarget - e.deltaY * multiplier, minZoom, ZOOM_MAX);
        scheduleFrame();
      },
      { signal, passive: false },
    );

    window.addEventListener(
      "resize",
      () => {
        layout();
        scheduleFrame();
      },
      { signal },
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          hiddenAt = performance.now();
          stop();
          if (state.playingThumb) state.playingThumb.pause();
        } else {
          state.t0 += performance.now() - hiddenAt;
          if (state.playingThumb) state.playingThumb.play().catch(() => {});
          start();
        }
      },
      { signal },
    );

    layout();
    // Seed every node at its home so the first frame is already composed.
    for (const n of runtimes) {
      n.ax = n.dx = n.sx = n.data.home[0] * state.W;
      n.ay = n.dy = n.sy = state.fieldTop + n.data.home[1] * state.fieldHeight;
    }
    if (state.reducedMotion) scheduleFrame();
    else start();

    return () => {
      abort.abort();
      stop();
      if (state.playingThumb) state.playingThumb.pause();
      canvasLayer.destroy();
    };
  }, [nodes, reducedMotion]);

  return { rootRef, canvasRef, introRef, zoomReadoutRef, registerNode };
}
