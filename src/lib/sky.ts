import { SKY_KEYFRAMES, SKY_STOPS } from "./hour";
import type { SkyPalette, SkyStop } from "./hour";

export type Oklch = { l: number; c: number; h: number };
export type Rgb = { r: number; g: number; b: number };

/* ---- colour math ------------------------------------------------------- */

export function hexToRgb(hex: string): Rgb {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((ch) => ch + ch).join("") : v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toLinear(c: number) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function toSrgb(x: number) {
  const v = x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(a, bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

export function oklchToRgb({ l: L, c, h }: Oklch): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const bb = c * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bb;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bb;
  const s_ = L - 0.0894841775 * a - 1.291485548 * bb;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return {
    r: toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Mixes two hex colours in OKLCH, hue along the shorter arc. */
export function mixOklch(from: string, to: string, t: number) {
  const a = rgbToOklch(hexToRgb(from));
  const b = rgbToOklch(hexToRgb(to));
  // Achromatic colours carry no hue; borrow the other side's.
  const ha = a.c < 0.002 ? b.h : a.h;
  const hb = b.c < 0.002 ? a.h : b.h;
  let dh = hb - ha;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return rgbToHex(
    oklchToRgb({
      l: a.l + (b.l - a.l) * t,
      c: a.c + (b.c - a.c) * t,
      h: (ha + dh * t + 360) % 360,
    }),
  );
}

/* ---- palette by hour --------------------------------------------------- */

const LIGHT_INK = "rgba(255,255,255,.87)";

export type SkyState = SkyPalette & {
  /** Fractional hour this palette represents. */
  hour: number;
  /** 0 to 1 how much of the night keyframe is in the mix. */
  night: number;
  /** Sun position in unit sky space, y up; y <= 0 is below the horizon. */
  sun: { x: number; y: number };
  moon: boolean;
};

function frameWeights(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const frames = SKY_KEYFRAMES;
  for (let i = 0; i < frames.length; i++) {
    const a = frames[i];
    const b = frames[(i + 1) % frames.length];
    const span = i === frames.length - 1 ? 24 - a.hour + b.hour : b.hour - a.hour;
    const from = a.hour;
    let dist = h - from;
    if (i === frames.length - 1 && h < from) dist += 24;
    if (dist >= 0 && dist <= span) return { a: a.stop, b: b.stop, t: span === 0 ? 0 : dist / span };
  }
  return { a: frames[0].stop, b: frames[0].stop, t: 0 };
}

export function mixPalettes(a: SkyPalette, b: SkyPalette, t: number): SkyPalette {
  const mid = mixOklch(a.mid, b.mid, t);
  const midL = rgbToOklch(hexToRgb(mid)).l;
  return {
    zenith: mixOklch(a.zenith, b.zenith, t),
    mid,
    horizon: mixOklch(a.horizon, b.horizon, t),
    ink: midL < 0.55 ? LIGHT_INK : t < 0.5 ? a.ink : b.ink,
    stars: a.stars + (b.stars - a.stars) * t,
  };
}

export function skyAt(hour: number): SkyState {
  const { a, b, t } = frameWeights(hour);
  const palette = mixPalettes(SKY_STOPS[a], SKY_STOPS[b], t);
  const nightA = a === "night" ? 1 : 0;
  const nightB = b === "night" ? 1 : 0;
  const night = nightA + (nightB - nightA) * t;
  const sunY = Math.sin((Math.PI * (hour - 6)) / 12);
  return {
    ...palette,
    hour,
    night,
    sun: { x: 0.2 + (0.6 * (hour - 6)) / 12, y: sunY },
    moon: night > 0.5,
  };
}

/** Representative hour for each stop, used by the preview dial. */
export const STOP_HOURS: Record<SkyStop, number> = {
  dawn: 6.25,
  day: 12,
  golden: 17.5,
  dusk: 19.25,
  night: 1,
};

export function applySkyVars(state: SkyPalette, target: HTMLElement = document.documentElement) {
  const s = target.style;
  s.setProperty("--sky-zenith", state.zenith);
  s.setProperty("--sky-mid", state.mid);
  s.setProperty("--sky-horizon", state.horizon);
  s.setProperty("--sky-ink", state.ink);
  s.setProperty("--sky-stars", state.stars.toFixed(3));
}
