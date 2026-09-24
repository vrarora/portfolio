"use client";

import Image from "next/image";
import { useState, type CSSProperties, type KeyboardEvent } from "react";

import { cue } from "@/components/audio/cues";
import { LOGOS, type LogoId } from "@/content/home";

/**
 * Company marks stacked like tiles inside the sentence. Each press brings the
 * tile at the back to the front, so the stack cycles through every company.
 */
export function LogoStack({ ids }: { ids: readonly LogoId[] }) {
  const [front, setFront] = useState(0);
  const [flips, setFlips] = useState(0);

  const next = () => {
    cue("page");
    setFront((i) => (i + 1) % ids.length);
    setFlips((n) => n + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      next();
    }
  };

  const active = LOGOS[ids[front]];

  return (
    <span
      className="st-stack"
      role="button"
      tabIndex={0}
      aria-label={`${active.alt}. Press to see the next company.`}
      data-word
      data-click-sound="off"
      data-company={active.alt}
      onClick={next}
      onKeyDown={onKeyDown}
    >
      {ids.map((id, i) => {
        // 0 is the front tile, then each one further back.
        const depth = (i - front + ids.length) % ids.length;
        return (
          <span
            key={id}
            className="st-tile"
            style={{ "--tint": LOGOS[id].tint } as CSSProperties}
            data-depth={depth}
            data-flip={depth === 0 && flips > 0 ? flips % 2 : undefined}
          >
            <Image src={LOGOS[id].src} alt="" width={96} height={96} sizes="48px" />
          </span>
        );
      })}
    </span>
  );
}
