"use client";

import { CloudSun, Moon, MoonStars, Sun, SunHorizon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";

import { cue } from "@/components/audio/cues";
import { nearestSkyStop } from "@/lib/hour";
import type { SkyStop } from "@/lib/hour";
import { useSky } from "./SkyProvider";

const ORDER: Array<SkyStop | null> = [null, "dawn", "day", "golden", "dusk", "night"];

const ICONS: Record<SkyStop, typeof Sun> = {
  dawn: SunHorizon,
  day: Sun,
  golden: CloudSun,
  dusk: MoonStars,
  night: Moon,
};

const LABELS: Record<SkyStop, string> = {
  dawn: "Dawn",
  day: "Day",
  golden: "Golden hour",
  dusk: "Dusk",
  night: "Night",
};

/** Cycles the footer sky through its hour stops. Live time is the first position. */
export function SkyDial() {
  const { preview, setPreview, liveHour } = useSky();
  const [showLabel, setShowLabel] = useState(false);

  const liveStop = liveHour === null ? "day" : nearestSkyStop(liveHour);
  const shown: SkyStop = preview ?? liveStop;
  const Icon = ICONS[shown];
  const label = preview ? `${LABELS[preview]} preview` : `Live, ${LABELS[liveStop].toLowerCase()}`;

  useEffect(() => {
    if (!preview) {
      setShowLabel(false);
      return;
    }
    setShowLabel(true);
    const id = window.setTimeout(() => setShowLabel(false), 1600);
    return () => window.clearTimeout(id);
  }, [preview]);

  const step = (dir: 1 | -1) => {
    cue("toggle");
    const index = ORDER.indexOf(preview);
    const next = ORDER[(index + dir + ORDER.length) % ORDER.length];
    setPreview(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setPreview(null);
    }
  };

  return (
    <div className="fx-dial-wrap">
      <button
        type="button"
        className="fx-dial"
        onClick={() => step(1)}
        onKeyDown={onKeyDown}
        aria-label={`Sky: ${label}. Press to preview the next hour.`}
        data-fixed-control
      >
        <Icon size={16} weight="regular" />
      </button>
      <span className={`fx-dial-label t-caption${showLabel ? " is-shown" : ""}`} aria-live="polite">
        {preview ? LABELS[preview] : ""}
      </span>
    </div>
  );
}
