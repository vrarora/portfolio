"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const PHONE_W = 390;
export const PHONE_H = 844;
// Thin modern rail; must match .ea-phone padding in equalall.css.
const BEZEL = 9;

/** Renders children inside a fixed 390x844 logical phone screen, scaled to fit
 * the parent container. Fills its parent; parent controls available space. */
export function PhoneFrame({
  children,
  maxScale = 1,
}: {
  children: ReactNode;
  maxScale?: number;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const fit = Math.min(
        maxScale,
        rect.width / (PHONE_W + BEZEL * 2),
        rect.height / (PHONE_H + BEZEL * 2),
      );
      setScale(fit > 0 ? fit : null);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [maxScale]);

  return (
    <div className="ea-phone-stage" ref={stageRef}>
      <div
        className="ea-phone-fit"
        style={
          scale === null
            ? { visibility: "hidden" }
            : {
                width: (PHONE_W + BEZEL * 2) * scale,
                height: (PHONE_H + BEZEL * 2) * scale,
              }
        }
      >
        <div
          className="ea-phone"
          style={scale === null ? undefined : { transform: `scale(${scale})` }}
        >
          <div className="ea-phone-island" aria-hidden="true" />
          <div className="ea-phone-screen">{children}</div>
        </div>
      </div>
    </div>
  );
}
