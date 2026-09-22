"use client";

import { useAudio } from "./AudioProvider";
import { cue } from "./cues";

import "./audio.css";

export function MusicPill() {
  const { musicPlaying, musicWanted, toggleMusic } = useAudio();
  const label = musicPlaying ? "playing" : musicWanted ? "resume" : "listen";
  return (
    <button
      type="button"
      className="audio-pill"
      data-playing={musicPlaying ? "" : undefined}
      data-wanted={musicWanted ? "" : undefined}
      aria-pressed={musicPlaying}
      aria-label={musicPlaying ? "Pause ambient music" : "Play ambient music"}
      onClick={() => {
        cue("toggle");
        toggleMusic();
      }}
      data-fixed-control
    >
      <span className="audio-disc" aria-hidden="true" />
      <span className="audio-pill-label">{label}</span>
    </button>
  );
}
