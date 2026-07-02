"use client";

import "./styles/equalall.css";

import { StatusBar } from "./chrome/StatusBar";
import { useDonationFlow } from "./flow/DonationFlowProvider";
import { campaign } from "./data/campaign";

/** The whole product: story screen in a scroll container, plus the sheet
 * layer and keepsake takeover. Everything positions absolutely within the
 * phone viewport (never `fixed` — the tree may render inside a scaled frame). */
export function DonationExperience() {
  const { viewportRef } = useDonationFlow();

  return (
    <div className="ea-viewport" ref={viewportRef}>
      <div className="ea-scroll" data-lenis-prevent>
        <StatusBar />
        <header className="ea-top-bar">
          <span className="ea-wordmark">{campaign.brand}</span>
        </header>
        <div className="ea-story-placeholder">
          <div className="ea-story-placeholder-hero" />
          <div className="ea-story-placeholder-line" />
          <div className="ea-story-placeholder-line ea-short" />
        </div>
      </div>
    </div>
  );
}
