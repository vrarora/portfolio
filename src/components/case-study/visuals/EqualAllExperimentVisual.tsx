"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import type { ExperimentId } from "@/components/equalall/demo/scripts";

type DemoComponent = ComponentType<{ experiment: ExperimentId }>;

/** Thin lazy gate for the EqualAll demos: a pure-CSS shell until the reader
 * scrolls within 300px, then one shared chunk loads for all five embeds. */
export function EqualAllExperimentVisual({
  experiment,
}: {
  experiment: ExperimentId;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [Demo, setDemo] = useState<DemoComponent | null>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import("@/components/equalall/demo/DemoDriver").then((mod) => {
          if (!cancelled) setDemo(() => mod.EqualAllDemo);
        });
      },
      { rootMargin: "300px" },
    );
    observer.observe(shell);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  if (Demo) return <Demo experiment={experiment} />;

  return <div ref={shellRef} className="ea-demo-shell" aria-hidden="true" />;
}
