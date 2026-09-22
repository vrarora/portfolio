"use client";

import { animate } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { fractionalHour } from "@/lib/hour";
import type { SkyStop } from "@/lib/hour";
import { STOP_HOURS, applySkyVars, mixPalettes, skyAt } from "@/lib/sky";
import type { SkyState } from "@/lib/sky";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

type SkyContextValue = {
  /** The palette currently painted. */
  state: SkyState;
  /** Live local hour, or null before mount. */
  liveHour: number | null;
  /** Stop being previewed by the dial, or null for live. */
  preview: SkyStop | null;
  setPreview: (stop: SkyStop | null) => void;
};

const PREVIEW_KEY = "vp.sky.preview";
const IDLE_MS = 45_000;
const TWEEN_MS = 1200;

const SkyContext = createContext<SkyContextValue>({
  state: skyAt(12),
  liveHour: null,
  preview: null,
  setPreview: () => {},
});

export function useSky() {
  return useContext(SkyContext);
}

/**
 * Owns the sky palette. Live time updates every minute; the dial can hold
 * a preview stop, tweened in over 1.2s, which drops back to live after 45s
 * of idleness. Writes the palette to :root as CSS variables.
 */
export function SkyProvider({ children }: { children: ReactNode }) {
  const [liveHour, setLiveHour] = useState<number | null>(null);
  const [preview, setPreviewState] = useState<SkyStop | null>(null);
  const [state, setState] = useState<SkyState>(() => skyAt(12));
  const painted = useRef<SkyState>(state);
  const tween = useRef<ReturnType<typeof animate> | null>(null);
  const idle = useRef<number | null>(null);

  // Live clock
  useEffect(() => {
    setLiveHour(fractionalHour());
    const id = window.setInterval(() => setLiveHour(fractionalHour()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Restore a preview from this session
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(PREVIEW_KEY) as SkyStop | null;
      if (saved && saved in STOP_HOURS) setPreviewState(saved);
    } catch {
      /* private mode */
    }
  }, []);

  const targetHour = preview ? STOP_HOURS[preview] : liveHour;

  // Tween towards the target palette
  useEffect(() => {
    if (targetHour === null) return;
    const to = skyAt(targetHour);
    const from = painted.current;
    tween.current?.stop();

    const paint = (s: SkyState) => {
      painted.current = s;
      applySkyVars(s);
      setState(s);
    };

    if (prefersReducedMotion() || from.hour === to.hour) {
      paint(to);
      return;
    }

    tween.current = animate(0, 1, {
      duration: TWEEN_MS / 1000,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (t) => {
        const mixed = mixPalettes(from, to, t);
        paint({ ...to, ...mixed, hour: from.hour + (to.hour - from.hour) * t });
      },
      onComplete: () => paint(to),
    });
    return () => tween.current?.stop();
  }, [targetHour]);

  const setPreview = useCallback((stop: SkyStop | null) => {
    setPreviewState(stop);
    try {
      if (stop) window.sessionStorage.setItem(PREVIEW_KEY, stop);
      else window.sessionStorage.removeItem(PREVIEW_KEY);
    } catch {
      /* private mode */
    }
  }, []);

  // Idle return to live
  useEffect(() => {
    if (!preview) return;
    if (idle.current) window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setPreview(null), IDLE_MS);
    return () => {
      if (idle.current) window.clearTimeout(idle.current);
    };
  }, [preview, setPreview]);

  const value = useMemo<SkyContextValue>(
    () => ({ state, liveHour, preview, setPreview }),
    [state, liveHour, preview, setPreview],
  );

  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>;
}
