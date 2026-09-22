"use client";

import { bind } from "cuelume";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useSky } from "@/components/effects/SkyProvider";
import { Ambient, moodForHour } from "./ambient";
import { audioPrefs } from "./audioPrefs";
import { cue, setCuesEnabled, setCuesUnderMusic } from "./cues";

type AudioContextValue = {
  soundsOn: boolean;
  setSoundsOn: (on: boolean) => void;
  musicPlaying: boolean;
  /** True when the visitor had music on in a previous visit and it is not playing yet. */
  musicWanted: boolean;
  toggleMusic: () => void;
};

const Ctx = createContext<AudioContextValue>({
  soundsOn: false,
  setSoundsOn: () => {},
  musicPlaying: false,
  musicWanted: false,
  toggleMusic: () => {},
});

export function useAudio() {
  return useContext(Ctx);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const { state } = useSky();
  const [soundsOn, setSoundsState] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicWanted, setMusicWanted] = useState(false);
  const ambient = useRef<Ambient | null>(null);
  const mutedByHide = useRef(false);

  useEffect(() => {
    const on = audioPrefs.soundsEnabled();
    setSoundsState(on);
    setCuesEnabled(on);
    setMusicWanted(audioPrefs.ambientWanted());
    bind();
  }, []);

  useEffect(() => {
    ambient.current?.setMood(moodForHour(state.hour));
  }, [state.hour]);

  useEffect(() => {
    setCuesUnderMusic(musicPlaying);
  }, [musicPlaying]);

  const setSoundsOn = useCallback((on: boolean) => {
    setSoundsState(on);
    audioPrefs.setSoundsEnabled(on);
    setCuesEnabled(on);
    if (on) {
      cue("arrival");
      window.setTimeout(() => cue("toggle"), 220);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (!ambient.current) ambient.current = new Ambient();
    if (musicPlaying) {
      ambient.current.stop();
      setMusicPlaying(false);
      audioPrefs.setAmbientWanted(false);
      setMusicWanted(false);
      return;
    }
    void ambient.current.start(moodForHour(state.hour));
    setMusicPlaying(true);
    audioPrefs.setAmbientWanted(true);
    setMusicWanted(false);
  }, [musicPlaying, state.hour]);

  // Pause on hide, mute both with Shift+M.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && musicPlaying) {
        ambient.current?.stop();
        setMusicPlaying(false);
        mutedByHide.current = true;
        setMusicWanted(true);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "m" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        if (musicPlaying) toggleMusic();
        if (soundsOn) setSoundsOn(false);
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pagehide", onHide);
    };
  }, [musicPlaying, soundsOn, toggleMusic, setSoundsOn]);

  const value = useMemo(
    () => ({ soundsOn, setSoundsOn, musicPlaying, musicWanted, toggleMusic }),
    [soundsOn, setSoundsOn, musicPlaying, musicWanted, toggleMusic],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
