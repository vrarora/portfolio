"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { cue } from "@/components/audio/cues";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      cue("chime");
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button type="button" className="home-btn" onClick={copy} aria-live="polite">
      {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="regular" />}
      <span>{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
