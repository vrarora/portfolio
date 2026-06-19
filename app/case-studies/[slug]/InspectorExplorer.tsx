"use client";

import { useEffect, useRef, useState } from "react";

const FRAMES = [
  { img: "/images/dc-inspector-default.webp", label: "default" },
  { img: "/images/dc-inspector-selected.webp", label: "selected" },
];

// Relative cursor positions within the screenshot (1728×849)
// CX: within the Name column of the main content table
// CY_ROW1: center of the "id" row (row 1)
// CY_ROW4: center of the "aadhaar_id" row (row 4, 3 below id)
const CX = 0.33;
const CY_ROW1 = 0.43;
const CY_ROW4 = 0.58;

export default function InspectorExplorer() {
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Lazy-preload: only fetch images when component is near the viewport
  useEffect(() => {
    const el = containerRef.current?.parentElement ?? containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          Promise.all(
            FRAMES.map(
              (f) =>
                new Promise<void>((res) => {
                  const img = new Image();
                  img.src = f.img;
                  img.onload = () => res();
                  img.onerror = () => res();
                })
            )
          ).then(() => setLoaded(true));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const getCoords = (cx: number, cy: number) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      return { x: rect.width * cx, y: rect.height * cy };
    };

    const moveCursor = (x: number, y: number, animate: boolean, duration = 0.6) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transition = animate
        ? `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
        : "none";
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.opacity = "1";
    };

    const hideCursor = () => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transition = "opacity 0.15s ease";
      el.style.opacity = "0";
    };

    const fireRipple = (x: number, y: number) => {
      const el = rippleRef.current;
      if (!el) return;
      el.style.transition = "none";
      el.style.transform = `translate(${x - 12}px, ${y - 12}px) scale(0)`;
      el.style.opacity = "0.5";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!el) return;
          el.style.transition = "transform 0.35s ease-out, opacity 0.35s ease-out";
          el.style.transform = `translate(${x - 12}px, ${y - 12}px) scale(1)`;
          el.style.opacity = "0";
        });
      });
    };

    const clickPulse = async (x: number, y: number) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transition = "transform 0.07s ease";
      el.style.transform = `translate(${x}px, ${y}px) scale(0.8)`;
      fireRipple(x, y);
      await wait(80);
      if (!cancelled) el.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      await wait(70);
    };

    async function loop() {
      while (!cancelled) {
        // --- Frame 0: default state, panel shows "About this table" ---
        setFrame(0);
        hideCursor();
        await wait(1400);
        if (cancelled) return;

        // Cursor appears at row 1 (id)
        const row1 = getCoords(CX, CY_ROW1);
        moveCursor(row1.x, row1.y, false);
        await wait(300);
        if (cancelled) return;

        // Move down to row 4 (aadhaar_id)
        const row4 = getCoords(CX, CY_ROW4);
        moveCursor(row4.x, row4.y, true, 0.55);
        await wait(600);
        if (cancelled) return;

        // Pause on the row
        await wait(350);
        if (cancelled) return;

        // Click → switch to selected frame
        await clickPulse(row4.x, row4.y);
        if (cancelled) return;

        hideCursor();
        await wait(150);
        if (cancelled) return;

        // --- Frame 1: aadhaar_id selected, panel shows "About this column" ---
        setFrame(1);
        await wait(2400);
        if (cancelled) return;

        // Cursor fades in at row 4, moves back up to row 1
        moveCursor(row4.x, row4.y, false);
        await wait(200);
        if (cancelled) return;

        moveCursor(row1.x, row1.y, true, 0.45);
        await wait(500);
        if (cancelled) return;

        await clickPulse(row1.x, row1.y);
        if (cancelled) return;

        hideCursor();
        await wait(150);
        if (cancelled) return;
      }
    }

    loop();
    return () => { cancelled = true; };
  }, [loaded]);

  return (
    <div
      style={{
        background: "#eef0f2",
        borderRadius: 10,
        padding: "20px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1728 / 849",
          borderRadius: 7,
          overflow: "hidden",
          boxShadow: "0 2px 14px rgba(0,0,0,0.15)",
        }}
      >
        {FRAMES.map((f, i) => (
          <img
            key={i}
            src={f.img}
            alt={`Inspector ${f.label}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === frame ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Cursor */}
        <div
          ref={cursorRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 10,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))",
            willChange: "transform, opacity",
          }}
        >
          <svg width="11" height="14" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 1L1 15.5L5 11.5L8.5 19L11 18L7.5 10.5L14 10.5L1 1Z"
              fill="white"
              stroke="#333"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Ripple */}
        <div
          ref={rippleRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "rgba(34, 114, 180, 0.35)",
            pointerEvents: "none",
            zIndex: 9,
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      </div>
    </div>
  );
}
