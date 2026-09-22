"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

import { cue } from "@/components/audio/cues";
import { stickers } from "@/content/stickers";
import type { Sticker } from "@/content/stickers";
import { SPRING_GATHER, SPRING_STICKER } from "@/styles/motion";

type Slot = { x: number; y: number; rotate: number; size: number };

const PEEK = [
  { x: 8, y: -6, r: 9 },
  { x: 13, y: -10, r: -7 },
  { x: 17, y: -14, r: 15 },
];

function seeded(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Positions in page-shell coordinates: margin strips beside the column, or a band under the hero on narrow screens. */
function layoutSlots(shell: DOMRect, column: DOMRect, count: number, bandTop: number): Slot[] {
  const vw = window.innerWidth;
  const size = vw < 768 ? 64 : 96;
  const heroTop = column.top - shell.top;
  const slots: Slot[] = [];
  if (vw < 900) {
    // A band under the hero buttons, as many per row as fit.
    const perRow = Math.max(3, Math.min(count, Math.floor((vw - 48) / (size + 10))));
    const rows = Math.ceil(count / perRow);
    const gap = (vw - 48 - size) / Math.max(1, perRow - 1);
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const inRow = row === rows - 1 ? count - row * perRow : perRow;
      const offset = ((perRow - inRow) * gap) / 2;
      slots.push({
        x: 24 + offset + col * gap + (seeded(i) - 0.5) * 8,
        y: bandTop + row * (size + 16) + (seeded(i + 7) - 0.5) * 6,
        rotate: (seeded(i + 3) - 0.5) * 16,
        size,
      });
    }
    return slots;
  }
  const colLeft = column.left - shell.left;
  const colRight = column.right - shell.left;
  const leftStrip: [number, number] = [24, Math.max(24, colLeft - 24 - size)];
  const rightStrip: [number, number] = [colRight + 24, Math.max(colRight + 24, vw - 24 - size)];
  for (let i = 0; i < count; i++) {
    const strip = i % 2 === 0 ? leftStrip : rightStrip;
    const row = Math.floor(i / 2);
    const jitterX = (seeded(i) - 0.5) * 60;
    const jitterY = (seeded(i + 11) - 0.5) * 40;
    const xBase = strip[0] + (strip[1] - strip[0]) * (0.3 + seeded(i + 5) * 0.4);
    slots.push({
      x: Math.min(strip[1], Math.max(strip[0], xBase + jitterX)),
      y: heroTop + 40 + row * 140 + jitterY,
      rotate: (seeded(i + 3) - 0.5) * 16,
      size,
    });
  }
  return slots;
}

type Props = { children: ReactNode; columnSelector?: string };

