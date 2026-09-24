"use client";

import { useEffect, useRef } from "react";

import { DESK_HEIGHT, DESK_WIDTH, drawDesk } from "./deskRiso";
import { RisoPrinter } from "./riso";

import "./desk.css";

/** A risograph film runs at a low frame rate; each frame is a fresh print. */
const FPS = 10;
/** Keeps the print's pixel count modest on dense screens. */
const MAX_DPR = 2;

/**
 * His corner of the world as a risograph print, drawn in code: four inks screened
 * into dots and overprinted on paper. It prints a new frame ten times a second
 * while on screen, and holds a single print for reduced motion.
 */
export function DeskScene() {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    let printer: RisoPrinter;
    try {
      printer = new RisoPrinter(canvas, DESK_WIDTH, DESK_HEIGHT);
    } catch {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let timer = 0;
    let visible = false;

    const frame = () => {
      const t = reduced ? 0 : (performance.now() - started) / 1000;
      printer.print((plates) => drawDesk(plates, t), reduced ? 0 : t);
    };

    const size = () => {
      printer.resize(canvas.clientWidth, Math.min(window.devicePixelRatio || 1, MAX_DPR));
      frame();
    };

    const play = () => {
      if (timer || reduced) return;
      timer = window.setInterval(frame, 1000 / FPS);
    };
    const pause = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const ro = new ResizeObserver(size);
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(box);

    const onVisibility = () => (document.hidden ? pause() : visible && play());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ro.disconnect();
      io.disconnect();
      pause();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <figure ref={boxRef} className="ds">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A risograph print of Vaibhav at his desk at dusk, headphones on, facing a window over the rooftops of Bikaner. Chai steams beside a jar of sweets, three awards sit on the shelf, a plant leans in, and a dog sleeps on a cushion by his chair."
      />
    </figure>
  );
}
