"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { cue } from "@/components/audio/cues";

const RESET_AFTER = 1600;

/** Copies a value to the clipboard and confirms in place for a moment. */
export function CopyButton({ value, fallbackHref }: { value: string; fallbackHref: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      window.location.href = fallbackHref;
      return;
    }
    cue("chime");
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), RESET_AFTER);
  };

  return (
    <button type="button" className="hc-copy" data-click-sound="off" onClick={copy}>
      {copied ? <Check size={13} weight="bold" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
