"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Beat 3 pipeline for the design-repo case study, in terminal language.
 * Plays once on scroll-into-view: the old Figma chain sits muted at the top
 * and gets struck through, a terminal types the clone and branch commands,
 * a git graph draws itself (branch off main, agent commits, merge back as
 * the feature), and the twenty adopters cluster in beneath.
 */

const OLD_CHAIN = ["Figma", "annotate", "interpret", "rebuild"];

const CLUSTERS = [
  { count: 8, label: "designers" },
  { count: 5, label: "PMs" },
  { count: 7, label: "developers" },
];

// phase 0: old chain · 1: clone types · 2: branch + graph draws, old struck · 3: adoption
export default function DesignRepoPipelineVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

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
      { rootMargin: "-60px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setPhase(3);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  let dotIndex = 0;

  return (
    <div
      ref={rootRef}
      className={`drp-canvas drp-phase-${phase}${inView ? " drp-in" : ""}`}
      role="figure"
      aria-label="Terminal pipeline. The old chain, Figma to annotate to interpret to rebuild over weeks, is struck through. A terminal runs git clone and checks out a branch, and a git graph draws: the branch carries design-as-code commits where an agent builds from the PRD and TRD, then merges back to main as the shipped feature. Twenty people now build inside the repo: eight designers, five PMs, seven developers."
    >
      <div className="drp-old" aria-hidden="true">
        <span className="drp-old-chain">
          {OLD_CHAIN.map((node, i) => (
            <span key={node} className="drp-old-node">
              {i > 0 && <em>→</em>}
              {node}
            </span>
          ))}
          <span className="drp-old-loop">↺ review loop · weeks</span>
        </span>
      </div>

      <div className="drp-term-window">
        <div className="drp-term-bar">
          <span className="drp-term-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="drp-term-title">privy-design — zsh</span>
        </div>

        <div className="drp-term-body" aria-hidden="true">
          <p className="drp-cmd">
            <em>$</em>
            {phase >= 1 && <span className="drp-cmd-text drp-cmd-1">git clone privy-design</span>}
            {phase < 2 && <i className="drp-caret" />}
          </p>
          <p className="drp-cmd">
            {phase >= 2 && (
              <>
                <em>$</em>
                <span className="drp-cmd-text drp-cmd-2">git checkout -b ananya/lineage-redesign</span>
                <i className="drp-caret" />
              </>
            )}
          </p>

          <svg
            className="drp-graph"
            viewBox="0 0 560 132"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {/* main */}
            <path className="drp-g-main" d="M16 96 H544" />
            <text className="drp-g-ref" x="16" y="118">
              main · the published design
            </text>

            {/* branch off, work, merge back */}
            <path
              className={`drp-g-branch${phase >= 2 ? " drp-g-drawn" : ""}`}
              d="M96 96 C124 96 128 44 164 44 H400 C444 44 448 96 484 96"
            />
            <text className={`drp-g-branchname${phase >= 2 ? " drp-g-in" : ""}`} x="164" y="28">
              ananya/lineage-redesign
            </text>

            {[
              { cx: 96, cy: 96, d: 0 },
              { cx: 230, cy: 44, d: 1 },
              { cx: 340, cy: 44, d: 2 },
              { cx: 484, cy: 96, d: 3 },
            ].map((dot) => (
              <circle
                key={dot.d}
                className={`drp-g-dot${phase >= 2 ? " drp-g-in" : ""}`}
                style={{ ["--i" as string]: dot.d }}
                cx={dot.cx}
                cy={dot.cy}
                r="5"
              />
            ))}

            <text className={`drp-g-label${phase >= 2 ? " drp-g-in" : ""}`} x="230" y="68" textAnchor="middle">
              design as code
            </text>
            <text className={`drp-g-label${phase >= 2 ? " drp-g-in" : ""}`} x="340" y="68" textAnchor="middle">
              agent + PRD/TRD
            </text>
            <text className={`drp-g-label drp-g-label-merge${phase >= 2 ? " drp-g-in" : ""}`} x="484" y="118" textAnchor="middle">
              feature ships · days
            </text>
          </svg>
        </div>
      </div>

      <div className="drp-adopt">
        <p className="drp-adopt-lead">20 people build inside it</p>
        <div className="drp-clusters">
          {CLUSTERS.map((cluster) => (
            <div className="drp-cluster" key={cluster.label}>
              <span className="drp-dots">
                {Array.from({ length: cluster.count }).map((_, i) => (
                  <i key={i} style={{ ["--i" as string]: dotIndex++ }} />
                ))}
              </span>
              <span className="drp-cluster-label">
                {cluster.count} {cluster.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
