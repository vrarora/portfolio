"use client";

import type { RefObject } from "react";

type StageProps = {
  stageRef: RefObject<HTMLDivElement | null>;
  playBtnRef: RefObject<HTMLButtonElement | null>;
};

/**
 * Fixed media stage. The engine positions this rect each frame and pools
 * video/image layers inside it imperatively. React only mounts the shell.
 */
export function Stage({ stageRef, playBtnRef }: StageProps) {
  return (
    <div className="pg-stage" ref={stageRef} aria-hidden="true">
      <button
        type="button"
        className="pg-playbtn"
        ref={playBtnRef}
        aria-label="Play video"
        tabIndex={-1}
      />
    </div>
  );
}
