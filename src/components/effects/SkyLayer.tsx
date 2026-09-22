"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { useSky } from "./SkyProvider";

const SkyGL = dynamic(() => import("./SkyGL"), { ssr: false });

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Fixed sky behind the page shell. The CSS gradient paints immediately; the
 * shader loads once the footer is within a viewport of the fold and renders
 * only while the footer is on screen.
 */
export function SkyLayer() {
  const { state } = useSky();
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    setCapable(webglAvailable() && !nav.connection?.saveData);
  }, []);

  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    const nearIO = new IntersectionObserver(([e]) => setNear((n) => n || e.isIntersecting), { rootMargin: "100%" });
    const visIO = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "0px" });
    nearIO.observe(footer);
    visIO.observe(footer);
    return () => {
      nearIO.disconnect();
      visIO.disconnect();
    };
  }, []);

  const useGL = capable && !reduced && near;

  return (
    <div className="fx-sky" aria-hidden="true">
      <div className="fx-sky-grain" style={{ backgroundImage: GRAIN }} />
      {useGL ? (
        <div className="fx-sky-gl-wrap" data-ready={ready ? "" : undefined}>
          <SkyGL state={state} active={visible} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
