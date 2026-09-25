"use client";

import { ArrowDown, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { clamp01 } from "@/components/story/engine/math";
import { routes } from "@/lib/routes";

import { CHROME, SNAP_H, SNAP_W, type Anchors } from "./kit";
import { STORIES, type StoryId } from "./stories";
import { INK, InkDrawing } from "./ink";
import { cameraAt, compile, progressOf, snapOpacities, type Ink } from "./timeline";
import "./board.css";

const snapSrc = (snap: string) => (snap.startsWith("/") ? snap : `/atlas-snapshots/${snap}/`);

/** Restores the scroll positions a snapshot recorded when it was captured. */
function restoreScroll(frame: HTMLIFrameElement) {
  const doc = frame.contentDocument;
  if (!doc) return;
  for (const el of doc.querySelectorAll<HTMLElement>("[data-snap-scroll-top], [data-snap-scroll-left]")) {
    el.scrollTop = Number(el.dataset.snapScrollTop ?? 0);
    el.scrollLeft = Number(el.dataset.snapScrollLeft ?? 0);
  }
}

/** Px of scroll over which the scroll hint fades out. */
const HINT_FADE = 240;

type Props = { story: StoryId; anchors: Anchors; readHref: string };

export function Board({ story, anchors, readHref }: Props) {
  const { name, pace } = STORIES[story];
  const compiled = useMemo(() => compile(STORIES[story].build(anchors)), [story, anchors]);
  const { script } = compiled;

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const nibRef = useRef<SVGSVGElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^\w-]/g, "");

  // Snapshots load after hydration, so phones that switch to the reader never fetch them
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    const nib = nibRef.current;
    const hint = hintRef.current;
    if (!track || !stage || !world || !nib || !hint) return;

    // Cache each drawing's paths and lengths once, so a frame only writes styles

    const drawings = script.drawings.map((d) => {
      const group = world.querySelector<SVGGElement>(`[data-drawing="${d.id}"]`)!;
      const letters = group.querySelector<SVGPathElement>("[data-letters]");
      const paths = [...group.querySelectorAll<SVGPathElement>("[data-pen]")].map((el) => {
        const len = el.getTotalLength();
        el.style.strokeDasharray = `${len} ${len}`;
        return { el, len };
      });
      return { d, group, letters, paths, total: paths.reduce((s, p) => s + p.len, 0), span: compiled.draw.get(d.id) };
    });

    const frames = script.frames.map((f) => ({
      f,
      el: world.querySelector<HTMLElement>(`[data-frame="${f.id}"]`)!,
      layers: [...world.querySelectorAll<HTMLElement>(`[data-frame="${f.id}"] [data-snap]`)],
    }));

    let target = 0;
    let current = -1;
    let raf = 0;

    const readScroll = () => {
      const top = track.getBoundingClientRect().top;
      target = clamp01(-top / Math.max(1, track.offsetHeight - window.innerHeight));
    };

    const render = (t: number) => {
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;

      // The scroll hint fades out over the first stretch of scroll and returns at the top

      const hintAlpha = 1 - clamp01((t * Math.max(1, track.offsetHeight - window.innerHeight)) / HINT_FADE);
      hint.style.opacity = hintAlpha.toFixed(3);
      hint.style.visibility = hintAlpha > 0 ? "visible" : "hidden";

      const cam = cameraAt(compiled, t);
      const scale = Math.min(vw / cam.w, vh / cam.h);
      const tx = vw / 2 - (cam.x + cam.w / 2) * scale;
      const ty = vh / 2 - (cam.y + cam.h / 2) * scale;
      world.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

      const snapAlpha = new Map<string, number[]>();
      for (const { f, el, layers } of frames) {
        const alphas = snapOpacities(compiled, f.id, f.snaps.length, t);
        snapAlpha.set(f.id, alphas);
        const enter = compiled.shows.find((s) => s.frame === f.id);
        const entered = enter ? progressOf(t, enter.span) : 0;
        el.style.opacity = entered.toFixed(3);
        el.style.visibility = entered > 0 ? "visible" : "hidden";
        el.style.transform = `translateY(${((1 - entered) * 40).toFixed(1)}px)`;
        layers.forEach((layer, i) => {
          layer.style.opacity = alphas[i].toFixed(3);
          layer.style.visibility = alphas[i] > 0 ? "visible" : "hidden";
        });
      }

      let tip: { x: number; y: number; ink: Ink } | null = null;
      for (const { d, group, letters, paths, total, span } of drawings) {
        const p = span ? progressOf(t, span) : 1;

        // Letters show through the pen's mask while it writes, then drop the mask once done

        if (letters) {
          letters.style.visibility = p > 0 ? "visible" : "hidden";
          letters.style.mask = p >= 1 ? "none" : "";
        }
        let remaining = p * total;
        for (const path of paths) {
          const drawn = Math.min(path.len, Math.max(0, remaining));
          remaining -= path.len;
          path.el.style.visibility = drawn > 0 ? "visible" : "hidden";
          path.el.style.strokeDashoffset = String(path.len - drawn);
          if (!tip && p > 0 && p < 1 && drawn > 0 && drawn < path.len) {
            const pt = path.el.getPointAtLength(drawn);
            const at = d.at ?? { x: 0, y: 0, scale: 1 };
            tip = { x: at.x + pt.x * at.scale, y: at.y + pt.y * at.scale, ink: d.ink };
          }
        }
        group.style.opacity = d.layer ? (snapAlpha.get(d.layer.frame)?.[d.layer.snap] ?? 0).toFixed(3) : "1";
      }

      if (tip) {
        nib.style.opacity = "1";
        nib.style.transform = `translate(${tip.x}px, ${tip.y - 40}px)`;
        nib.style.setProperty("--nib-ink", INK[tip.ink]);
      } else {
        nib.style.opacity = "0";
      }
    };

    // Scroll sets the target; the rendered time eases toward it so scrubbing stays smooth both ways

    const tick = () => {
      raf = 0;
      const next = current < 0 ? target : current + (target - current) * 0.16;
      current = Math.abs(target - next) < 0.00005 ? target : next;
      render(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      readScroll();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Dev hook for scripted checks: jump to a drawing's midpoint or any time

    if (process.env.NODE_ENV !== "production") {
      Object.assign(window, {
        __board: {
          spans: Object.fromEntries(compiled.draw),
          seek: (t: number) => {
            target = current = t;
            render(t);
          },
        },
      });
    }

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [compiled, script, live]);

  return (
    <div className="board" ref={trackRef} style={{ height: `${(compiled.units * pace * 100).toFixed(0)}vh` }}>
      <div className="board-stage" ref={stageRef}>
        <div className="board-world" ref={worldRef} style={{ width: script.world.w, height: script.world.h }}>
          {script.frames.map((f) =>
            f.kind === "art" ? (
              <div key={f.id} className="board-art" data-frame={f.id} style={{ left: f.x, top: f.y, width: f.w, height: f.h }}>
                {live && f.snaps.map((src, i) => <img key={src} data-snap={i} src={src} alt="" />)}
              </div>
            ) : (
            <div key={f.id} className="board-frame" data-frame={f.id} style={{ left: f.x, top: f.y, width: SNAP_W, height: SNAP_H + CHROME }}>
              <div className="board-frame-bar" style={{ height: CHROME }}>
                <i />
                <i />
                <i />
              </div>
              <div className="board-frame-body" style={{ height: SNAP_H }}>
                {live && f.snaps.map((snap, i) => (
                  <iframe
                    key={snap}
                    data-snap={i}
                    src={snapSrc(snap)}
                    title={`${name} screen ${i + 1}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    scrolling="no"
                    width={SNAP_W}
                    height={SNAP_H}
                    onLoad={(e) => restoreScroll(e.currentTarget)}
                  />
                ))}
              </div>
            </div>
            ),
          )}

          <svg className="board-ink" width={script.world.w} height={script.world.h} aria-hidden="true">
            {script.drawings.map((d, i) => (
              <InkDrawing key={d.id} drawing={d} maskId={`${uid}-ink-${i}`} data-drawing={d.id} />
            ))}
          </svg>

          <svg className="board-nib" ref={nibRef} viewBox="0 0 40 40" width={40} height={40} aria-hidden="true">
            <path d="M3 37 L8 25 L31 2 L38 9 L15 32 Z" className="board-nib-body" />
            <path d="M3 37 L8 25 L15 32 Z" className="board-nib-tip" />
          </svg>
        </div>

        <Link className="board-pill board-back" href={routes.home}>
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          Home
        </Link>
        <div className="board-pill board-hint" ref={hintRef}>
          <ArrowDown className="board-hint-arrow" size={14} weight="bold" aria-hidden="true" />
          Scroll to read
        </div>
        <a className="board-pill board-read" href={readHref}>
          Read instead
        </a>
      </div>
    </div>
  );
}
