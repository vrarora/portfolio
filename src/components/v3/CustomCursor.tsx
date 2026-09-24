"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a, button, [role='button'], label, summary, select";
const TEXT_ENTRY = "input, textarea, [contenteditable='true']";

/**
 * A soft arrow that replaces the system pointer on mouse and trackpad devices.
 * It shrinks over anything clickable and steps aside for text fields, where the caret matters more.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!enabled || !cursor) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const setState = (name: string, on: boolean) => cursor.classList.toggle(name, on);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;

      const target = event.target instanceof Element ? event.target : null;
      const overText = Boolean(target?.closest(TEXT_ENTRY));
      setState("is-visible", !overText);
      setState("is-interactive", Boolean(target?.closest(INTERACTIVE)));
    };

    const onDown = () => setState("is-pressed", true);
    const onUp = () => setState("is-pressed", false);
    const onLeave = () => setState("is-visible", false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={cursorRef} className="v3-cursor" aria-hidden="true">
      <svg className="v3-cursor-arrow" width="20" height="22" viewBox="0 0 20 22" overflow="visible">
        <path
          d="M3.2 1.6 18.4 9.3c1 .5.9 1.9-.2 2.2l-5.8 1.6c-.5.1-.9.5-1.1.9l-3 5.9c-.5 1-2 .9-2.3-.2L1.4 3.4c-.3-1.2.8-2.3 1.8-1.8Z"
          fill="#111"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
