"use client";

import Link from "next/link";
import type { RefObject } from "react";

type PlaygroundChromeProps = {
  introRef: RefObject<HTMLDivElement | null>;
};

/**
 * Fixed top chrome: the "V." mark home link and wordmark on the left, the
 * centred intro (title + subtext) whose bottom edge defines the field top,
 * and the bracketed "Back to work" link on the right.
 */
export function PlaygroundChrome({ introRef }: PlaygroundChromeProps) {
  return (
    <header className="pg-chrome">
      <Link className="pg-brand" href="/" aria-label="Back to the homepage">
        <span className="pg-mark" aria-hidden="true">
          V<span className="pg-mark-dot">.</span>
        </span>
        <span className="pg-wordmark">Vaibhav Arora</span>
      </Link>
      <div className="pg-intro" ref={introRef}>
        <h1 className="pg-title">
          Playground<span className="pg-title-dot">.</span>
        </h1>
        <p className="pg-subtext">
          A growing collection of my side projects, interaction studies and concept
          explorations, laid out as a connected field to open, drag and revisit.
        </p>
      </div>
      <Link className="pg-back" href="/#work">
        <span className="pg-bracket pg-bracket-left" aria-hidden="true">
          [
        </span>
        <span className="pg-back-text">Back to work</span>
        <span className="pg-bracket pg-bracket-right" aria-hidden="true">
          ]
        </span>
      </Link>
    </header>
  );
}
