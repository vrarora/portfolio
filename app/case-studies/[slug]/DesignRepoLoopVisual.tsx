"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Beat 1 vignette for the design-repo case study: the workflow that died the
 * day it worked, told in three looping acts inside one window. Act 1: drawing
 * screens in a Figma-style canvas with multiplayer cursors. Act 2: designing
 * in code — an agent terminal streams on the left while low-fi wireframe
 * blocks pop into the preview, then a PR merges. Act 3: a retirement stamp
 * lands over the frozen pipeline while the Merged badge stays lit.
 *
 * The step strip is clickable: each step jumps the vignette to that act and
 * the loop continues from there.
 */

type Act = "figma" | "ide" | "retired";

const TERM_LINES: Array<{ kind: "cmd" | "out" | "ok"; text: string }> = [
  { kind: "cmd", text: '$ claude "build the lineage module"' },
  { kind: "out", text: "⏺ reading PRD.md · TRD.md" },
  { kind: "out", text: "⏺ writing LineageModule.tsx" },
  { kind: "out", text: "⏺ wiring graph view + filters" },
  { kind: "ok", text: "✓ preview updated" },
];

const STEPS: Array<{ id: Act; label: string }> = [
  { id: "figma", label: "Drawing screens" },
  { id: "ide", label: "Designing in code" },
  { id: "retired", label: "Retired the day it worked" },
];

export default function DesignRepoLoopVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const genRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [act, setAct] = useState<Act>("figma");
  const [prState, setPrState] = useState<"none" | "open" | "merged">("none");
  const [cycle, setCycle] = useState(0);

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

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const playFrom = useCallback((startAct: Act) => {
    clearTimers();
    const gen = ++genRef.current;
    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(() => {
        if (gen === genRef.current) fn();
      }, ms);
      timersRef.current.push(id);
    };
    const step = (a: Act) => {
      setAct(a);
      if (a === "figma") {
        setPrState("none");
        setCycle((c) => c + 1);
        t(3000, () => step("ide"));
      } else if (a === "ide") {
        setPrState("none");
        setCycle((c) => c + 1);
        t(2400, () => setPrState("open"));
        t(3400, () => setPrState("merged"));
        t(5200, () => step("retired"));
      } else {
        setPrState("merged");
        t(3200, () => step("figma"));
      }
    };
    step(startAct);
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setAct("retired");
      setPrState("merged");
      return;
    }
    playFrom("figma");
    return () => {
      genRef.current++;
      clearTimers();
    };
  }, [inView, reduced, playFrom]);

  const handleStepClick = (target: Act) => {
    if (reduced) {
      genRef.current++;
      clearTimers();
      setAct(target);
      setPrState(target === "figma" ? "none" : "merged");
      return;
    }
    playFrom(target);
  };

  return (
    <div
      ref={rootRef}
      className={`drl-canvas${inView ? " drl-in" : ""}`}
      role="figure"
      aria-label="Three-act loop: drawing screens in a design canvas with multiplayer cursors, then designing in code where an agent terminal streams and wireframe blocks assemble until a pull request merges, then a Workflow Retired stamp lands while the Merged badge stays lit."
    >
      <ol className="dr-steps">
        {STEPS.map((step, i) => (
          <li key={step.id}>
            <button
              type="button"
              className={`dr-step${act === step.id ? " dr-step-active" : ""}`}
              aria-current={act === step.id}
              onClick={() => handleStepClick(step.id)}
            >
              <span className="dr-step-num">{i + 1}</span>
              {step.label}
            </button>
          </li>
        ))}
      </ol>

      <div className={`drl-stage drl-act-${act}`} key={cycle}>
        <div className="drl-bar">
          <span className="drl-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="drl-tab">
            {act === "figma" ? "lineage-module.fig" : "lineage — agent session"}
          </span>
          {act === "ide" && <span className="drl-elapsed">hrs, not weeks</span>}
        </div>

        <div className="drl-body">
          {/* Act 1: Figma-style canvas with multiplayer cursors */}
          <div className={`drl-act drl-figma${act === "figma" ? " drl-act-active" : ""}`} aria-hidden={act !== "figma"}>
            <div className="drl-figma-rail" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="drl-artboards">
              <div className="drl-artboard">
                <span className="drl-artboard-name">Hero / v3</span>
                <span className="drl-skel drl-skel-lg" />
                <span className="drl-skel" style={{ width: "72%" }} />
                <span className="drl-skel" style={{ width: "48%" }} />
                <span className="drl-skel drl-skel-btn" />
              </div>
              <div className="drl-artboard drl-artboard-selected">
                <span className="drl-artboard-name">Graph / v7_final</span>
                <span className="drl-skel drl-skel-lg" />
                <span className="drl-skel" style={{ width: "64%" }} />
                <span className="drl-skel drl-skel-draw" />
                <span className="drl-skel drl-skel-btn" />
                <span className="drl-handles" aria-hidden="true" />
              </div>
            </div>
            <span className="drl-figcur drl-figcur-a" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 3l14 8-6.6 1.5L9 19 5 3z" fill="#4c8bf5" stroke="#ffffff" strokeWidth="1.6" />
              </svg>
              <em>vaibhav</em>
            </span>
            <span className="drl-figcur drl-figcur-b" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 3l14 8-6.6 1.5L9 19 5 3z" fill="#e0559a" stroke="#ffffff" strokeWidth="1.6" />
              </svg>
              <em>ananya</em>
            </span>
          </div>

          {/* Act 2: agent terminal + low-fi wireframe preview */}
          <div className={`drl-act drl-ide${act !== "figma" ? " drl-act-active" : ""}`} aria-hidden={act === "figma"}>
            <div className="drl-terminal" aria-hidden="true">
              {TERM_LINES.map((line, i) => (
                <span
                  key={i}
                  className={`drl-tline drl-tline-${line.kind}${act !== "figma" ? " drl-tline-in" : ""}`}
                  style={{ ["--i" as string]: i }}
                >
                  {line.text}
                </span>
              ))}
              <span className="drl-tcaret" />
            </div>
            <div className="drl-preview">
              <span className="drl-preview-chip">live preview</span>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`drl-wire drl-wire-${i}${act !== "figma" ? " drl-wire-shown" : ""}`}
                  style={{ ["--i" as string]: i }}
                />
              ))}
            </div>
          </div>

          {/* PR toast */}
          <div className={`drl-pr${prState !== "none" ? " drl-pr-in" : ""}`}>
            <span className="drl-pr-title">PR #214 · lineage module frontend</span>
            <span className={`drl-pr-status${prState === "merged" ? " drl-pr-merged" : ""}`}>
              {prState === "merged" ? "Merged" : "Open"}
            </span>
          </div>

          {/* Act 3: retirement stamp */}
          <div className={`drl-freeze${act === "retired" ? " drl-freeze-in" : ""}`}>
            <span className="drl-stamp">
              Workflow retired
              <em>the day it worked</em>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
