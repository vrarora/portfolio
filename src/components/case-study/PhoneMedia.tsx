"use client";

import { useEffect, useRef } from "react";

import { PhoneFrame } from "@/components/equalall/chrome/PhoneFrame";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { useScrollRoot } from "./ScrollRootContext";

type Props = {
  src: string;
  poster: string;
  /** Playback rates to cycle through on each loop, e.g. [1, 0.5]. */
  speeds?: number[];
  alt?: string;
};

/** A muted looping video inside the phone frame. Pauses off-screen, poster under reduced motion. */
export function PhoneMedia({ src, poster, speeds = [1], alt = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const root = useScrollRoot();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    let index = 0;
    const onEnded = () => {
      index = (index + 1) % speeds.length;
      video.playbackRate = speeds[index];
      void video.play();
    };
    video.addEventListener("ended", onEnded);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { root: root?.current ?? null, threshold: 0.2 },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      video.removeEventListener("ended", onEnded);
    };
  }, [reduced, speeds, root]);

  return (
    <div className="cs-phone">
      <PhoneFrame>
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={alt} />
        ) : (
          <video ref={ref} src={src} poster={poster} muted playsInline preload="metadata" aria-label={alt} />
        )}
      </PhoneFrame>
    </div>
  );
}
