"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Beat 2 contrast for the design-repo case study, told as two clickable
 * scenes (same pattern as the beat 1 vignette). Scene 1: the old handoff —
 * a Figma frame where comment pins keep landing, a thread gets resolved and
 * another pin appears, the version ticks up. Scene 2: the new handoff — the
 * same design running, the cursor testing the flow itself, zero comment
 * threads.
 *
 * The screen is a public-safe recreation in the Data Compass product language
 * (this portfolio's anonymized stand-in for Privy), not IDfy footage.
 */

type Scene = "figma" | "live";
type Filter = "all" | "failed";

type Row = {
  id: string;
  source: string;
  kind: string;
  status: "running" | "failed" | "complete";
  lastScan: string;
};

const ROWS: Row[] = [
  { id: "hr", source: "hr_admin_db", kind: "PostgreSQL", status: "running", lastScan: "2m ago" },
  { id: "pay", source: "payments_ledger", kind: "MySQL", status: "failed", lastScan: "1h ago" },
  { id: "crm", source: "crm_contacts", kind: "Salesforce", status: "complete", lastScan: "3h ago" },
  { id: "sup", source: "support_tickets", kind: "Zendesk", status: "complete", lastScan: "6h ago" },
];

const STATUS_LABEL: Record<Row["status"], string> = {
  running: "Running",
  failed: "Failed",
  complete: "Complete",
};

const PINS = [
  { id: 1, initial: "D", color: "#e0559a", x: 68, y: 26 },
  { id: 2, initial: "P", color: "#d29922", x: 42, y: 62 },
  { id: 3, initial: "D", color: "#4c8bf5", x: 20, y: 40 },
  { id: 4, initial: "P", color: "#7c8cf8", x: 82, y: 66 },
];

const SCENES: Array<{ id: Scene; label: string }> = [
  { id: "figma", label: "Figma comments, endless loops" },
  { id: "live", label: "Test the flow, move fast" },
];

type LiveState = {
  filter: Filter;
  hoverRow: string | null;
};

const IDLE_STATE: LiveState = { filter: "all", hoverRow: null };

function MiniScreen({ mode, state }: { mode: "static" | "live"; state: LiveState }) {
  const { filter, hoverRow } = state;
  const counts = {
    all: ROWS.length,
    failed: ROWS.filter((r) => r.status === "failed").length,
  };

  return (
    <div className={`drc-screen drc-screen-${mode}`}>
      <div className="drc-screen-head">
        <div>
          <p className="drc-screen-title">Scan queue</p>
          <p className="drc-screen-sub">Privy Suite / Data Compass</p>
        </div>
        <span className="drc-newscan">New scan</span>
      </div>

      <div className="drc-chips">
        <span className={`drc-chip${filter === "all" ? " drc-chip-active" : ""}`} data-drc="chip-all">
          All <em>{counts.all}</em>
        </span>
        <span className={`drc-chip${filter === "failed" ? " drc-chip-active" : ""}`} data-drc="chip-failed">
          Failed <em>{counts.failed}</em>
        </span>
        <span className="drc-chip">
          Running <em>1</em>
        </span>
      </div>

      <div className="drc-table" data-filter={filter}>
        <div className="drc-row drc-row-head">
          <span>Source</span>
          <span>Status</span>
          <span>Last scan</span>
        </div>
        {ROWS.map((row) => {
          const hidden = filter === "failed" && row.status !== "failed";
          return (
            <div
              key={row.id}
              className={`drc-row${hidden ? " drc-row-hidden" : ""}${hoverRow === row.id ? " drc-row-hover" : ""}`}
              data-drc={`row-${row.id}`}
            >
              <span className="drc-cell-source">
                <span className="drc-source-name">{row.source}</span>
                <span className="drc-source-kind">{row.kind}</span>
              </span>
              <span className="drc-cell-status">
                <span className={`drc-status drc-status-${row.status}`}>{STATUS_LABEL[row.status]}</span>
              </span>
              <span className="drc-cell-time">{row.lastScan}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DesignRepoContrastVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const liveWrapRef = useRef<HTMLDivElement>(null);
  const genRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [scene, setScene] = useState<Scene>("figma");
  const [cycle, setCycle] = useState(0);

  // Scene 1 state
  const [pinCount, setPinCount] = useState(0);
  const [thread, setThread] = useState<"open" | "resolved" | null>(null);
  const [version, setVersion] = useState(3);

  // Scene 2 state
  const [live, setLive] = useState<LiveState>(IDLE_STATE);
  const [quiet, setQuiet] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [clickPulse, setClickPulse] = useState(false);

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

  const playFrom = useCallback((startScene: Scene) => {
    clearTimers();
    const gen = ++genRef.current;
    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(() => {
        if (gen === genRef.current) fn();
      }, ms);
      timersRef.current.push(id);
    };

    const moveTo = (target: string) => {
      const wrap = liveWrapRef.current;
      const el = wrap?.querySelector<HTMLElement>(`[data-drc="${target}"]`);
      if (!wrap || !el) return;
      const wrapRect = wrap.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setCursor({
        x: rect.left - wrapRect.left + rect.width / 2,
        y: rect.top - wrapRect.top + rect.height / 2,
      });
    };

    const click = () => {
      setClickPulse(true);
      t(240, () => setClickPulse(false));
    };

    const step = (s: Scene) => {
      setScene(s);
      if (s === "figma") {
        setPinCount(0);
        setThread(null);
        setVersion(3);
        setLive(IDLE_STATE);
        setQuiet(false);
        setCursor(null);
        setCycle((c) => c + 1);
        t(600, () => setPinCount(1));
        t(1200, () => setPinCount(2));
        t(1800, () => setPinCount(3));
        t(2400, () => setThread("open"));
        t(3700, () => {
          setThread("resolved");
          setVersion(4);
        });
        t(4600, () => {
          setThread(null);
          setPinCount(4);
          setVersion(5);
        });
        t(5800, () => step("live"));
      } else {
        setPinCount(0);
        setThread(null);
        setLive(IDLE_STATE);
        setQuiet(false);
        t(900, () => moveTo("row-pay"));
        t(1700, () => setLive((v) => ({ ...v, hoverRow: "pay" })));
        t(2700, () => {
          setLive((v) => ({ ...v, hoverRow: null }));
          moveTo("chip-failed");
        });
        t(3500, () => {
          click();
          setLive((v) => ({ ...v, filter: "failed" }));
        });
        t(4900, () => moveTo("chip-all"));
        t(5700, () => {
          click();
          setLive(IDLE_STATE);
        });
        t(6300, () => setQuiet(true));
        t(8200, () => step("figma"));
      }
    };
    step(startScene);
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setScene("live");
      setQuiet(true);
      return;
    }
    playFrom("figma");
    return () => {
      genRef.current++;
      clearTimers();
    };
  }, [inView, reduced, playFrom]);

  const handleSceneClick = (target: Scene) => {
    if (reduced) {
      genRef.current++;
      clearTimers();
      setScene(target);
      setQuiet(target === "live");
      setPinCount(target === "figma" ? 4 : 0);
      setThread(null);
      return;
    }
    playFrom(target);
  };

  const openComments = scene === "figma" ? Math.max(pinCount, 1) : 0;

  return (
    <div
      ref={rootRef}
      className={`drc-canvas${inView ? " drc-in" : ""}`}
      role="figure"
      aria-label="Two scenes. The old handoff: a Figma frame of the scan-queue design where comment pins keep landing, a thread is resolved and another appears, the version ticks from v3 to v5. The new handoff: the same design running live, a cursor testing the failed state and filters itself, with zero open comment threads."
    >
      <ol className="dr-steps">
        {SCENES.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`dr-step${scene === s.id ? " dr-step-active" : ""}`}
              aria-current={scene === s.id}
              onClick={() => handleSceneClick(s.id)}
            >
              <span className="dr-step-num">{i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className={`drc-stage drc-scene-${scene}`} key={cycle}>
        <div className="drc-bar">
          <span className="drc-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="drc-tab">
            {scene === "figma" ? `scan-queue — Figma · v${version}` : "scan-queue — live preview"}
          </span>
          {scene === "figma" ? (
            <span className="drc-bar-chip drc-bar-chip-warn">{openComments} open comments</span>
          ) : (
            <span className="drc-bar-chip drc-bar-chip-ok">
              <i /> Preview ready · vercel.app
            </span>
          )}
        </div>

        <div className="drc-body">
          {/* Scene 1: the Figma comment loop */}
          <div className={`drc-scene drc-figma${scene === "figma" ? " drc-scene-active" : ""}`} aria-hidden={scene !== "figma"}>
            <div className="drc-artboard">
              <span className="drc-artboard-name">scan-queue / handoff</span>
              <MiniScreen mode="static" state={IDLE_STATE} />
              {PINS.slice(0, pinCount).map((pin) => (
                <span
                  key={pin.id}
                  className="drc-pin"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%`, background: pin.color }}
                >
                  {pin.initial}
                </span>
              ))}
              {thread && (
                <div className={`drc-thread${thread === "resolved" ? " drc-thread-resolved" : ""}`}>
                  <span className="drc-thread-avatar">P</span>
                  <span className="drc-thread-text">
                    {thread === "resolved" ? "Resolved · new comment on v4" : "what happens when a scan fails?"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Scene 2: test the flow */}
          <div
            className={`drc-scene drc-live${scene === "live" ? " drc-scene-active" : ""}`}
            aria-hidden={scene !== "live"}
            ref={liveWrapRef}
          >
            <MiniScreen mode="live" state={live} />
            <span className={`drc-quiet${quiet ? " drc-quiet-in" : ""}`}>0 open comment threads · flow tested live</span>
            {!reduced && scene === "live" && cursor && (
              <span
                className={`drc-cursor${clickPulse ? " drc-cursor-click" : ""}`}
                style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3l14 8-6.6 1.5L9 19 5 3z" fill="#111827" stroke="#ffffff" strokeWidth="1.6" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
