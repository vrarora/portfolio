import { useEffect } from "react";

const CLASS = "sheet-open";
let locks = 0;

/** Locks page scroll while active. Nested sheets share one lock count. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.documentElement.classList.add(CLASS);
    return () => {
      locks -= 1;
      if (locks === 0) document.documentElement.classList.remove(CLASS);
    };
  }, [active]);
}
