"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * A frame counter for hand-drawn "boiling" lines. It ticks at `fps` only while
 * the element is on screen and holds still for reduced motion.
 */
export function useBoil(ref: RefObject<Element | null>, fps = 8, enabled = true) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const start = () => {
      if (!timer) timer = window.setInterval(() => setTick((t) => t + 1), 1000 / fps);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [ref, fps, enabled]);

  return tick;
}
