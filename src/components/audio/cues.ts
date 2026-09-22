import { play, setEnabled, setVolume } from "cuelume";
import type { SoundName } from "cuelume";

export type Cue =
  | "tick" | "press" | "release" | "page" | "toggle" | "chime"
  | "success" | "error" | "loading" | "ready" | "sparkle" | "arrival";

const MAP: Record<Cue, SoundName> = {
  tick: "tick",
  press: "press",
  release: "release",
  page: "page",
  toggle: "toggle",
  chime: "chime",
  success: "success",
  error: "error",
  loading: "loading",
  ready: "ready",
  sparkle: "sparkle",
  arrival: "arrival",
};

let enabled = false;
let lastHover = 0;

/** Plays a UI cue when sounds are on. Hover ticks are limited to one per 80ms. */
export function cue(name: Cue) {
  if (!enabled || typeof window === "undefined") return;
  if (name === "tick") {
    const now = performance.now();
    if (now - lastHover < 80) return;
    lastHover = now;
    if (!window.matchMedia("(hover: hover)").matches) return;
  }
  play(MAP[name]);
}

export function setCuesEnabled(value: boolean) {
  enabled = value;
  setEnabled(value);
}

/** Cues sit under the music while it plays. */
export function setCuesUnderMusic(musicPlaying: boolean) {
  setVolume(musicPlaying ? 0.35 : 0.5);
}
