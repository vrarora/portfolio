"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

/** Adds `is-visible` to every [data-cs-reveal] inside `container` as it scrolls into `root`. */
export function useReveal(container: RefObject<HTMLElement | null>, root: RefObject<HTMLElement | null> | null) {
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-cs-reveal]"));
    if (prefersReducedMotion()) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { root: root?.current ?? null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [container, root]);
}
