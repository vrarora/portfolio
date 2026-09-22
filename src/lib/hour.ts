import { useEffect, useState } from "react";

export type SkyStop = "night" | "dawn" | "day" | "golden" | "dusk";

export type SkyPalette = {
  zenith: string;
  mid: string;
  horizon: string;
  ink: string;
  stars: number;
};

export const SKY_STOPS: Record<SkyStop, SkyPalette> = {
  night: { zenith: "#0b0f1a", mid: "#141a26", horizon: "#252e3e", ink: "rgba(255,255,255,.86)", stars: 1 },
  dawn: { zenith: "#6c7fa6", mid: "#c9b3bd", horizon: "#f3d6b4", ink: "#1e1b22", stars: 0.15 },
  day: { zenith: "#7fa6d6", mid: "#b7cde8", horizon: "#e4edf4", ink: "#14243a", stars: 0 },
  golden: { zenith: "#8493b8", mid: "#ddb58b", horizon: "#f5d9a6", ink: "#2a2016", stars: 0 },
  dusk: { zenith: "#2b3358", mid: "#6a5a86", horizon: "#c67e6c", ink: "rgba(255,255,255,.88)", stars: 0.35 },
};

/** Keyframes as fractional local hours. Step 8 interpolates between them. */
export const SKY_KEYFRAMES: Array<{ hour: number; stop: SkyStop }> = [
  { hour: 4.75, stop: "night" },
  { hour: 6.25, stop: "dawn" },
  { hour: 8.75, stop: "day" },
  { hour: 15.75, stop: "day" },
  { hour: 17.5, stop: "golden" },
  { hour: 19.25, stop: "dusk" },
  { hour: 21.25, stop: "night" },
];

export function fractionalHour(date = new Date()) {
  return date.getHours() + date.getMinutes() / 60;
}

/** Nearest keyframe for a given fractional hour. */
export function nearestSkyStop(hour: number): SkyStop {
  let best = SKY_KEYFRAMES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const frame of SKY_KEYFRAMES) {
    const raw = Math.abs(frame.hour - hour);
    const dist = Math.min(raw, 24 - raw);
    if (dist < bestDist) {
      bestDist = dist;
      best = frame;
    }
  }
  return best.stop;
}

/** Local fractional hour, refreshed every minute. Null until mounted. */
export function useLocalHour(intervalMs = 60_000) {
  const [hour, setHour] = useState<number | null>(null);
  useEffect(() => {
    setHour(fractionalHour());
    const id = window.setInterval(() => setHour(fractionalHour()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return hour;
}
