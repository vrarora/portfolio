import { useEffect, useRef } from "react";

/**
 * Remembers the element focused when `active` became true and restores
 * focus to it (or the fallback) once `active` turns false.
 */
export function useReturnFocus(active: boolean, fallback?: () => HTMLElement | null) {
  const previous = useRef<HTMLElement | null>(null);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    if (active) {
      previous.current = (document.activeElement as HTMLElement | null) ?? null;
      return;
    }
    const target = previous.current?.isConnected ? previous.current : fallbackRef.current?.() ?? null;
    previous.current = null;
    if (target) {
      // Wait for the exit animation frame so focus lands on a visible element.
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  }, [active]);
}
