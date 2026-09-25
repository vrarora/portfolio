"use client";

import { useRef, type ReactNode } from "react";

import { useScrollBlur } from "./useScrollBlur";

/** The home column; blocks marked `data-scroll-blur` come into focus as they rise. */
export function ScrollBlurColumn({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollBlur(ref);

  return (
    <div ref={ref} className="hm-col">
      {children}
    </div>
  );
}
