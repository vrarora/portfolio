"use client";

import { SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react";

import { useAudio } from "@/components/audio/AudioProvider";

/** Turns the click sounds on and off; the choice is remembered. */
export function SoundToggle() {
  const { soundsOn, setSoundsOn } = useAudio();
  const Icon = soundsOn ? SpeakerSimpleHigh : SpeakerSimpleSlash;

  return (
    <button
      type="button"
      className="v3-sound"
      data-click-sound="off"
      aria-pressed={soundsOn}
      aria-label={soundsOn ? "Turn sounds off" : "Turn sounds on"}
      onClick={() => setSoundsOn(!soundsOn)}
    >
      <Icon size={14} weight="fill" aria-hidden="true" />
    </button>
  );
}
