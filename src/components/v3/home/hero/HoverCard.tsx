"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type TriggerProps = {
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  onClick?: () => void;
};

const OPEN_DELAY = 90;
const CLOSE_DELAY = 140;

/**
 * A dark card that opens under its trigger on hover or keyboard focus, and on
 * tap for touch. The pointer can travel from the trigger into the card, so a
 * link inside the card stays reachable.
 */
export function HoverCard({
  trigger,
  children,
  align = "center",
  tapToggle = false,
  interactive = false,
  label,
  className = "",
}: {
  trigger: (props: TriggerProps) => ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  /** Buttons toggle the card on tap; links keep their own click. */
  tapToggle?: boolean;
  /** The card holds its own link, so it is a labelled group instead of a tooltip. */
  interactive?: boolean;
  label?: string;
  className?: string;
}) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);
  const [open, setOpen] = useState(false);
  // The card's contents mount on first use, so clocks and previews cost nothing until wanted.
  const [armed, setArmed] = useState(false);

  const schedule = (next: boolean) => {
    if (next) setArmed(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? OPEN_DELAY : CLOSE_DELAY);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span
      ref={wrapRef}
      className="hc"
      onPointerEnter={(event) => event.pointerType === "mouse" && schedule(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && schedule(false)}
      onFocus={() => schedule(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget as Node) && schedule(false)}
    >
      {trigger({
        ...(interactive ? {} : { "aria-describedby": id }),
        ...(tapToggle
          ? {
              "aria-expanded": open,
              onClick: () => {
                setArmed(true);
                setOpen((value) => !value);
              },
            }
          : {}),
      })}
      <span
        id={id}
        role={interactive ? "group" : "tooltip"}
        aria-label={interactive ? label : undefined}
        className={`hc-card hc-card--${align} ${className}`} data-open={open ? "" : undefined}
      >
        {armed ? children : null}
      </span>
    </span>
  );
}
