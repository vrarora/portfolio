"use client";

import { useEffect, type RefObject } from "react";

/** A block is fully sharp once its centre rises above this fraction of the viewport. */
const SHARP_AT = 0.73;
/** A block is fully blurred while its centre sits below this fraction of the viewport. */
const BLUR_AT = 1.15;
/** Blur, in px, at the bottom of the band. */
const MAX_BLUR = 8;
/** Rightward shift, in px, at the bottom of the band. */
const MAX_SHIFT = 64;

/**
 * Scroll-linked focus, after paulfaivret.com/about. Every `[data-scroll-blur]` inside
 * the container blurs, fades and drifts right as it nears the bottom of the viewport,
 * and settles as it rises. Sharp blocks carry no inline styles, so they keep no
 * stacking context. With reduced motion nothing is applied.
 */
export function useScrollBlur(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let blocks: HTMLElement[] = [];
    let last = new Float32Array(0);
    let frame = 0;

    const clear = (block: HTMLElement) => {
      block.style.removeProperty("filter");
      block.style.removeProperty("opacity");
      block.style.removeProperty("translate");
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;

      blocks.forEach((block, i) => {
        const rect = block.getBoundingClientRect();
        const centre = (rect.top + rect.height / 2) / vh;
        const t = Math.min(1, Math.max(0, (centre - SHARP_AT) / (BLUR_AT - SHARP_AT)));
        const blur = t * t * (3 - 2 * t);
        if (Math.abs(blur - last[i]) < 0.002) return;
        last[i] = blur;

        if (blur === 0) {
          clear(block);
          return;
        }
        block.style.filter = `blur(${(blur * MAX_BLUR).toFixed(2)}px)`;
        block.style.opacity = (1 - blur).toFixed(3);
        block.style.translate = `${(blur * MAX_SHIFT).toFixed(1)}px 0`;
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Blocks can mount later (the "see more" text), so the list is rebuilt on DOM changes.
    const collect = () => {
      blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-blur]"));
      last = new Float32Array(blocks.length).fill(-1);
      schedule();
    };

    const start = () => {
      collect();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      resize.observe(root);
      mutation.observe(root, { childList: true, subtree: true });
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      mutation.disconnect();
      blocks.forEach(clear);
    };

    const resize = new ResizeObserver(schedule);
    const mutation = new MutationObserver(collect);

    const sync = () => {
      stop();
      if (!motion.matches) start();
    };

    sync();
    motion.addEventListener("change", sync);

    return () => {
      motion.removeEventListener("change", sync);
      stop();
    };
  }, [ref]);
}
