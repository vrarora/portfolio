"use client";

import { CloudSun, Moon, MoonStars, Sun, SunHorizon } from "@phosphor-icons/react";
import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { cue } from "@/components/audio/cues";
import { useSky } from "@/components/effects/SkyProvider";
import { nearestSkyStop, type SkyStop } from "@/lib/hour";

const STOPS: readonly SkyStop[] = ["dawn", "day", "golden", "dusk", "night"];

const ICONS: Record<SkyStop, typeof Sun> = { dawn: SunHorizon, day: Sun, golden: CloudSun, dusk: MoonStars, night: Moon };

const LABELS: Record<SkyStop, string> = { dawn: "Dawn", day: "Day", golden: "Golden hour", dusk: "Dusk", night: "Night" };

/**
 * A small slider for the footer sky. Each tick is an hour of the day; the icon
 * returns to the live sky. Drag, click a tick, or use the arrow keys.
 */
export function SkyScrub() {
  const { preview, setPreview, liveHour } = useSky();
  const trackRef = useRef<HTMLDivElement>(null);

  const liveStop = liveHour === null ? "day" : nearestSkyStop(liveHour);
  const shown = preview ?? liveStop;
  const index = STOPS.indexOf(shown);
  const Icon = ICONS[shown];

  const choose = (stop: SkyStop | null) => {
    if (stop === preview) return;
    cue("tick");
    setPreview(stop);
  };

  const stopAt = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    choose(STOPS[Math.round(t * (STOPS.length - 1))]);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    stopAt(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) stopAt(event.clientX);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
    if (step) {
      event.preventDefault();
      choose(STOPS[Math.min(STOPS.length - 1, Math.max(0, index + step))]);
    } else if (event.key === "Home") {
      event.preventDefault();
      choose(null);
    }
  };

  return (
    <div className="ss">
      <button type="button" className="ss-live" onClick={() => choose(null)} aria-label={preview ? "Back to the live sky" : `Live sky, ${LABELS[liveStop].toLowerCase()}`}>
        <Icon size={15} weight="fill" aria-hidden="true" />
        {preview ? null : <span className="ss-live-dot" aria-hidden="true" />}
      </button>
      <div
        ref={trackRef}
        className="ss-track"
        role="slider"
        tabIndex={0}
        aria-label="Sky hour"
        aria-valuemin={0}
        aria-valuemax={STOPS.length - 1}
        aria-valuenow={index}
        aria-valuetext={preview ? `${LABELS[shown]} preview` : `Live, ${LABELS[shown].toLowerCase()}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        {STOPS.map((stop, i) => (
          <span key={stop} className="ss-tick" data-active={i === index ? "" : undefined} />
        ))}
      </div>
    </div>
  );
}
