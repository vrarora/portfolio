"use client";

import { useEffect, useState } from "react";

import { assistantCopy } from "@/content/assistant-faq";
import type { AskNote } from "./types";

function formatRemaining(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.ceil(s / 60);
  return m < 60 ? `${m} min` : `${Math.ceil(m / 60)} h`;
}

export function FallbackNotice({ note }: { note: AskNote }) {
  const retryAt = "retryAt" in note ? note.retryAt : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (retryAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [retryAt]);

  let text: string;
  switch (note.kind) {
    case "rate_limited":
      text = `${assistantCopy.rateLimited} Try a live question again in ${formatRemaining(note.retryAt - now)}.`;
      break;
    case "paused":
      text = `${assistantCopy.quotaExhausted} Live answers return in ${formatRemaining(note.retryAt - now)}.`;
      break;
    case "offline":
      text = assistantCopy.offline;
      break;
    default:
      text = assistantCopy.genericError;
  }

  return (
    <p className="ask-notice t-caption" role="status">
      {text}
    </p>
  );
}
