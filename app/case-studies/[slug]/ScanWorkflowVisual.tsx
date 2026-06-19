"use client";

import { useEffect, useRef, useState } from "react";

const IMG_ASPECT = 849 / 1728;

// Feature positions as fractions of the 1728×849 screenshot dimensions.
// Adjust if the cursor lands on the wrong element after browser verification.
const FX_TAB  = 0.255;  const FY_TAB  = 0.265;  // "Classification 8" tab
const FX_CRON = 0.355;  const FY_CRON = 0.42;   // cron ⓘ button, row 1
const FX_COPY = 0.244;  const FY_COPY = 0.42;   // copy button, row 1
const FX_IDLE = 0.40;   const FY_IDLE = 0.55;   // neutral resting position

const ZOOM = 1.8;

// Timing (ms)
const T_INTRO = 800;
const T_MOVE  = 650;
const T_ZOOM  = 480;
const T_CLICK = 280;
const T_HOLD  = 1900;
const T_FADE  = 280;
const T_PAUSE = 750;

type OverlayKey = "classification" | "tooltip" | "copy";

const OVERLAYS: Record<OverlayKey, string> = {
  classification: "/images/dc-scan-classification.webp",
  tooltip:        "/images/dc-scan-tooltip.webp",
  copy:           "/images/dc-scan-copy.webp",
};

const LABELS: Record<OverlayKey, string> = {
  classification: "Catalogue and classification in separate tabs, failures stay scannable by type",
  tooltip:        "Cron schedules in plain English on hover, no decoding required",
  copy:           "One-click copy of the workflow ID, straight into log search",
};

export default function ScanWorkflowVisual() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelRef    = useRef(false);
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [w, setW]                           = useState(0);
  const [zoom, setZoom]                     = useState(1);
  const [originFx, setOriginFx]             = useState(0.5);
  const [originFy, setOriginFy]             = useState(0.5);
  const [cursorFx, setCursorFx]             = useState(FX_IDLE);
  const [cursorFy, setCursorFy]             = useState(FY_IDLE);
  const [cursorVisible, setCursorVisible]   = useState(false);
  const [clickPulse, setClickPulse]         = useState(false);
  const [overlayKey, setOverlayKey]         = useState<OverlayKey | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [label, setLabel]                   = useState("");
  const [labelVisible, setLabelVisible]     = useState(false);

  // Lazy preload — only fetch screenshots when near the viewport
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        ["/images/dc-scan-workflow.webp", ...Object.values(OVERLAYS)].forEach(src => {
          const img = new Image();
          img.src = src;
        });
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Track rendered container width for cursor pixel calculations
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    cancelRef.current = false;
    timersRef.current = [];

    function after(ms: number, fn: () => void) {
      const t = setTimeout(() => { if (!cancelRef.current) fn(); }, ms);
      timersRef.current.push(t);
    }

    function runAct(fx: number, fy: number, key: OverlayKey, done: () => void) {
      setCursorFx(fx);
      setCursorFy(fy);
      after(T_MOVE, () => {
        setOriginFx(fx);
        setOriginFy(fy);
        setZoom(ZOOM);
        after(T_ZOOM, () => {
          setClickPulse(true);
          setOverlayKey(key);
          setOverlayOpacity(1);
          setLabel(LABELS[key]);
          setLabelVisible(true);
          after(T_CLICK, () => {
            setClickPulse(false);
            after(T_HOLD, () => {
              setLabelVisible(false);
              after(T_FADE, () => {
                setZoom(1);
                after(T_ZOOM, () => {
                  setOverlayOpacity(0);
                  after(T_PAUSE, () => {
                    setOverlayKey(null);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    }

    function cycle() {
      setCursorVisible(true);
      setCursorFx(FX_IDLE);
      setCursorFy(FY_IDLE);
      after(T_INTRO, () => {
        runAct(FX_TAB, FY_TAB, "classification", () => {
          runAct(FX_CRON, FY_CRON, "tooltip", () => {
            runAct(FX_COPY, FY_COPY, "copy", () => {
              cycle();
            });
          });
        });
      });
    }

    after(400, cycle);
    return () => {
      cancelRef.current = true;
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const h = w * IMG_ASPECT;
  const cursorX = cursorFx * w;
  const cursorY = cursorFy * h;

  return (
    <div ref={wrapRef} style={{ background: "#eef0f2", borderRadius: 10, padding: "20px 24px 16px" }}>

      {/* ── Mockup image + zoom ── */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          aspectRatio: "1728 / 849",
          width: "100%",
          overflow: "hidden",
          borderRadius: 7,
        }}
      >
        {/* Zoom wrapper */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: `${originFx * 100}% ${originFy * 100}%`,
            transition: `transform ${T_ZOOM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            willChange: "transform",
          }}
        >
          <img
            src="/images/dc-scan-workflow.webp"
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
          {overlayKey && (
            <img
              key={overlayKey}
              src={OVERLAYS[overlayKey]}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: overlayOpacity,
                transition: `opacity ${T_FADE}ms ease`,
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Cursor — lives outside the zoom wrapper, in display space */}
        {w > 0 && cursorVisible && (
          <div
            style={{
              position: "absolute",
              left: cursorX,
              top: cursorY,
              transition: `left ${T_MOVE}ms cubic-bezier(0.4, 0, 0.2, 1), top ${T_MOVE}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {clickPulse && (
              <div
                style={{
                  position: "absolute",
                  left: -12,
                  top: -12,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(22,22,22,0.12)",
                  animation: "swv-ripple 0.45s ease-out forwards",
                }}
              />
            )}
            <svg
              width="11"
              height="14"
              viewBox="0 0 16 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))" }}
            >
              <path
                d="M1 1L1 15L5.5 11L8.5 17.5L10.5 16.5L7.5 10H13L1 1Z"
                fill="white"
                stroke="#333"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* ── Label — sits in grey area below the mockup ── */}
      <div
        style={{
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 12,
        }}
      >
        <div
          style={{
            opacity: labelVisible ? 1 : 0,
            transition: `opacity ${T_FADE}ms ease`,
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 500,
            color: "#6b7280",
            textAlign: "center",
            letterSpacing: 0,
            lineHeight: 1.45,
          }}
        >
          {label || " "}
        </div>
      </div>
    </div>
  );
}
