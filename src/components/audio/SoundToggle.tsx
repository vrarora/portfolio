"use client";

import { SpeakerSimpleLow, SpeakerSimpleSlash } from "@phosphor-icons/react";

import { useAudio } from "./AudioProvider";

import "./audio.css";

export function SoundToggle() {
  const { soundsOn, setSoundsOn } = useAudio();
  const Icon = soundsOn ? SpeakerSimpleLow : SpeakerSimpleSlash;
  return (
    <button
      type="button"
      className="audio-toggle"
      aria-pressed={soundsOn}
      aria-label={soundsOn ? "Turn UI sounds off" : "Turn UI sounds on"}
      onClick={() => setSoundsOn(!soundsOn)}
      data-fixed-control
    >
      <Icon size={15} weight="regular" />
    </button>
  );
}
