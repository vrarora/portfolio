"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Beat 4 scene for the design-repo case study: a pre-sales client call where
 * a working prototype is clicked through live in a screen share. The cursor
 * switches tabs and hovers rows so the client watches a product, not slides.
 * The "seeded demo data" chip keeps the claim honest: the Supabase backend is
 * still being wired in.
 */

type Tab = "overview" | "findings";

export default function DesignRepoDemoVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [hoverRow, setHoverRow] = useState<number | null>(null);
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

  useEffect(() => {
    if (!inView || reduced) return;
    cancelRef.current = false;
    const timers = timersRef.current;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });

    const moveTo = (target: string) => {
      const wrap = shareRef.current;
      const el = wrap?.querySelector<HTMLElement>(`[data-drd="${target}"]`);
      if (!wrap || !el) return;
      const wrapRect = wrap.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setCursor({
        x: rect.left - wrapRect.left + rect.width / 2,
        y: rect.top - wrapRect.top + rect.height / 2,
      });
    };

    const click = async () => {
      setClickPulse(true);
      await wait(240);
      setClickPulse(false);
    };

    const run = async () => {
      await wait(1000);
      while (!cancelRef.current) {
        moveTo("tab-findings");
        await wait(900);
        if (cancelRef.current) return;
        await click();
        setTab("findings");
        await wait(1200);

        moveTo("row-1");
        await wait(800);
        if (cancelRef.current) return;
        setHoverRow(1);
        await wait(1300);
        setHoverRow(null);

        moveTo("tab-overview");
        await wait(900);
        if (cancelRef.current) return;
        await click();
        setTab("overview");
        await wait(1600);
      }
    };

    run();

    return () => {
      cancelRef.current = true;
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, [inView, reduced]);

  return (
    <div
      ref={rootRef}
      className={`drd-canvas${inView ? " drd-in" : ""}`}
      role="img"
      aria-label="A video call where a working prototype is screen-shared to a client. A cursor switches between the Overview and Findings tabs of the running product, marked with a seeded demo data chip."
    >
      <div className="drd-call">
        <div className="drd-call-bar">
          <span className="drd-call-title">Client demo · screen share</span>
          <span className="drd-call-time">24:31</span>
        </div>

        <div className="drd-call-body">
          <div className="drd-share" ref={shareRef}>
            <span className="drd-seeded">seeded demo data</span>

            <div className="drd-proto">
              <div className="drd-proto-head">
                <span className="drd-proto-brand">Privy</span>
                <nav className="drd-tabs" aria-hidden="true">
                  <span
                    className={`drd-tab${tab === "overview" ? " drd-tab-active" : ""}`}
                    data-drd="tab-overview"
                  >
                    Overview
                  </span>
                  <span
                    className={`drd-tab${tab === "findings" ? " drd-tab-active" : ""}`}
                    data-drd="tab-findings"
                  >
                    Findings
                  </span>
                </nav>
              </div>

              {tab === "overview" ? (
                <div className="drd-pane" key="overview">
                  <div className="drd-stats">
                    {[
                      { v: "128", l: "sources" },
                      { v: "3.4k", l: "PII fields" },
                      { v: "97%", l: "classified" },
                    ].map((s) => (
                      <span className="drd-stat" key={s.l}>
                        <strong>{s.v}</strong>
                        <span>{s.l}</span>
                      </span>
                    ))}
                  </div>
                  <div className="drd-bars" aria-hidden="true">
                    {[62, 84, 45, 71, 56, 90, 38].map((h, i) => (
                      <i key={i} style={{ ["--h" as string]: `${h}%`, ["--i" as string]: i }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="drd-pane" key="findings">
                  {[
                    { name: "pan_number", sev: "High" },
                    { name: "aadhaar_ref", sev: "High" },
                    { name: "email_address", sev: "Medium" },
                  ].map((row, i) => (
                    <span
                      key={row.name}
                      className={`drd-frow${hoverRow === i ? " drd-frow-hover" : ""}`}
                      data-drd={`row-${i}`}
                    >
                      <span className="drd-frow-name">{row.name}</span>
                      <span className={`drd-sev drd-sev-${row.sev.toLowerCase()}`}>{row.sev}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {!reduced && cursor && (
              <span
                className={`drd-cursor${clickPulse ? " drd-cursor-click" : ""}`}
                style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 3l14 8-6.6 1.5L9 19 5 3z"
                    fill="#111827"
                    stroke="#ffffff"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
            )}
          </div>

          <div className="drd-rail">
            {[
              { initials: "VA", name: "Pre-sales", speaking: true },
              { initials: "CL", name: "Client", speaking: false },
            ].map((p) => (
              <div className={`drd-tile${p.speaking ? " drd-tile-speaking" : ""}`} key={p.name}>
                <span className="drd-avatar">{p.initials}</span>
                <span className="drd-tile-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="drd-controls" aria-hidden="true">
          <i />
          <i />
          <i className="drd-control-share" />
          <i />
        </div>
      </div>
    </div>
  );
}
