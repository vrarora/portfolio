"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { workTable, type WorkTableItem } from "@/content/work-table";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import "./work-table.css";

/** Where each object rests on the table, in percent of the object area, with its tilt. */
const SPOTS = [
  { left: 8, top: 3, width: 40, height: 22, turn: -5 },
  { left: 54, top: 8, width: 38, height: 22, turn: 4 },
  { left: 8, top: 36, width: 40, height: 24, turn: -3 },
  { left: 64, top: 35, width: 25, height: 33, turn: 3 },
  { left: 38, top: 66, width: 22, height: 31, turn: -3 },
  { left: 8, top: 74, width: 20, height: 20, turn: 3 },
] as const;

/** The collection button fans its thumbnails around the middle one. */
const PILE_TURN = 7;

const FLY_MS = 440;
const STAGGER_MS = 18;
const FLY_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

type Phase = "closed" | "open" | "closing";

const trim = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/**
 * The transform that puts a table image where its pile thumbnail sits. The
 * translation runs inside the object's tilted frame, so the screen-space
 * offset is turned back by the object's tilt before it is applied.
 */
function pileTransform(pileImg: HTMLImageElement, tableImg: HTMLImageElement, pileTurn: number, tableTurn: number) {
  const from = pileImg.getBoundingClientRect();
  const to = tableImg.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const rad = (-tableTurn * Math.PI) / 180;
  const x = dx * Math.cos(rad) - dy * Math.sin(rad);
  const y = dx * Math.sin(rad) + dy * Math.cos(rad);
  const scale = pileImg.offsetWidth / tableImg.offsetWidth;
  return `translate(${x}px, ${y}px) rotate(${pileTurn - tableTurn}deg) scale(${scale})`;
}

/**
 * Mobile navigation to every project. A fanned stack of thumbnails sits at the
 * bottom of the page; tapping it lays the work out on a table, each thumbnail
 * flying from the stack to its spot, and closing flies them back.
 */
export function WorkTable() {
  const pathname = trim(usePathname() ?? "/");
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("closed");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstObjectRef = useRef<HTMLButtonElement>(null);
  const pileImgs = useRef(new Map<string, HTMLImageElement>());
  const tableImgs = useRef(new Map<string, HTMLImageElement>());

  const current = workTable.find((item) => trim(item.href) === pathname);
  const pile = useMemo(() => workTable.filter((item) => item !== current).slice(0, 5), [current]);

  const flights = useCallback(
    (direction: "out" | "back") =>
      pile.flatMap((item, slot) => {
        const pileImg = pileImgs.current.get(item.id);
        const tableImg = tableImgs.current.get(item.id);
        const spot = SPOTS[workTable.indexOf(item)];
        if (!pileImg || !tableImg || !spot) return [];
        const stacked = pileTransform(pileImg, tableImg, (slot - 2) * PILE_TURN, spot.turn);
        const frames = direction === "out" ? [{ transform: stacked }, { transform: "none" }] : [{ transform: "none" }, { transform: stacked }];
        // The top of the stack leaves first and lands back last.
        const order = direction === "out" ? pile.length - 1 - slot : slot;
        return [tableImg.animate(frames, { duration: FLY_MS, delay: order * STAGGER_MS, easing: FLY_EASE, fill: "both" })];
      }),
    [pile],
  );

  // Opening: the table is in place, so fly each image out from its thumbnail.
  useLayoutEffect(() => {
    if (phase !== "open") return;
    firstObjectRef.current?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    const animations = flights("out");
    return () => animations.forEach((animation) => animation.cancel());
  }, [phase, flights]);

  const close = useCallback(() => {
    if (phase !== "open") return;
    if (prefersReducedMotion()) {
      setPhase("closed");
      buttonRef.current?.focus({ preventScroll: true });
      return;
    }
    setPhase("closing");
    Promise.all(flights("back").map((animation) => animation.finished))
      .catch(() => {})
      .finally(() => {
        setPhase("closed");
        buttonRef.current?.focus({ preventScroll: true });
      });
  }, [phase, flights]);

  // The page behind the table stays put while the table is up.
  useEffect(() => {
    if (phase === "closed") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, close]);

  const choose = (item: WorkTableItem) => {
    if (item === current) {
      close();
      return;
    }
    setPhase("closed");
    router.push(item.href);
  };

  // Only the pages the table can point back to carry it.
  if (!current) return null;

  const table = phase !== "closed";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="wt-collection"
        aria-label="Show all work"
        aria-haspopup="dialog"
        aria-expanded={table}
        onClick={() => setPhase("open")}
      >
        <span className="wt-collection-objects" aria-hidden="true" data-hidden={table || undefined}>
          {pile.map((item, slot) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.id}
              ref={(node) => {
                if (node) pileImgs.current.set(item.id, node);
                else pileImgs.current.delete(item.id);
              }}
              src={item.image.src}
              width={item.image.width}
              height={item.image.height}
              alt=""
              decoding="async"
              style={{ "--slot": slot, "--turn": `${(slot - 2) * PILE_TURN}deg` } as CSSProperties}
            />
          ))}
        </span>
        <span>My work</span>
      </button>

      {table ? (
        <div className="wt-table" role="dialog" aria-modal="true" aria-label="My work" data-phase={phase}>
          <div className="wt-canvas">
            <p className="wt-identity">Vaibhav Arora</p>
            <nav className="wt-objects" aria-label="My work">
              {workTable.map((item, index) => {
                const spot = SPOTS[index];
                if (!spot) return null;
                return (
                  <button
                    key={item.id}
                    ref={index === 0 ? firstObjectRef : undefined}
                    type="button"
                    className="wt-object"
                    aria-pressed={item === current}
                    aria-label={item === current ? `${item.label}, this page` : `Open ${item.label}`}
                    onClick={() => choose(item)}
                    style={{
                      left: `${spot.left}%`,
                      top: `${spot.top}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`,
                      transform: `rotate(${spot.turn}deg)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={(node) => {
                        if (node) tableImgs.current.set(item.id, node);
                        else tableImgs.current.delete(item.id);
                      }}
                      src={item.image.src}
                      width={item.image.width}
                      height={item.image.height}
                      alt=""
                      decoding="async"
                      data-current={item === current || undefined}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <button type="button" className="wt-return" onClick={close}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
