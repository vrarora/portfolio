"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { playgroundNodes } from "@/content/playground";
import { routes } from "@/lib/routes";

export function ExperimentsList() {
  const [hovered, setHovered] = useState<string | null>(null);
  const preview = playgroundNodes.find((n) => n.id === hovered) ?? null;

  return (
    <div className="work-experiments">
      <ol className="work-rows" onMouseLeave={() => setHovered(null)}>
        {playgroundNodes.map((node) => (
          <li
            key={node.id}
            className="work-row"
            onMouseEnter={() => setHovered(node.id)}
            onFocus={() => setHovered(node.id)}
          >
            <span className="work-row-index t-micro">[ {node.index} ]</span>
            <span className="work-row-text">
              <span className="work-row-title">{node.title}</span>
              <span className="work-row-blurb t-caption">{node.blurb}</span>
            </span>
            <span className="work-row-year t-caption t-num">{node.year}</span>
            <a className="work-row-open link-quiet" href={node.liveUrl} target="_blank" rel="noreferrer">
              Open lab <ArrowUpRight size={12} weight="bold" />
            </a>
          </li>
        ))}
      </ol>
      <div className="work-preview" aria-hidden="true" data-visible={preview ? "" : undefined}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={preview.id}
            src={preview.poster}
            alt=""
            style={{ objectPosition: preview.objectPosition ?? "center" }}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      <p className="work-constellation t-caption">
        <Link href={routes.playground}>See the constellation</Link>
      </p>
    </div>
  );
}
