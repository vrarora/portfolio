"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Beat 3 playbook artifact for the design-repo case study: one terminal
 * window reading the repo's real README.md and CONTRIBUTING.md (supplied by
 * Vaibhav, July 2026), one excerpt at a time. Tabs are clickable; the window
 * auto-cycles until the reader takes over. Anonymization per the Locked
 * Context: internal GitLab host redacted, unreleased module names omitted;
 * "Privy" and "Data Compass" are already public on this portfolio.
 */

type TabId = "model" | "ref" | "start";

const TABS: Array<{ id: TabId; label: string; file: string }> = [
  { id: "model", label: "Mental model", file: "CONTRIBUTING.md" },
  { id: "ref", label: "Quick reference", file: "CONTRIBUTING.md" },
  { id: "start", label: "Getting started", file: "README.md" },
];

const MODEL_ROWS = [
  { term: "main branch", meaning: "the “Published” Figma file. Stable, official, shareable." },
  { term: "your branch", meaning: "your “Working Draft”, where you experiment and build." },
  { term: "preview URL", meaning: "a “Shared Prototype Link” for devs and stakeholders." },
];

const REF_ROWS = [
  { situation: "start new work", command: "git checkout -b product-feature-name" },
  { situation: "push & share", command: "git push gitlab your-branch-name" },
  { situation: "publish", command: "merge your branch into main" },
  { situation: "branch naming", command: "designer-name/product-description" },
];

export default function DesignRepoPlaybookCards() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tab, setTab] = useState<TabId>("model");
  const [userLocked, setUserLocked] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setInView(true);
      },
      { rootMargin: "-80px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || userLocked || reduced) return;
    const id = setInterval(() => {
      setTab((current) => {
        const index = TABS.findIndex((t) => t.id === current);
        return TABS[(index + 1) % TABS.length].id;
      });
    }, 5200);
    return () => clearInterval(id);
  }, [inView, userLocked, reduced]);

  const activeFile = TABS.find((t) => t.id === tab)?.file ?? "CONTRIBUTING.md";

  return (
    <div ref={rootRef} className={`drpb-canvas${inView ? " drpb-in" : ""}`}>
      <div className="drpb-window">
        <div className="drpb-bar">
          <span className="drpb-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="drpb-title">privy-design — docs</span>
        </div>

        <div className="drpb-tabs" role="tablist" aria-label="Playbook excerpts">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`drpb-tab${tab === t.id ? " drpb-tab-active" : ""}`}
              onClick={() => {
                setUserLocked(true);
                setTab(t.id);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="drpb-body" key={tab}>
          <p className="drpb-cat">
            <em>$</em> cat {activeFile}
          </p>

          {tab === "model" && (
            <div className="drpb-doc">
              <p className="drpb-h">## The Mental Model</p>
              <p className="drpb-c"># think of this repository exactly like a Figma project</p>
              {MODEL_ROWS.map((row) => (
                <p className="drpb-map" key={row.term}>
                  <span className="drpb-k">{row.term}</span>
                  <em>→</em>
                  <span className="drpb-v">{row.meaning}</span>
                </p>
              ))}
            </div>
          )}

          {tab === "ref" && (
            <div className="drpb-doc">
              <p className="drpb-h">## Quick Reference</p>
              {REF_ROWS.map((row) => (
                <p className="drpb-map" key={row.situation}>
                  <span className="drpb-k">{row.situation}</span>
                  <em>→</em>
                  <span className="drpb-cmd">{row.command}</span>
                </p>
              ))}
              <p className="drpb-c"># e.g. vaibhav/data-compass-heatmap-redesign</p>
            </div>
          )}

          {tab === "start" && (
            <div className="drpb-doc">
              <p className="drpb-h">## Getting Started (Developers)</p>
              <p className="drpb-cmdline">
                <em>$</em> git clone{" "}
                <span className="drpb-redact" title="Internal host redacted">
                  internal host
                </span>
                /privy-design.git
              </p>
              <p className="drpb-cmdline">
                <em>$</em> npm run install:all
              </p>
              <p className="drpb-cmdline">
                <em>$</em> npm run dev
              </p>
              <p className="drpb-c"># every push auto-deploys a live preview URL for the branch</p>
            </div>
          )}
        </div>
      </div>

      <p className="drpb-caption">Real excerpts from the repo&rsquo;s docs, lightly anonymized</p>
    </div>
  );
}
