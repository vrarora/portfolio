"use client";

import { useReducedMotion } from "motion/react";
import { playgroundNodes } from "@/content/playground";
import { FieldNode } from "./FieldNode";
import { Hud } from "./Hud";
import { PlaygroundChrome } from "./PlaygroundChrome";
import { useFieldEngine } from "./engine/useFieldEngine";
import "./styles/playground.css";

/**
 * Client root of the playground constellation. React renders the field once
 * from the content file; the engine hook owns all per-frame geometry.
 */
export function PlaygroundField() {
  const reducedMotion = useReducedMotion() ?? false;
  const { rootRef, canvasRef, introRef, zoomReadoutRef, registerNode } = useFieldEngine({
    nodes: playgroundNodes,
    reducedMotion,
  });

  return (
    <div className="pg-root" ref={rootRef} data-lenis-prevent>
      <canvas className="pg-canvas" ref={canvasRef} aria-hidden="true" />
      <PlaygroundChrome introRef={introRef} />
      <div className="pg-field">
        {playgroundNodes.map((node) => (
          <FieldNode key={node.id} node={node} registerNode={registerNode} />
        ))}
      </div>
      <Hud zoomReadoutRef={zoomReadoutRef} />
    </div>
  );
}
