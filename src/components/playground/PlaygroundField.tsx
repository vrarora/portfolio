"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { playgroundNodes } from "@/content/playground";
import { FieldNode } from "./FieldNode";
import { Hud } from "./Hud";
import { InfoCard } from "./InfoCard";
import { PlaygroundChrome } from "./PlaygroundChrome";
import { Stage } from "./Stage";
import { useFieldEngine } from "./engine/useFieldEngine";
import "./styles/playground.css";

/**
 * Client root of the playground constellation. React renders the field once
 * from the content file; the engine hook owns all per-frame geometry.
 */
export function PlaygroundField() {
  const reducedMotion = useReducedMotion() ?? false;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastNodeIdRef = useRef<string | null>(null);
  const prevActiveRef = useRef<string | null>(null);

  const handleActiveChange = useCallback((id: string | null) => {
    if (id && !prevActiveRef.current) setShowMore(false);
    prevActiveRef.current = id;
    setActiveId(id);
    if (id) lastNodeIdRef.current = id;
  }, []);

  const {
    rootRef,
    canvasRef,
    introRef,
    zoomReadoutRef,
    stageRef,
    cardRef,
    playBtnRef,
    registerNode,
    api,
  } = useFieldEngine({
    nodes: playgroundNodes,
    reducedMotion,
    onActiveChange: handleActiveChange,
  });

  const activeNode = useMemo(
    () => playgroundNodes.find((n) => n.id === activeId) ?? null,
    [activeId],
  );
  const activeIndex = activeNode ? playgroundNodes.indexOf(activeNode) : 0;

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (activeId) {
      closeBtnRef.current?.focus();
      return;
    }
    const id = lastNodeIdRef.current;
    if (!id) return;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-pg-node="${id}"]`);
    el?.focus();
  }, [activeId, rootRef]);

  return (
    <div className="pg-root" ref={rootRef} data-lenis-prevent>
      <canvas className="pg-canvas" ref={canvasRef} aria-hidden="true" />
      <PlaygroundChrome introRef={introRef} />
      <div className="pg-field">
        {playgroundNodes.map((node) => (
          <FieldNode key={node.id} node={node} registerNode={registerNode} />
        ))}
      </div>
      <Stage stageRef={stageRef} playBtnRef={playBtnRef} />
      <InfoCard
        cardRef={cardRef}
        closeBtnRef={closeBtnRef}
        node={activeNode}
        index={activeIndex}
        total={playgroundNodes.length}
        showMore={showMore}
        onToggleMore={() => setShowMore((v) => !v)}
        onClose={api.close}
        onPrev={() => api.step(-1)}
        onNext={() => api.step(1)}
      />
      <Hud zoomReadoutRef={zoomReadoutRef} coarseHints={coarsePointer} />
    </div>
  );
}