/** The avatar button that scatters sticker cards into the page margins. */
export function StickerStack({ children, columnSelector = ".home-intro" }: Props) {
  const reduced = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Keeps the layer mounted through the gather animation, then drops it for certain.
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<number | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);
  const [lifted, setLifted] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const zRef = useRef(1);
  const [tops, setTops] = useState<Record<string, number>>({});

  useEffect(() => setShellEl(document.getElementById("page-shell")), []);

  const measure = useCallback(() => {
    const shell = shellEl?.getBoundingClientRect();
    const column = document.querySelector(columnSelector)?.getBoundingClientRect();
    const button = buttonRef.current?.getBoundingClientRect();
    if (!shell || !column || !button) return;
    const actions = document.querySelector(".home-actions")?.getBoundingClientRect();
    const bandTop = (actions ? actions.bottom : column.bottom) - shell.top + 20;
    setSlots(layoutSlots(shell, column, stickers.length, bandTop));
    setOrigin({ x: button.left - shell.left + button.width / 2, y: button.top - shell.top + button.height / 2 });
  }, [shellEl, columnSelector]);

  useEffect(() => {
    if (!open) return;
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, measure]);

  const scatter = () => {
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
    setExiting(false);
    measure();
    setOpen(true);
    setOffsets({});
    cue("sparkle");
  };
  const gather = useCallback(() => {
    setOpen(false);
    setExiting(true);
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => setExiting(false), 1400);
    setLifted(null);
    cue("release");
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") gather();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, gather]);

  const bump = (id: string) => {
    zRef.current += 1;
    setTops((t) => ({ ...t, [id]: zRef.current }));
  };

  const onStickerKey = (e: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setLifted((l) => (l === id ? null : id));
      bump(id);
      cue("press");
      return;
    }
    if (lifted !== id) return;
    const step = e.shiftKey ? 32 : 8;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    setOffsets((o) => ({ ...o, [id]: { x: (o[id]?.x ?? 0) + d[0], y: (o[id]?.y ?? 0) + d[1] } }));
  };

  const peekSrcs = useMemo(() => stickers.slice(0, 3), []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="fx-stack"
        onClick={() => (open ? gather() : scatter())}
        aria-expanded={open}
        aria-label={open ? "Gather the stickers" : `Scatter ${stickers.length} stickers of things I like`}
      >
        <span className="fx-stack-peek" aria-hidden="true" data-hidden={open ? "" : undefined}>
          {peekSrcs.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.id} src={s.src} alt="" style={{ transform: `translate(${PEEK[i].x}px, ${PEEK[i].y}px) rotate(${PEEK[i].r}deg)` }} />
          ))}
        </span>
        <span className="fx-stack-avatar">{children}</span>
      </button>
      {shellEl
        ? createPortal(
            <div className="fx-sticker-layer" aria-live="polite">
              {open || exiting ? (
              <AnimatePresence>
                {open && slots
                  ? stickers.map((s: Sticker, i) => {
                      const slot = slots[i];
                      const off = offsets[s.id] ?? { x: 0, y: 0 };
                      return (
                        <motion.div
                          key={s.id}
                          className={`fx-sticker fx-sticker--${s.kind}`}
                          style={{ width: slot.size, height: slot.size, zIndex: tops[s.id] ?? 1 }}
                          initial={reduced ? { x: slot.x, y: slot.y, opacity: 0, rotate: slot.rotate } : { x: origin.x - slot.size / 2, y: origin.y - slot.size / 2, scale: 0.3, rotate: 0, opacity: 0 }}
                          animate={{
                            x: slot.x + off.x,
                            y: slot.y + off.y,
                            scale: lifted === s.id ? 1.06 : 1,
                            rotate: slot.rotate,
                            opacity: 1,
                            transition: reduced ? { duration: 0.15 } : { ...SPRING_STICKER, delay: i * 0.04 },
                          }}
                          exit={
                            reduced
                              ? { opacity: 0, transition: { duration: 0.15 } }
                              : { x: origin.x - slot.size / 2, y: origin.y - slot.size / 2, scale: 0.3, rotate: 0, opacity: 0, transition: { ...SPRING_GATHER, delay: (stickers.length - 1 - i) * 0.03 } }
                          }
                          drag={!reduced}
                          dragMomentum
                          dragElastic={0.12}
                          dragTransition={{ timeConstant: 200, power: 0.6 }}
                          whileDrag={{ scale: 1.06 }}
                          onPointerDown={() => {
                            bump(s.id);
                            cue("press");
                          }}
                          onDragEnd={() => cue("release")}
                          tabIndex={0}
                          role="img"
                          aria-label={`${s.alt}. ${s.interest}. Press Enter to lift, arrows to move, Escape to gather.`}
                          data-lifted={lifted === s.id ? "" : undefined}
                          onKeyDown={(e) => onStickerKey(e, s.id)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.src} alt="" draggable={false} />
                        </motion.div>
                      );
                    })
                  : null}
              </AnimatePresence>
              ) : null}
            </div>,
            shellEl,
          )
        : null}
    </>
  );
}
