import { clamp, easeIO, edgeDist, lerp } from "./math";
import {
  HBOX_DOT_OFFSET,
  HBOX_H,
  HBOX_W,
  type EngineState,
  type NodeRuntime,
  type StageGeometry,
} from "./types";

/** Field layout, ported from the reference. */
export const FIELD_TOP_GAP = 32;
export const DETAIL_CARD_GAP = 72;
export const DETAIL_TOP_GAP = 24;
export const DETAIL_NODE_GAP = 14;
export const DETAIL_SIDE_GAP = 76;
export const FIELD_BOTTOM_PAD = 132;
export const NODE_TOP_INSET = 44;
export const NODE_BOTTOM_INSET = 58;

/** How fast the stage rect chases its target. */
const STAGE_LERP = 0.16;
/** Smoothing for the eased cursor, zoom and node display positions. */
const MOUSE_EASE = 0.08;
const ZOOM_EASE = 0.08;
const NODE_EASE = 0.12;
const MAGNET_EASE = 0.08;

/** The opened stage rect for a node: centred, clamped between intro and card. */
export function videoRect(
  state: EngineState,
  node: NodeRuntime,
  cardTop: number,
  maxWidth: number,
): StageGeometry {
  const { W, H, fieldTop, fieldHeight } = state;
  const ar = node.data.aspectRatio;
  // Short phone viewports (Safari toolbars eat ~180px) leave little room
  // between the intro and the card; tighter gaps keep the stage usable.
  const cardGap = W <= 767 ? 24 : DETAIL_CARD_GAP;
  const topGap = W <= 767 ? 12 : DETAIL_TOP_GAP;
  const availableH = Math.max(120, cardTop - cardGap - (fieldTop + topGap));
  const maxH = Math.min(Math.max(160, fieldHeight - 150), availableH);
  let h = Math.min(maxH, maxWidth / ar);
  let w = h * ar;
  if (w > maxWidth) {
    w = maxWidth;
    h = w / ar;
  }
  const bottom = cardTop - cardGap;
  const minY = fieldTop + topGap + h / 2;
  return { x: W / 2, y: clamp(bottom - h / 2, minY, H - h / 2 - 24), w, h };
}

/** The collapsed stage rect: the node's hover overlay. */
export function boxRect(node: NodeRuntime): StageGeometry {
  return { x: node.ax, y: node.ay - HBOX_H / 2, w: HBOX_W, h: HBOX_H };
}

/** Is the point inside the node's expanded hover overlay (with a forgiving margin)? */
export function inHoverBox(n: NodeRuntime, mx: number, my: number) {
  const sc = n.sc || 1;
  const bw = HBOX_W * sc;
  const bh = HBOX_H * sc;
  const bottomY = n.ay - HBOX_DOT_OFFSET * sc;
  const margin = 18;
  return (
    mx >= n.ax - bw / 2 - margin &&
    mx <= n.ax + bw / 2 + margin &&
    my >= bottomY - bh - margin &&
    my <= n.ay + margin
  );
}

/**
 * One simulation step. Pure math over EngineState: eases the cursor and zoom,
 * derives the stage grow progress, moves every node (drift, drag, ring-out,
 * magnetic pull, clamping) and lerps the stage rect. No DOM access.
 */
