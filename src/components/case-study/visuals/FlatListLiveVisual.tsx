"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_W = 1040;
const FRAME_H = 680;
const SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/mockups/data-compass/flat-list/`;

/**
 * The flat-list mockup page at desktop size, scaled down to the figure width.
 * It is a picture in the story, so it takes no pointer input.
 */
export default function FlatListLiveVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const scale = width / FRAME_W;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    setWidth(wrap.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", aspectRatio: `${FRAME_W} / ${FRAME_H}`, overflow: "hidden" }}>
      {width > 0 ? (
        <iframe
          src={SRC}
          title="Explore as a flat list"
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: FRAME_W,
            height: FRAME_H,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
