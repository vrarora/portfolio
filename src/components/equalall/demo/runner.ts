import type { Dispatch } from "react";
import type { DonationAction, DonationState } from "../flow/types";
import type { FingerHandle } from "./TouchIndicator";

export type DemoStep =
  /** Spring the finger to a target and click the real element. */
  | { kind: "tap"; target: string; hold?: number }
  /** Move the finger without tapping — hesitation, pointing. */
  | { kind: "drift"; target: string }
  /** Mimic a horizontal swipe on a target, then dispatch the outcome. */
  | { kind: "swipe"; target: string; dx: number; action: DonationAction }
  /** Silent state change (things the product does on its own). */
  | { kind: "action"; action: DonationAction }
  /** Update the caption chip under the frame. */
  | { kind: "caption"; text: string }
  | { kind: "pause"; ms: number };

export type DemoScript = {
  /** HYDRATE'd opening state — shows the experiment's point within a second. */
  pose: DonationState;
  caption: string;
  steps: DemoStep[];
  /** Hold on the final state before the loop resets. */
  holdEnd: number;
};

export type DriverCtx = {
  dispatch: Dispatch<DonationAction>;
  finger: FingerHandle;
  setCaption: (text: string) => void;
  getViewport: () => HTMLDivElement | null;
};

export class DemoAborted extends Error {
  constructor() {
    super("demo aborted");
    this.name = "DemoAborted";
  }
}

export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DemoAborted());
      return;
    }
    const id = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DemoAborted());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DemoAborted();
}

/** Resolve a tappable's center in the viewport's logical (unscaled) pixels.
 * Robust to any embed scale — targets are live DOM, not coordinates. */
function targetPoint(viewport: HTMLDivElement, target: string) {
  const el = viewport.querySelector<HTMLElement>(
    `[data-ea-target="${target}"]`,
  );
  if (!el) return null;
  const vRect = viewport.getBoundingClientRect();
  const scale = vRect.width / viewport.offsetWidth;
  const tRect = el.getBoundingClientRect();
  return {
    el,
    x: (tRect.left - vRect.left + tRect.width / 2) / scale,
    y: (tRect.top - vRect.top + tRect.height / 2) / scale,
  };
}

async function waitForTarget(
  ctx: DriverCtx,
  target: string,
  signal: AbortSignal,
) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const viewport = ctx.getViewport();
    if (viewport) {
      const point = targetPoint(viewport, target);
      if (point) return point;
    }
    await sleep(100, signal);
  }
  return null;
}

export async function runScript(
  script: DemoScript,
  ctx: DriverCtx,
  signal: AbortSignal,
): Promise<void> {
  ctx.setCaption(script.caption);
  ctx.finger.show();

  for (const step of script.steps) {
    throwIfAborted(signal);

    switch (step.kind) {
      case "tap": {
        const point = await waitForTarget(ctx, step.target, signal);
        if (!point) break;
        await ctx.finger.moveTo(point.x, point.y);
        throwIfAborted(signal);
        await ctx.finger.press();
        point.el.click();
        await sleep(step.hold ?? 550, signal);
        break;
      }

      case "drift": {
        const point = await waitForTarget(ctx, step.target, signal);
        if (!point) break;
        await ctx.finger.moveTo(point.x, point.y);
        break;
      }

      case "swipe": {
        const point = await waitForTarget(ctx, step.target, signal);
        if (!point) break;
        await ctx.finger.moveTo(point.x, point.y);
        throwIfAborted(signal);
        await ctx.finger.pressHold();
        const drag = ctx.finger.dragBy(step.dx, 420);
        await sleep(140, signal);
        ctx.dispatch(step.action);
        await drag;
        ctx.finger.release();
        await sleep(450, signal);
        break;
      }

      case "action":
        ctx.dispatch(step.action);
        break;

      case "caption":
        ctx.setCaption(step.text);
        break;

      case "pause":
        await sleep(step.ms, signal);
        break;
    }
  }

  ctx.finger.hide();
  await sleep(script.holdEnd, signal);
}
