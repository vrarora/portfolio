"use client";

import { ArrowCounterClockwise, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cue } from "@/components/audio/cues";
import { ConvexScope } from "@/components/providers/ConvexClientProvider";
import { useReturnFocus } from "@/components/sheet/useReturnFocus";
import { Tag } from "@/components/reading/Treatments";
import { assistantCopy } from "@/content/assistant-faq";
import { SPRING_PANEL, SPRING_SHEET } from "@/styles/motion";
import { useAsk } from "./AskProvider";
import { AskThread } from "./AskThread";
import { Composer } from "./Composer";
import type { ComposerHandle } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import { SuggestionChips } from "./SuggestionChips";
import { useAskThread } from "./useAskThread";
import type { AskItem } from "./types";

import "./assistant.css";

type ThreadApi = { send: (text: string) => Promise<void>; stop: () => Promise<void> } | null;

export function AskPanel() {
  const { open, setOpen, launcherRef } = useAsk();
  const reduced = useReducedMotion();
  const thread = useAskThread(open);
  const [serverItems, setServerItems] = useState<AskItem[]>([]);
  const [threadApi, setThreadApi] = useState<ThreadApi>(null);
  const [mobile, setMobile] = useState(false);
  const composerRef = useRef<ComposerHandle>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useReturnFocus(open, () => launcherRef.current);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    cue("page");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => composerRef.current?.focus(), 350);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, setOpen]);

  const items = useMemo(() => {
    const merged = [...thread.localItems, ...serverItems].sort((a, b) => a.createdAt - b.createdAt);
    return [thread.welcome, ...merged];
  }, [thread.localItems, serverItems, thread.welcome]);

  const thinking = items.some((i) => i.role === "assistant" && i.status !== "done");
  const wasThinking = useRef(false);
  useEffect(() => {
    if (thinking && !wasThinking.current) cue("loading");
    if (!thinking && wasThinking.current) cue("ready");
    wasThinking.current = thinking;
  }, [thinking]);
  const live = thread.gate.configured;

  // Keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [items.length, items[items.length - 1]?.text.length, reduced]);

  const send = useCallback(
    (text: string) => {
      if (!live) {
        thread.answerLocally(text, { kind: "offline" });
        return;
      }
      if (!threadApi) {
        thread.answerLocally(text, { kind: "error" });
        return;
      }
      void threadApi.send(text);
    },
    [live, threadApi, thread],
  );

  const reset = () => {
    thread.reset();
    setServerItems([]);
  };

  const register = useCallback((api: ThreadApi) => setThreadApi(api), []);
  const onItems = useCallback((next: AskItem[]) => setServerItems(next), []);

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : mobile
      ? {
          initial: { y: "100%" },
          animate: { y: 0, transition: SPRING_SHEET },
          exit: { y: "100%", transition: { duration: 0.32, ease: [0.25, 1, 0.5, 1] as const } },
        }
      : {
          initial: { x: "100%" },
          animate: { x: 0, transition: SPRING_PANEL },
          exit: { x: "100%", transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] as const } },
        };

  return (
    <>
      <ConvexScope>
        <AskThread
          threadId={thread.threadId}
          visitorId={thread.visitorId}
          adoptThread={thread.adoptThread}
          answerLocally={thread.answerLocally}
          onItems={onItems}
          register={register}
        />
      </ConvexScope>
      <AnimatePresence>
        {open ? (
          <motion.aside
            key="ask"
            id="ask-panel"
            className={`ask-panel${mobile ? " ask-panel--sheet" : ""}`}
            role="dialog"
            aria-modal={mobile ? "true" : undefined}
            aria-label="Ask Vaibhav"
            data-thinking={thinking ? "" : undefined}
            {...panelMotion}
          >
            <header className="ask-head">
              <span className="ask-orb" aria-hidden="true" />
              <h2 className="ask-title">{assistantCopy.name}</h2>
              <Tag>AI</Tag>
              <span className="ask-head-spacer" />
              <button type="button" className="ask-icon-btn" onClick={reset} aria-label="Start over">
                <ArrowCounterClockwise size={15} weight="bold" />
              </button>
              <button type="button" className="ask-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                <X size={15} weight="bold" />
              </button>
            </header>
            <p className="ask-disclosure t-caption">{assistantCopy.disclosure}</p>

            <ol ref={listRef} className="ask-list" aria-live="polite" aria-relevant="additions text">
              {items.map((item, index) => (
                <MessageBubble
                  key={item.id}
                  item={item}
                  onFollowUp={send}
                  showFollowUps={index === items.length - 1}
                />
              ))}
            </ol>

            {items.length <= 1 ? <SuggestionChips onPick={thread.askChip} /> : null}

            <Composer
              ref={composerRef}
              onSend={send}
              onStop={threadApi ? () => void threadApi.stop() : undefined}
              streaming={thinking}
              disabled={live && !thread.gate.ready}
              disabledHint="Connecting"
            />
            {!live ? <p className="ask-offline t-caption">{assistantCopy.offline}</p> : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
