"use client";

import { useEffect, type RefObject } from "react";

/** Words start filling when they rise past this fraction of the viewport. */
const READ_LINE = 0.8;
/** Distance, as a fraction of the viewport, over which a line fills. */
const READ_BAND = 0.2;
/** How much further right a word must travel before it fills, so a line sweeps left to right. */
const SWEEP = 0.7;
/** Past this progress an inline piece (scribble, tag, logos, underline) switches on. */
const ON_AT = 0.6;

/**
 * Scroll-linked reading. Every `[data-word]` inside the container gets `--read`
 * (0 to 1) as it rises through the viewport, filling left to right along each line,
 * and `data-on` once it is mostly read. With reduced motion everything is read at once.
 */
export function useReading(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    const last = new Float32Array(words.length).fill(-1);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      words.forEach((word) => {
        word.style.setProperty("--read", "1");
        word.dataset.on = "";
      });
      return;
    }

    root.classList.add("is-live");
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const box = root.getBoundingClientRect();
      if (box.bottom < -vh || box.top > vh * 2) return;

      words.forEach((word, i) => {
        const rect = word.getBoundingClientRect();
        const rise = (vh * READ_LINE - rect.top) / (vh * READ_BAND);
        const across = (rect.left - box.left) / Math.max(box.width, 1);
        const read = Math.min(1, Math.max(0, rise * (1 + SWEEP) - across * SWEEP));
        if (Math.abs(read - last[i]) < 0.005) return;
        last[i] = read;
        word.style.setProperty("--read", read.toFixed(3));
        if (read >= ON_AT) word.dataset.on = "";
        else delete word.dataset.on;
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.classList.remove("is-live");
    };
  }, [ref]);
}
