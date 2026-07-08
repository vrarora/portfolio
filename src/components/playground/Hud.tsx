"use client";

import type { RefObject } from "react";

type HudProps = {
  zoomReadoutRef: RefObject<HTMLSpanElement | null>;
  coarseHints?: boolean;
};

/**
 * Bottom HUD: interaction hints on the left, the live zoom readout on the
 * right (mutated imperatively by the engine, never via React state).
 */
export function Hud({ zoomReadoutRef, coarseHints = false }: HudProps) {
  return (
    <>
      <div className="pg-hud" aria-hidden="true">
        {coarseHints ? (
          <>
            <span>
              <b>Pinch</b> zoom
            </span>
            <span>
              <b>Drag</b> node
            </span>
            <span>
              <b>Tap</b> to open
            </span>
          </>
        ) : (
          <>
            <span>
              <b>Scroll</b> zoom
            </span>
            <span>
              <b>Drag</b> node
            </span>
            <span>
              <b>Click</b> to open
            </span>
          </>
        )}
      </div>
      <span className="pg-zoom" ref={zoomReadoutRef} aria-hidden="true">
        100%
      </span>
    </>
  );
}
