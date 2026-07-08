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
  videoRect,
} from "./simulation";
import {
  HBOX_H,
  HBOX_W,
  ZOOM_MAX,
  ZOOM_MIN,
  type EngineApi,
  type EngineState,
  type NodeRuntime,
} from "./types";

type UseFieldEngineOptions = {
  nodes: PlaygroundNode[];
  reducedMotion: boolean;
  onActiveChange?: (id: string | null) => void;
};

/**
 * The rAF field engine. React renders the DOM once from the content file;
 * this hook owns all per-frame geometry and mutates transforms, opacities,
 * the zoom readout and the canvas imperatively through refs.
 */
export function useFieldEngine({ nodes, reducedMotion, onActiveChange }: UseFieldEngineOptions) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const zoomReadoutRef = useRef<HTMLSpanElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const playBtnRef = useRef<HTMLButtonElement | null>(null);
  const nodeElsRef = useRef(new Map<string, HTMLElement>());
  const engineApiRef = useRef<EngineApi | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  const registerNode = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodeElsRef.current.set(id, el);
      else nodeElsRef.current.delete(id);
    },
    [],
  );

  const open = useCallback((id: string) => engineApiRef.current?.open(id), []);
  const close = useCallback(() => engineApiRef.current?.close(), []);
  const step = useCallback((dir: 1 | -1) => engineApiRef.current?.step(dir), []);
  const togglePlay = useCallback(() => engineApiRef.current?.togglePlay(), []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const intro = introRef.current;
    const zoomReadout = zoomReadoutRef.current;
    const stage = stageRef.current;
    const card = cardRef.current;
    const playBtn = playBtnRef.current;
    if (!root || !canvas || !intro || !zoomReadout || !stage || !card || !playBtn) return;

    const rootEl = root;
    const canvasEl = canvas;
    const introEl = intro;
    const zoomReadoutEl = zoomReadout;
    const stageEl = stage;
    const cardEl = card;
    const playBtnEl = playBtn;

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
    stageEl.style.display = "none";

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

    const canvasLayer = createCanvasLayer(canvasEl, state);
    const mediaPool = new Map<string, HTMLVideoElement | HTMLImageElement>();
    let visibleMedia: HTMLVideoElement | HTMLImageElement | null = null;

    function stageMaxWidth() {
      return state.W <= 767 ? state.W * 0.92 : Math.min(state.W * 0.64, 1040);
    }

    function positionCard() {
      const hud = rootEl.querySelector<HTMLElement>(".pg-hud");
      if (!hud) return;
      const c = cardEl.getBoundingClientRect();
      const h = hud.getBoundingClientRect();
      const z = zoomReadoutEl.getBoundingClientRect();
      const hudGap = 16;
      const hudCollisionGap = 24;
      const collides = c.left < h.right + hudGap || c.right > z.left - hudGap;
      cardEl.style.bottom = collides
        ? `${Math.ceil(state.H - Math.min(h.top, z.top) + hudCollisionGap)}px`
        : state.W <= 767
          ? "22px"
          : "30px";
    }

    function layout() {
      state.W = window.innerWidth;
      state.H = window.innerHeight;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const introRect = introEl.getBoundingClientRect();
      state.fieldTop = introRect.bottom + FIELD_TOP_GAP;
      state.fieldBottom = state.H - FIELD_BOTTOM_PAD;
      state.fieldHeight = Math.max(120, state.fieldBottom - state.fieldTop);
      state.fieldCenterY = (state.fieldTop + state.fieldBottom) / 2;
      canvasLayer.resize();
      positionCard();
    }

    function getMedia(n: NodeRuntime) {
      let el = mediaPool.get(n.data.src);
      if (!el) {
        if (n.data.type === "image") {
          el = document.createElement("img");
          el.className = "pg-stage-img";
          el.alt = "";
        } else {
          el = document.createElement("video");
          el.className = "pg-stage-vid";
          el.muted = true;
          el.loop = true;
          el.playsInline = true;
          el.preload = "metadata";
        }
        el.style.opacity = "0";
        el.src = n.data.src;
        if (n.data.objectPosition) el.style.objectPosition = n.data.objectPosition;
        stageEl.appendChild(el);
        mediaPool.set(n.data.src, el);
      }
      return el;
    }

    function showMedia(n: NodeRuntime) {
      const target = getMedia(n);
      const reveal = () => {
        target.style.opacity = "1";
        if (visibleMedia && visibleMedia !== target) {
          const prev = visibleMedia;
          prev.style.opacity = "0";
          window.setTimeout(() => {
            if (visibleMedia !== prev && prev instanceof HTMLVideoElement) prev.pause();
          }, 460);
        }
        visibleMedia = target;
      };
      const ready =
        n.data.type === "video"
          ? (target as HTMLVideoElement).readyState >= 2
          : (target as HTMLImageElement).complete &&
            (target as HTMLImageElement).naturalWidth > 0;
      if (ready) reveal();
      else
        target.addEventListener(n.data.type === "video" ? "loadeddata" : "load", reveal, {
          once: true,
        });
    }

    function writeHash(id: string | null) {
      const base = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", id ? `${base}#open-${id}` : base);
    }

    function openNode(n: NodeRuntime) {
      const wasClosed = !state.stageVisible;
      state.active = n;
      state.central = n;
      state.closing = false;
      if (wasClosed) {
        state.zoom = Math.max(state.zoom, 1);
        state.zoomTarget = Math.max(state.zoomTarget, 1);
        Object.assign(state.sg, boxRect(n));
        state.stageVisible = true;
        stageEl.style.display = "block";
      }
      showMedia(n);
      onActiveChangeRef.current?.(n.data.id);
      writeHash(n.data.id);
      scheduleFrame();
    }

    function closeNode() {
      if (!state.active) return;
      state.central = state.active;
      state.active = null;
      state.closing = true;
      writeHash(null);
      if (visibleMedia instanceof HTMLVideoElement) visibleMedia.pause();
      playBtnEl.classList.remove("is-visible");
      scheduleFrame();
    }

    function stepNode(dir: 1 | -1) {
      if (!state.active) return;
      const i = runtimes.indexOf(state.active);
      openNode(runtimes[(i + dir + runtimes.length) % runtimes.length]);
    }

    function togglePlay() {
      if (!visibleMedia || visibleMedia.tagName !== "VIDEO") return;
      const video = visibleMedia as HTMLVideoElement;
      if (video.paused) video.play().catch(() => {});
      else video.pause();
      scheduleFrame();
    }

    engineApiRef.current = {
      open: (id: string) => {
        const n = runtimes.find((r) => r.data.id === id);
        if (n) openNode(n);
      },
      close: closeNode,
      step: stepNode,
      togglePlay,
    };

    function loadThumb(n: NodeRuntime) {
      if (n.thumbLoaded) return;
      n.thumbLoaded = true;
      if (n.thumbEl instanceof HTMLVideoElement) {
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
      if (state.reducedMotion) return;
      loadThumb(next);
      if (next.thumbEl instanceof HTMLVideoElement) {
        next.thumbEl.play().catch(() => {});
        state.playingThumb = next.thumbEl;
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

    function resolveStageTarget() {
      if (!state.central) return null;
      const cardRect = cardEl.getBoundingClientRect();
      const cardTop = cardRect.height > 24 ? cardRect.top : state.H - 130;
      if (state.closing) return boxRect(state.central);
      const targetNode = state.active ?? state.central;
      return videoRect(state, targetNode, cardTop, stageMaxWidth());
    }

    function renderFrame(now: number) {
      const t = state.reducedMotion ? 0 : (now - state.t0) / 1000;
      resolveHover();
      const stageTarget = resolveStageTarget();
      stepSimulation(state, t, stageTarget);

      const cf = state.cf;
      for (const n of state.nodes) {
        const isCentral = n === state.central;
        n.el.style.transform = `translate3d(${n.dx.toFixed(1)}px, ${n.dy.toFixed(1)}px, 0) scale(${n.sc.toFixed(3)})`;
        n.el.style.opacity = isCentral ? (1 - cf).toFixed(3) : "1";
        n.el.style.pointerEvents = isCentral && cf > 0.5 ? "none" : "";
        n.el.classList.toggle("is-hover", n === state.hovered);
        n.el.style.zIndex = n === state.hovered ? "40" : "20";
      }

      zoomReadoutEl.textContent = `${Math.round(state.zoom * 100)}%`;

      if (state.stageVisible && stageTarget) {
        const { sg, p } = state;
        stageEl.style.left = `${(sg.x - sg.w / 2).toFixed(1)}px`;
        stageEl.style.top = `${(sg.y - sg.h / 2).toFixed(1)}px`;
        stageEl.style.width = `${sg.w.toFixed(1)}px`;
        stageEl.style.height = `${sg.h.toFixed(1)}px`;
        stageEl.style.opacity = cf.toFixed(3);
        stageEl.classList.toggle("is-interactive", !!state.active && cf > 0.5);
        cardEl.style.opacity = clamp((p - 0.5) / 0.5, 0, 1).toFixed(3);
        cardEl.style.pointerEvents = state.active && p > 0.55 ? "auto" : "none";

        const showPlay =
          cf > 0.6 &&
          !!visibleMedia &&
          visibleMedia.tagName === "VIDEO" &&
          (visibleMedia as HTMLVideoElement).paused;
        playBtnEl.classList.toggle("is-visible", showPlay);

        const closeComplete =
          state.closing &&
          Math.abs(sg.w - HBOX_W) < 6 &&
          Math.abs(sg.h - HBOX_H) < 6;
        if (closeComplete) {
          state.closing = false;
          state.stageVisible = false;
          state.central = null;
          stageEl.style.display = "none";
          cardEl.style.opacity = "0";
          cardEl.style.pointerEvents = "none";
          onActiveChangeRef.current?.(null);
          mediaPool.forEach((el) => {
            if (el instanceof HTMLVideoElement) el.pause();
          });
        }
      }

      canvasLayer.draw(now / 1000);
    }

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

    function scheduleFrame() {
      if (!state.reducedMotion || frameQueued) return;
      frameQueued = true;
      requestAnimationFrame((now) => {
        frameQueued = false;
        renderFrame(now);
      });
    }

    const abort = new AbortController();
    const { signal } = abort;
    const dragThreshold = coarsePointer ? 8 : 4;

    rootEl.addEventListener(
      "pointerdown",
      (e) => {
        state.pinch.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (state.pinch.pointers.size === 2) {
          const pts = [...state.pinch.pointers.values()];
          state.pinch.startDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          state.pinch.startZoom = state.zoomTarget;
          state.drag.candidate = null;
          state.drag.node = null;
          return;
        }

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

    rootEl.addEventListener(
      "pointermove",
      (e) => {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;

        if (state.pinch.pointers.has(e.pointerId)) {
          state.pinch.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (state.pinch.pointers.size === 2 && state.pinch.startDist > 0) {
            const pts = [...state.pinch.pointers.values()];
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const minZoom = state.stageVisible ? 1 : ZOOM_MIN;
            state.zoomTarget = clamp(
              state.pinch.startZoom * (dist / state.pinch.startDist),
              minZoom,
              ZOOM_MAX,
            );
            scheduleFrame();
            return;
          }
        }

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
          rootEl.setPointerCapture(e.pointerId);
        }
        scheduleFrame();
      },
      { signal },
    );

    function clearPointer(e: PointerEvent) {
      state.pinch.pointers.delete(e.pointerId);
      if (state.pinch.pointers.size < 2) {
        state.pinch.startDist = 0;
      }
      endDrag();
    }
    rootEl.addEventListener("pointerup", clearPointer, { signal });
    rootEl.addEventListener("pointercancel", clearPointer, { signal });

    function endDrag() {
      const drag = state.drag;
      if (drag.node) drag.suppressClick = drag.node;
      drag.candidate = null;
      drag.node = null;
      drag.pointerId = null;
      scheduleFrame();
    }

    rootEl.addEventListener(
      "click",
      (e) => {
        const nodeEl = (e.target as Element).closest<HTMLElement>("[data-pg-node]");
        if (nodeEl) {
          const runtime = runtimes.find((n) => n.el === nodeEl);
          if (!runtime) return;
          if (state.drag.suppressClick === runtime) {
            state.drag.suppressClick = null;
            e.stopPropagation();
            return;
          }
          if (!state.stageVisible) {
            e.stopPropagation();
            openNode(runtime);
          }
          return;
        }

        if ((e.target as Element).closest(".pg-card, .pg-playbtn")) return;

        if (state.active && !(e.target as Element).closest(".pg-stage, .pg-card")) {
          closeNode();
          return;
        }

        if (state.active && (e.target as Element).closest(".pg-stage")) {
          togglePlay();
        }
      },
      { signal, capture: true },
    );

    playBtnEl.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
        togglePlay();
      },
      { signal },
    );

    rootEl.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          closeNode();
          return;
        }
        if (state.active && e.key === "ArrowRight") {
          e.preventDefault();
          stepNode(1);
        } else if (state.active && e.key === "ArrowLeft") {
          e.preventDefault();
          stepNode(-1);
        } else if ((e.key === "Enter" || e.key === " ") && !state.stageVisible) {
          const focused = document.activeElement?.closest<HTMLElement>("[data-pg-node]");
          if (!focused) return;
          const runtime = runtimes.find((n) => n.el === focused);
          if (!runtime) return;
          e.preventDefault();
          openNode(runtime);
        }
      },
      { signal },
    );

    rootEl.addEventListener(
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

    function openFromHash() {
      const match = window.location.hash.match(/^#open-(.+)$/);
      if (!match) return;
      const runtime = runtimes.find((n) => n.data.id === match[1]);
      if (runtime) openNode(runtime);
    }

    window.addEventListener("hashchange", openFromHash, { signal });

    document.addEventListener(
      "contextmenu",
      (e) => {
        if ((e.target as Element).closest("img, video, .pg-stage, .pg-node")) e.preventDefault();
      },
      { signal },
    );

    document.addEventListener(
      "dragstart",
      (e) => {
        if (e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement) {
          e.preventDefault();
        }
      },
      { signal },
    );

    const cardMoreObserver = new ResizeObserver(() => {
      layout();
      scheduleFrame();
    });
    const moreEl = cardEl.querySelector(".pg-card-more");
    if (moreEl) cardMoreObserver.observe(moreEl);

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
    for (const n of runtimes) {
      n.ax = n.dx = n.sx = n.data.home[0] * state.W;
      n.ay = n.dy = n.sy = state.fieldTop + n.data.home[1] * state.fieldHeight;
    }
    positionCard();
    if (state.reducedMotion) scheduleFrame();
    else start();

    const hashTimer = window.setTimeout(openFromHash, 200);

    return () => {
      window.clearTimeout(hashTimer);
      cardMoreObserver.disconnect();
      abort.abort();
      stop();
      if (state.playingThumb) state.playingThumb.pause();
      mediaPool.forEach((el) => el.remove());
      mediaPool.clear();
      canvasLayer.destroy();
      engineApiRef.current = null;
    };
  }, [nodes, reducedMotion]);

  return {
    rootRef,
    canvasRef,
    introRef,
    zoomReadoutRef,
    stageRef,
    cardRef,
    playBtnRef,
    registerNode,
    api: { open, close, step, togglePlay },
  };
}
