"use client";

import { useEffect, useRef, useState } from "react";

const LEVELS = [
  { img: "/images/dc-level-org.webp", level: "Organization" },
  { img: "/images/dc-level-domain.webp", level: "Domain" },
  { img: "/images/dc-level-subdomain.webp", level: "Subdomain" },
  { img: "/images/dc-level-asset.webp", level: "Asset" },
  { img: "/images/dc-level-database.webp", level: "Database" },
  { img: "/images/dc-level-schema.webp", level: "Schema" },
  { img: "/images/dc-level-table.webp", level: "Table" },
  { img: "/images/dc-level-column.webp", level: "Column" },
];

export default function HierarchyExplorer() {
  const [level, setLevel] = useState(0);
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
            LEVELS.map(
              (l) =>
                new Promise<void>((res) => {
                  const img = new Image();
                  img.src = l.img;
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

    const getCursorCoords = () => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      const CX = 0.37;
      const CY_TARGET = 0.32;
      return {
        x: rect.width * CX,
        y: rect.height * CY_TARGET,
      };
    };

    const moveCursor = (x: number, y: number, animate: boolean) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transition = animate
        ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
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
      if (!cancelled) {
        el.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      }
      await wait(70);
    };

    async function loop() {
      while (!cancelled) {
        hideCursor();
        await wait(1100);
        if (cancelled) return;

        const coords = getCursorCoords();
        moveCursor(coords.x, coords.y, false);
        await wait(400);
        if (cancelled) return;

        moveCursor(coords.x, coords.y, true);
        await wait(650);
        if (cancelled) return;

        await wait(400);
        if (cancelled) return;

        await clickPulse(coords.x, coords.y);
        if (cancelled) return;

        hideCursor();
        await wait(300);
        if (cancelled) return;

        setLevel((level + 1) % LEVELS.length);
        await wait(400);
        if (cancelled) return;
      }
    }

    loop();
    return () => { cancelled = true; };
  }, [loaded, level]);

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
        {/* Stacked images with crossfade */}
        {LEVELS.map((l, i) => (
          <img
            key={i}
            src={l.img}
            alt={`Level ${i}: ${l.level}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === level ? 1 : 0,
              transition: "opacity 0.35s ease-in-out",
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
