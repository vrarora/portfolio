"use client";

import type { PlaygroundNode } from "@/content/playground";

type FieldNodeProps = {
  node: PlaygroundNode;
  registerNode: (id: string) => (el: HTMLElement | null) => void;
};

/**
 * One constellation node: dot, label with index code, and the hover box that
 * grows into a living muted preview. Rendered once; the engine positions it.
 */
export function FieldNode({ node, registerNode }: FieldNodeProps) {
  return (
    <div
      className="pg-node"
      data-pg-node={node.id}
      ref={registerNode(node.id)}
      tabIndex={0}
      role="button"
      aria-label={`Open ${node.title}`}
    >
      <div className="pg-node-box">
        {node.type === "video" ? (
          <video
            className="pg-node-thumb"
            muted
            playsInline
            loop
            preload="none"
            poster={node.poster}
            style={node.objectPosition ? { objectPosition: node.objectPosition } : undefined}
          />
        ) : (
          <img
            className="pg-node-thumb"
            alt=""
            src={node.poster}
            loading="lazy"
            style={node.objectPosition ? { objectPosition: node.objectPosition } : undefined}
          />
        )}
        <div className="pg-node-cap">
          <span className="pg-node-cap-title">{node.title}</span>
          <span className="pg-node-cap-meta">
            {node.category} {node.year}
          </span>
        </div>
      </div>
      <div className="pg-node-label">
        {node.title}
        <span className="pg-node-index">[ {node.index} ]</span>
      </div>
      <div className="pg-node-dot" />
    </div>
  );
}
