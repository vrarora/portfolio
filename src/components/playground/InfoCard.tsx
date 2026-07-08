"use client";

import type { PlaygroundNode } from "@/content/playground";
import { pad2 } from "./engine/math";
import type { RefObject } from "react";

type InfoCardProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  node: PlaygroundNode | null;
  index: number;
  total: number;
  showMore: boolean;
  onToggleMore: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * Bottom info card for the open stage: title, category, Show more, counter,
 * prev/next, close and the Open live link. Opacity and pointer-events are
 * driven by the engine; React owns the discrete content and Show-more state.
 */
export function InfoCard({
  cardRef,
  closeBtnRef,
  node,
  index,
  total,
  showMore,
  onToggleMore,
  onClose,
  onPrev,
  onNext,
}: InfoCardProps) {
  return (
    <div
      className="pg-card"
      ref={cardRef}
      role={node ? "dialog" : undefined}
      aria-modal={node ? true : undefined}
      aria-label={node?.title}
      aria-hidden={!node}
    >
      {node ? (
        <div className="pg-card-inner" key={node.id}>
        <div className="pg-card-head">
          <div className="pg-card-titles">
            <h3 className="pg-card-title">{node.title}</h3>
            <p className="pg-card-meta">
              <span className="pg-card-cat">{node.category}</span>
              <span className="pg-card-yr">{node.year}</span>
            </p>
          </div>
          <button
            type="button"
            className="pg-card-close"
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={`pg-card-more${showMore ? " is-open" : ""}`}>
          <p className="pg-card-desc">{node.description}</p>
        </div>
        <div className="pg-card-foot">
          <button type="button" className="pg-card-showmore" onClick={onToggleMore}>
            {showMore ? "Show less" : "Show more"}
          </button>
          <div className="pg-card-nav">
            <span className="pg-card-counter" aria-live="polite">
              <span className="pg-card-cur">{pad2(index + 1)}</span>
              <span className="pg-card-sep">/</span>
              <span className="pg-card-tot">{pad2(total)}</span>
            </span>
            <button type="button" className="pg-card-pill" onClick={onPrev} aria-label="Previous">
              ←
            </button>
            <button type="button" className="pg-card-pill" onClick={onNext} aria-label="Next">
              →
            </button>
            <a
              className="pg-card-live"
              href={node.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open live ↗
            </a>
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
