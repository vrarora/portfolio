"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Reveal helper for the static case-study diagram visuals.
 *
 * Returns a ref to attach to the visual root plus a `phase`:
 * - `"hidden"` — will animate, but not in view yet (pre-entrance state).
 * - `"play"`   — in view; run the entrance choreography now.
 * - `"final"`  — reader requested reduced motion; show the finished diagram
 *                immediately with no motion.
 *
 * Components render their final composed state by default and only fall back to
 * the hidden pre-state / entrance keyframes when the phase calls for it.
 */
export type RevealPhase = "hidden" | "play" | "final";

export function useInViewReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const phase: RevealPhase = reducedMotion ? "final" : inView ? "play" : "hidden";
  return { ref, phase };
}
