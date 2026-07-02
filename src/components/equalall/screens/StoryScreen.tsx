"use client";

import { useEffect, useState } from "react";
import {
  Export,
  Heart,
  LockSimple,
  SealCheck,
} from "@phosphor-icons/react";
import { campaign, formatAmount } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { HeroCarousel } from "./HeroCarousel";

function ProgressModule() {
  const { reducedMotion } = useDonationFlow();
  const pct = Math.round((campaign.raised / campaign.goal) * 100);
  const [filled, setFilled] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setFilled(true), 350);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  return (
    <section className="ea-progress">
      <div className="ea-progress-amounts">
        <span className="ea-progress-raised ea-num">
          {formatAmount(campaign.raised)}
        </span>
        <span className="ea-progress-goal ea-num">
          raised of {formatAmount(campaign.goal)} goal
        </span>
      </div>
      <div className="ea-progress-bar">
        <div
          className="ea-progress-fill"
          style={{ width: filled ? `${pct}%` : "0%" }}
        />
      </div>
      <span className="ea-progress-donors ea-num">
        {campaign.donorCount.toLocaleString("en-US")} people have given
      </span>
    </section>
  );
}

function OrganizerRow() {
  return (
    <section className="ea-organizer">
      <span className="ea-organizer-mark" aria-hidden="true">
        {campaign.organizer.name[0]}
      </span>
      <span className="ea-organizer-info">
        <span className="ea-organizer-name">
          {campaign.organizer.name}
          {campaign.organizer.verified && (
            <SealCheck size={15} weight="fill" className="ea-organizer-seal" />
          )}
        </span>
        <span className="ea-organizer-note">{campaign.organizer.note}</span>
      </span>
      <span className="ea-secure-chip">
        <LockSimple size={11} weight="fill" />
        Secure
      </span>
    </section>
  );
}

function DonorFeed() {
  return (
    <section className="ea-feed">
      <span className="ea-caps">Donations so far</span>
      <ul className="ea-feed-list">
        {campaign.donorFeed.map((entry) => (
          <li className="ea-feed-row" key={`${entry.name}-${entry.ago}`}>
            <span className="ea-feed-who">
              <span className="ea-feed-name">{entry.name}</span>
              <span className="ea-feed-place">from {entry.place}</span>
            </span>
            <span className="ea-feed-meta">
              <span className="ea-feed-amount ea-num">
                {formatAmount(entry.amount)}
              </span>
              <span className="ea-feed-ago ea-num">{entry.ago} ago</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The campaign page: everything above the fold protects the feeling the ad
 * created; everything below feeds it. One scroll, one decision. */
export function StoryScreen() {
  return (
    <div className="ea-story">
      <header className="ea-top-bar">
        <span className="ea-wordmark">{campaign.brand}</span>
        <span className="ea-top-actions">
          <button type="button" className="ea-icon-button" aria-label="Share">
            <Export size={17} />
          </button>
          <button type="button" className="ea-icon-button" aria-label="Save">
            <Heart size={17} />
          </button>
        </span>
      </header>

      <HeroCarousel />

      <h1 className="ea-story-title">{campaign.title}</h1>

      <ProgressModule />
      <OrganizerRow />

      <section className="ea-story-body">
        <span className="ea-caps">About this campaign</span>
        {campaign.story.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </section>

      <DonorFeed />
    </div>
  );
}
