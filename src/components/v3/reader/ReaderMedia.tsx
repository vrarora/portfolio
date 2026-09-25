"use client";

import { useEffect, useRef } from "react";

import type { CaseStudyMedia } from "@/content/case-studies";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";

const isVideo = (src: string) => /\.(mp4|webm)$/i.test(src);

/**
 * A product recording inside a reader figure. Video loops muted and pauses
 * off-screen; a GIF cannot pause, so it loads lazily instead. Under reduced
 * motion both show the poster.
 */
export function ReaderMedia({ media, className = "rd-media" }: { media: CaseStudyMedia; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const video = isVideo(media.src);

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void element.play().catch(() => {});
        else element.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(element);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced || !video) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={className} src={reduced ? media.poster : media.src} alt={media.alt} loading="lazy" decoding="async" />
    );
  }

  return (
    <video
      ref={ref}
      className={className}
      src={media.src}
      poster={media.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={media.alt}
    />
  );
}