export function stepSimulation(state: EngineState, t: number, stageTarget: StageGeometry | null) {
  const { W, mouse, nodes, sg, reducedMotion } = state;
  const cx = W / 2;
  const cy = state.fieldCenterY;

  if (reducedMotion) {
    mouse.ex = mouse.x;
    mouse.ey = mouse.y;
    state.zoom = state.zoomTarget;
  } else {
    mouse.ex = lerp(mouse.ex, mouse.x, MOUSE_EASE);
    mouse.ey = lerp(mouse.ey, mouse.y, MOUSE_EASE);
    state.zoom = lerp(state.zoom, state.zoomTarget, ZOOM_EASE);
  }
  const zoom = state.zoom;

  const parallaxScale = reducedMotion ? 0 : 0.022;
  const pX = (mouse.ex - cx) * parallaxScale;
  const pY = (mouse.ey - cy) * parallaxScale;

  // Stage grow progress (0 = node-sized, 1 = fully open) and crossfade.
  // p is an explicitly eased value, never derived from the rect: on a short
  // phone viewport the fully open stage (the portrait pulse stage, or any
  // stage once Show more shrinks the available room) can be SMALLER than
  // the hover box, so any size-ratio progress runs backwards and pins the
  // stage invisible at 0 while it is open.
  const pTarget = state.central && stageTarget && !state.closing ? 1 : 0;
  state.p = reducedMotion ? pTarget : lerp(state.p, pTarget, STAGE_LERP);
  if (Math.abs(state.p - pTarget) < 0.004) state.p = pTarget;
  const p = state.p;
  state.cf = clamp(p / 0.25, 0, 1);

  const drag = state.drag.node;

  for (const n of nodes) {
    const depth = n.data.z + 1.4;
    const isCentral = n === state.central;
    const homeX = n.data.home[0] * W;
    const homeY = state.fieldTop + n.data.home[1] * state.fieldHeight;
    const fx = reducedMotion ? 0 : Math.sin(t * n.fl.fx * 2 * Math.PI + n.fl.px) * n.fl.ax;
    const fy = reducedMotion ? 0 : Math.cos(t * n.fl.fy * 2 * Math.PI + n.fl.py) * n.fl.ay;

    // Dragged node: keep the grabbed point under the cursor, clamped to the field.
    if (n === drag) {
      const tx = clamp(mouse.x - state.drag.grabDX, 90, W - 90);
      const ty = clamp(
        mouse.y - state.drag.grabDY,
        state.fieldTop + NODE_TOP_INSET,
        state.fieldBottom - NODE_BOTTOM_INSET,
      );
      n.ox = (tx - pX * depth - cx) / zoom + cx - fx - homeX;
      n.oy = (ty - pY * depth - cy) / zoom + cy - fy - homeY;
    }

    // Base position; non-central nodes ring outward around the open stage.
    let baseX = homeX + n.ox;
    let baseY = homeY + n.oy;
    if (!isCentral && p > 0.001 && stageTarget) {
      const idleX = baseX;
      const idleY = baseY;
      let dx = idleX - sg.x;
      let dy = idleY - sg.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const need = edgeDist(dx, dy, sg.w / 2, sg.h / 2) + 78 + (n.data.z + 0.7) * 26;
      baseX = lerp(idleX, sg.x + dx * need, easeIO(p));
      baseY = lerp(idleY, sg.y + dy * need, easeIO(p));
    }

    let x = cx + (baseX + fx - cx) * zoom + pX * depth;
    let y = cy + (baseY + fy - cy) * zoom + pY * depth;

    // Magnetic pull toward the eased cursor (never on the dragged node).
    const magnetTarget = n === state.hovered ? 1 : 0;
    n.m = reducedMotion ? magnetTarget : lerp(n.m, magnetTarget, MAGNET_EASE);
    if (!reducedMotion && n.m > 0.001 && n !== drag) {
      const e = easeIO(n.m);
      x += (mouse.ex - x) * 0.2 * e;
      y += (mouse.ey - y) * 0.2 * e;
    }
    const sc = (0.82 + (n.data.z + 1) * 0.13) * zoom * (1 + (reducedMotion ? 0 : n.m * 0.12));

    // Below the open stage, push stragglers out to its sides.
    if (!isCentral && p > 0.001 && state.stageVisible) {
      const openEase = easeIO(p);
      const stageBottom = sg.y + sg.h / 2;
      const belowLimit = stageBottom - DETAIL_NODE_GAP;
      if (y > belowLimit) {
        const side = x < sg.x ? -1 : 1;
        const sideX = sg.x + side * (sg.w / 2 + DETAIL_SIDE_GAP);
        x = lerp(x, sideX, openEase);
        y = lerp(y, belowLimit, openEase);
      }
    }

    x = clamp(x, 90, W - 90);
    const hoverTopInset = (HBOX_H + HBOX_DOT_OFFSET) * sc;
    const minY = state.fieldTop + Math.max(NODE_TOP_INSET, n.m > 0.001 ? hoverTopInset : 0);
    y = clamp(y, minY, state.fieldBottom - NODE_BOTTOM_INSET);

    // Smooth the displayed position (drag stays 1:1 with the cursor).
    if (n === drag || reducedMotion) {
      n.dx = x;
      n.dy = y;
    } else {
      n.dx = lerp(n.dx, x, NODE_EASE);
      n.dy = lerp(n.dy, y, NODE_EASE);
    }
    n.ax = n.dx;
    n.ay = n.dy;
    n.sx = n.dx;
    n.sy = n.dy;
    n.sc = sc;
  }

  // Stage rect chases its target; the central node's thread endpoint follows it.
  if (state.stageVisible && stageTarget) {
    const k = reducedMotion ? 1 : STAGE_LERP;
    sg.x = lerp(sg.x, stageTarget.x, k);
    sg.y = lerp(sg.y, stageTarget.y, k);
    sg.w = lerp(sg.w, stageTarget.w, k);
    sg.h = lerp(sg.h, stageTarget.h, k);
    if (state.central) {
      state.central.sx = sg.x;
      state.central.sy = sg.y;
    }
  }
}
