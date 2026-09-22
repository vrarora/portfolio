"use client";

import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";

import { api } from "@convex/_generated/api";
import type { AskItem, AskNote } from "./types";

type SendResult =
  | { kind: "queued"; messageId: string }
  | { kind: "rate_limited"; retryAfter: number }
  | { kind: "paused"; until: number }
  | { kind: "invalid"; reason: string };

type Props = {
  threadId: string | null;
  visitorId: MutableRefObject<string>;
  adoptThread: (id: string | null) => void;
  answerLocally: (question: string, note: AskNote) => void;
  /** Receives the merged server items whenever they change. */
  onItems: (items: AskItem[]) => void;
  /** Exposes send and stop to the panel. */
  register: (api: { send: (text: string) => Promise<void>; stop: () => Promise<void> } | null) => void;
};

/**
 * The Convex-connected half of the thread. Renders nothing itself; it
 * subscribes to messages and reports them up so the panel can merge them
 * with local items. Mounted only once the client is connected.
 */
export function AskThread({ threadId, visitorId, adoptThread, answerLocally, onItems, register }: Props) {
  const getOrCreate = useMutation(api.assistant.getOrCreateThread);
  const sendMessage = useMutation(api.assistant.sendMessage);
  const abort = useMutation(api.assistant.abort);
  const threadRef = useRef(threadId);
  threadRef.current = threadId;

  const { results } = useUIMessages(
    api.assistant.listMessages,
    threadId && visitorId.current ? { threadId, visitorId: visitorId.current } : "skip",
    { initialNumItems: 40, stream: true },
  );

  // usePaginatedQuery hands back a new array each render; derive items only when content changes.
  const fingerprint = results.map((m) => `${m.key}:${m.status}:${m.text.length}`).join("|");
  const resultsRef = useRef(results);
  resultsRef.current = results;
  const items = useMemo<AskItem[]>(
    () =>
      [...resultsRef.current]
        .sort((a, b) => a.order - b.order || a.stepOrder - b.stepOrder)
        .map((m) => ({
          id: m.key,
          role: m.role === "user" ? "user" : "assistant",
          text: m.text,
          status: m.status === "streaming" ? "streaming" : m.status === "pending" ? "pending" : "done",
          source: m.agentName === "fallback" ? "fallback" : "server",
          createdAt: m._creationTime,
          order: m.order,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fingerprint],
  );

  useEffect(() => onItems(items), [items, onItems]);

  const ensureThread = useCallback(async () => {
    if (threadRef.current) return threadRef.current;
    const id = await getOrCreate({ visitorId: visitorId.current, threadId: undefined });
    adoptThread(id);
    threadRef.current = id;
    return id;
  }, [getOrCreate, adoptThread, visitorId]);

  const send = useCallback(
    async (text: string) => {
      try {
        const id = await ensureThread();
        const result = (await sendMessage({ threadId: id, visitorId: visitorId.current, prompt: text })) as SendResult;
        if (result.kind === "rate_limited") answerLocally(text, { kind: "rate_limited", retryAt: Date.now() + result.retryAfter });
        else if (result.kind === "paused") answerLocally(text, { kind: "paused", retryAt: result.until });
        else if (result.kind === "invalid") answerLocally(text, { kind: "error" });
      } catch (error) {
        console.error("ask.send failed", error);
        answerLocally(text, { kind: "error" });
      }
    },
    [ensureThread, sendMessage, answerLocally, visitorId],
  );

  const stop = useCallback(async () => {
    const streaming = items.find((i) => i.status === "streaming" && i.order !== undefined);
    if (!threadRef.current || !streaming || streaming.order === undefined) return;
    try {
      await abort({ threadId: threadRef.current, visitorId: visitorId.current, order: streaming.order });
    } catch {
      /* already finished */
    }
  }, [abort, items, visitorId]);

  useEffect(() => {
    register({ send, stop });
    return () => register(null);
  }, [register, send, stop]);

  return null;
}
