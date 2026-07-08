"use client";

import { IconContext } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const lenisRef = useRef<import("lenis").default | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let rafId: number;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      if (window.location.pathname.startsWith("/playground")) {
        lenis.stop();
      }

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (pathname.startsWith("/playground")) lenis.stop();
      else lenis.start();
    }
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <IconContext.Provider
      value={{
        weight: "bold",
      }}
    >
      {children}
    </IconContext.Provider>
  );
}
