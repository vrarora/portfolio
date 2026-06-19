"use client";

import { useEffect, useRef, useState } from "react";

const IMG_ASPECT = 849 / 1728;

// Feature positions as fractions of the 1728×849 screenshot.
// Adjust if cursor lands on wrong element after browser verification.
const FX_BTN   = 0.948; const FY_BTN   = 0.133; // "+ Data Asset" button
const FX_GCS   = 0.454; const FY_GCS   = 0.459; // GCS card in connector modal
const FX_QUICK = 0.573; const FY_QUICK = 0.398; // Quick tier row in scan scope panel
const FX_SAVE  = 0.676; const FY_SAVE  = 0.272; // "Save and Continue" button
const FX_IDLE  = 0.50;  const FY_IDLE  = 0.55;  // neutral resting position

const T_INTRO    = 900;
const T_MOVE     = 650;
const T_CLICK    = 280;
const T_HOLD     = 1800;
const T_CROSSFADE = 480; // crossfade between overlay states
const T_FADE     = 280;
const T_PAUSE    = 700;

type OverlayKey = "modal" | "configure" | "quick" | "done";

const OVERLAYS: Record<OverlayKey, string> = {
  modal:     "/images/dc-onboard-modal.webp",
  configure: "/images/dc-onboard-configure.webp",
  quick:     "/images/dc-onboard-quick.webp",
  done:      "/images/dc-onboard-done.webp",
};

const LABELS: Record<OverlayKey, string> = {
  modal:     "Category browsing and search: connector selection in one step",
  configure: "Form and scan scope on a single screen, no separate configuration step",
  quick:     "Quick scan selected: fast spot-check, results in ~2 minutes",
  done:      "Asset connected and immediately visible in the catalogue",
};

export default function OnboardingFlowVisual() {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelRef    = useRef(false);
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [w, setW]                         = useState(0);
  const [cursorFx, setCursorFx]           = useState(FX_IDLE);
  const [cursorFy, setCursorFy]           = useState(FY_IDLE);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [clickPulse, setClickPulse]       = useState(false);
  const [label, setLabel]                 = useState("");
  const [labelVisible, setLabelVisible]   = useState(false);

  // Dual-slot crossfade: slotA and slotB are always mounted when non-null.
  // Transitioning = fade in the new slot while fading out the old one simultaneously.
  const [slotA, setSlotA]           = useState<OverlayKey | null>(null);
  const [slotB, setSlotB]           = useState<OverlayKey | null>(null);
  const [slotAOpacity, setSlotAOpacity] = useState(0);
  const [slotBOpacity, setSlotBOpacity] = useState(0);
  // Which slot is currently "active" (fading in next time)
  const activeSlotRef = useRef<"a" | "b">("a");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        ["/images/dc-onboard-assets.webp", ...Object.values(OVERLAYS)].forEach(src => {
          const img = new Image();
          img.src = src;
        });
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    cancelRef.current = false;
    timersRef.current = [];

    function after(ms: number, fn: () => void) {
      const t = setTimeout(() => { if (!cancelRef.current) fn(); }, ms);
      timersRef.current.push(t);
    }

    // Show a new overlay by crossfading into the inactive slot
    function showOverlay(key: OverlayKey) {
      if (activeSlotRef.current === "a") {
        // B is inactive — load key into B, fade B in, fade A out
        setSlotB(key);
        after(16, () => { // next frame so src is set before opacity transition
          setSlotBOpacity(1);
          setSlotAOpacity(0);
        });
        activeSlotRef.current = "b";
      } else {
        setSlotA(key);
        after(16, () => {
          setSlotAOpacity(1);
          setSlotBOpacity(0);
        });
        activeSlotRef.current = "a";
      }
    }

    function hideOverlay() {
      setSlotAOpacity(0);
      setSlotBOpacity(0);
    }

    // Move cursor, click, show overlay, hold, fade label — overlay persists for next act
    function act(fx: number, fy: number, key: OverlayKey, holdMs: number, then: () => void) {
      setCursorFx(fx);
      setCursorFy(fy);
      after(T_MOVE, () => {
        setClickPulse(true);
        showOverlay(key);
        setLabel(LABELS[key]);
        setLabelVisible(true);
        after(T_CLICK, () => {
          setClickPulse(false);
          after(holdMs, () => {
            setLabelVisible(false);
            after(T_FADE, then);
          });
        });
      });
    }

    function cycle() {
      setCursorVisible(true);
      setCursorFx(FX_IDLE);
      setCursorFy(FY_IDLE);
      after(T_INTRO, () => {
        // Act 1: "+ Data Asset" → connector modal
        act(FX_BTN, FY_BTN, "modal", T_HOLD, () => {
          // Act 2: modal visible → GCS card → configure step (crossfade)
          act(FX_GCS, FY_GCS, "configure", T_HOLD, () => {
            // Act 3: configure visible → Quick tier → quick selected (crossfade)
            act(FX_QUICK, FY_QUICK, "quick", T_HOLD, () => {
              // Act 4: quick visible → Save and Continue → done
              act(FX_SAVE, FY_SAVE, "done", T_HOLD * 1.6, () => {
                // Fade out and reset
                hideOverlay();
                after(T_CROSSFADE + T_PAUSE, () => {
                  setSlotA(null);
                  setSlotB(null);
                  activeSlotRef.current = "a";
                  cycle();
                });
              });
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
        {/* Base image */}
        <img
          src="/images/dc-onboard-assets.webp"
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

        {/* Slot A overlay */}
        {slotA && (
          <img
            src={OVERLAYS[slotA]}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: slotAOpacity,
              transition: `opacity ${T_CROSSFADE}ms ease`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Slot B overlay */}
        {slotB && (
          <img
            src={OVERLAYS[slotB]}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: slotBOpacity,
              transition: `opacity ${T_CROSSFADE}ms ease`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Cursor */}
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

      {/* Label */}
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
          {label || " "}
        </div>
      </div>
    </div>
  );
}
