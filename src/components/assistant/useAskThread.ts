"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useConvexGate } from "@/components/providers/ConvexClientProvider";
import { assistantCopy, assistantFaq } from "@/content/assistant-faq";
import { getVisitorId } from "@/lib/visitor";
import { joinAnswer } from "@/shared/assistantOutput";
import { pickFallback } from "@/shared/pickFallback";
import type { AskItem, AskNote } from "./types";

const THREAD_KEY = "vp.ask.thread";

let counter = 0;
const localId = () => `local-${Date.now()}-${counter++}`;

function readThreadId() {
  try {
    return window.sessionStorage.getItem(THREAD_KEY);
  } catch {
    return null;
  }
}

function writeThreadId(id: string | null) {
  try {
    if (id) window.sessionStorage.setItem(THREAD_KEY, id);
    else window.sessionStorage.removeItem(THREAD_KEY);
  } catch {
    /* private mode */
  }
}

/**
 * Local half of the thread: chip answers, fallbacks and notices that never
 * touch the network. The Convex half (AskThread) merges its messages in.
 */
export function useAskThread(open: boolean) {
  const gate = useConvexGate();
  const [localItems, setLocalItems] = useState<AskItem[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const visitorId = useRef("");

  useEffect(() => {
    visitorId.current = getVisitorId();
    setThreadId(readThreadId());
  }, []);

  // Connect lazily, only once the panel opens.
  useEffect(() => {
    if (open && gate.configured && !gate.ready) gate.connect();
  }, [open, gate]);

  const push = useCallback((items: AskItem[]) => setLocalItems((prev) => [...prev, ...items]), []);

  /** Answers a curated chip with zero network. */
  const askChip = useCallback(
    (faqId: string) => {
      const faq = assistantFaq.find((f) => f.id === faqId);
      if (!faq) return;
      const now = Date.now();
      push([
        { id: localId(), role: "user", text: faq.question, status: "done", source: "local", createdAt: now },
        {
          id: localId(),
          role: "assistant",
          text: joinAnswer(faq.answer, faq.followUps),
          status: "done",
          source: "local",
          createdAt: now + 1,
        },
      ]);
    },
    [push],
  );

  /** Records a question and a curated stand-in answer, with a notice. */
  const answerLocally = useCallback(
    (question: string, note: AskNote) => {
      const picked = pickFallback(question);
      const now = Date.now();
      push([
        { id: localId(), role: "user", text: question, status: "done", source: "local", createdAt: now },
        {
          id: localId(),
          role: "assistant",
          text: joinAnswer(picked.answer, picked.followUps),
          status: "done",
          source: "local",
          createdAt: now + 1,
          note,
        },
      ]);
    },
    [push],
  );

  const adoptThread = useCallback((id: string | null) => {
    setThreadId(id);
    writeThreadId(id);
  }, []);

  const reset = useCallback(() => {
    setLocalItems([]);
    adoptThread(null);
  }, [adoptThread]);

  const welcome = useMemo<AskItem>(
    () => ({ id: "welcome", role: "assistant", text: assistantCopy.welcome, status: "done", source: "local", createdAt: 0 }),
    [],
  );

  return {
    gate,
    visitorId,
    threadId,
    adoptThread,
    localItems,
    welcome,
    askChip,
    answerLocally,
    reset,
  };
}
