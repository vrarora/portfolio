"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { StoryScene } from "./engine/scene";
import { AFTER_BEATS, LINES, STORY_LENGTH_VH, afterProgress, afterToStory } from "./engine/timeline";
import { constellationBox } from "./engine/constellation";
import { bump, clamp01, range } from "./engine/math";
import { Soundscape } from "./audio/soundscape";
import { StoryLines } from "./StoryLines";
import { storySerif } from "./fonts";
import "./story.css";

type LineRig = { el: HTMLElement; chars: HTMLElement[]; last: number[]; visible: boolean };

const CHAR_SOFTNESS = 8;
const MAX_DPR = 2;

/** The Work link lands where he sets out to meet the people he designs for. */
const WORK_AT = afterToStory(0.035);

/** Scroll offset of a story fraction, as a top position inside the track. */
const trackTop = (p: number) => `${p * (STORY_LENGTH_VH - 100)}vh`;

export function Story() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<SVGCircleElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const starsRef = useRef<HTMLAnchorElement>(null);
  const progressRef = useRef(0);
  const soundRef = useRef<Soundscape | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const linesEl = linesRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !linesEl || !ctx) return;

    const scene = new StoryScene(ctx);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rigs: LineRig[] = Array.from(linesEl.querySelectorAll<HTMLElement>(".story-line")).map((el) => {
      const chars = Array.from(el.querySelectorAll<HTMLElement>(".story-char"));
      return { el, chars, last: chars.map(() => -1), visible: false };
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(w, h);
      const link = starsRef.current;
      if (link) {
        const box = constellationBox(w, h);
        link.style.left = `${box.x + box.w / 2}px`;
        link.style.top = `${box.y + box.h + 28}px`;
      }
    };
    resize();

    const target = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? clamp01(window.scrollY / max) : 0;
    };
    progressRef.current = target();

    let frame = 0;
    let last = performance.now();
    const start = last;
    let lastSound = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const goal = target();
      progressRef.current = reduced.matches
        ? goal
        : progressRef.current + (goal - progressRef.current) * (1 - Math.exp(-dt * 5));
      const p = progressRef.current;

      scene.render(p, (now - start) / 1000, dt, reduced.matches);
      updateLines(rigs, p);
      updateMeter(p);
      updateStarsLink(p);

      if (soundRef.current && now - lastSound > 120) {
        soundRef.current.setProgress(p);
        lastSound = now;
      }
      frame = requestAnimationFrame(tick);
    };

    const updateMeter = (p: number) => {
      const a = Math.PI * (1 - p);
      sunRef.current?.setAttribute("cx", String(40 + Math.cos(a) * 30));
      sunRef.current?.setAttribute("cy", String(36 - Math.sin(a) * 30));
      meterRef.current?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
      if (hintRef.current) hintRef.current.style.opacity = String(1 - range(p, 0.004, 0.03));
    };

    let starsShown = false;
    const updateStarsLink = (p: number) => {
      const link = starsRef.current;
      if (!link) return;
      const [a, b, c, d] = AFTER_BEATS.starsLink;
      const o = bump(afterProgress(p), a, b, c, d);
      const shown = o > 0.02;
      if (shown !== starsShown) {
        link.style.visibility = shown ? "visible" : "hidden";
        starsShown = shown;
      }
      if (shown) link.style.opacity = o.toFixed(3);
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible") {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(resize);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => () => soundRef.current?.dispose(), []);

  const toggleSound = useCallback(async () => {
    if (soundOn) {
      setSoundOn(false);
      await soundRef.current?.stop();
      return;
    }
    soundRef.current ??= new Soundscape();
    soundRef.current.setProgress(progressRef.current, true);
    setSoundOn(true);
    await soundRef.current.start();
  }, [soundOn]);

  return (
    <div className={`story ${storySerif.variable}`}>
      <canvas ref={canvasRef} className="story-canvas" aria-hidden="true" />

      <header className="story-bar">
        <p className="story-name">Vaibhav Arora</p>
        <nav className="story-actions" aria-label="Site">
          <button
            type="button"
            className="story-sound"
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            onClick={toggleSound}
          >
            <span className="story-sound-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <a className="story-work" href="#work">
            Work
          </a>
        </nav>
      </header>

      <main className="story-main">
        <h1 className="story-sr">Vaibhav Arora, a story</h1>
        <StoryLines ref={linesRef} lines={LINES} />
        <Link ref={starsRef} className="story-stars" href="/playground/">
          Playground
        </Link>
      </main>

      <p ref={hintRef} className="story-hint">
        Scroll to walk
      </p>

      <div
        ref={meterRef}
        className="story-meter"
        role="progressbar"
        aria-label="How far along the story you are"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <svg viewBox="0 0 80 40" width="80" height="40" aria-hidden="true">
          <path d="M10 36 A30 30 0 0 1 70 36" className="story-meter-arc" />
          <line x1="4" y1="36" x2="76" y2="36" className="story-meter-horizon" />
          <circle ref={sunRef} cx="10" cy="36" r="3.2" className="story-meter-sun" />
        </svg>
      </div>

      <div className="story-track" style={{ height: `${STORY_LENGTH_VH}vh` }} aria-hidden="true">
        <span id="work" className="story-anchor" style={{ top: trackTop(WORK_AT) }} />
      </div>
    </div>
  );
}

/** Letters arrive in a soft wave and leave together, driven by scroll. */
function updateLines(rigs: LineRig[], p: number) {
  rigs.forEach((rig, i) => {
    const line = LINES[i];
    const t = range(p, line.start, line.end);
    const active = t > 0 && t < 1;
    if (!active) {
      if (rig.visible) {
        rig.el.style.visibility = "hidden";
        rig.chars.forEach((c) => (c.style.opacity = "0"));
        rig.last.fill(0);
        rig.visible = false;
      }
      return;
    }
    if (!rig.visible) {
      rig.el.style.visibility = "visible";
      rig.visible = true;
    }
    const appear = range(t, 0, 0.42);
    const leave = range(t, 0.8, 1);
    const n = rig.chars.length;
    for (let c = 0; c < n; c += 1) {
      const o = clamp01((appear * (n + CHAR_SOFTNESS) - c) / CHAR_SOFTNESS) * (1 - leave);
      const q = Math.round(o * 40) / 40;
      if (q === rig.last[c]) continue;
      rig.last[c] = q;
      const style = rig.chars[c].style;
      style.opacity = String(q);
      style.filter = q > 0.98 ? "none" : `blur(${((1 - q) * 5).toFixed(2)}px)`;
    }
  });
}
