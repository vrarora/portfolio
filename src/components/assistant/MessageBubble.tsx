"use client";

import { useSmoothText } from "@convex-dev/agent/react";

import { splitAnswer } from "@/shared/assistantOutput";
import { FallbackNotice } from "./FallbackNotice";
import type { AskItem } from "./types";

type Props = {
  item: AskItem;
  onFollowUp: (question: string) => void;
  showFollowUps: boolean;
};

export function MessageBubble({ item, onFollowUp, showFollowUps }: Props) {
  const isUser = item.role === "user";
  const streaming = item.status === "streaming";
  const { answer, followUps } = splitAnswer(item.text);
  const [visible] = useSmoothText(answer, { startStreaming: streaming, charsPerSec: 240 });
  const text = isUser ? item.text : streaming ? visible : answer;
  const curated = !isUser && item.source !== "server" && item.id !== "welcome";

  return (
    <li className={`ask-msg ask-msg--${item.role}`} data-status={item.status}>
      {item.note ? <FallbackNotice note={item.note} /> : null}
      <div className="ask-bubble">
        {text.length === 0 && item.status !== "done" ? (
          <span className="ask-typing" aria-label="Thinking">
            <span />
            <span />
            <span />
          </span>
        ) : (
          text
        )}
      </div>
      {curated ? <span className="ask-curated t-micro">Curated answer</span> : null}
      {showFollowUps && item.status === "done" && followUps.length > 0 ? (
        <ul className="ask-followups">
          {followUps.map((q) => (
            <li key={q}>
              <button type="button" className="ask-chip" onClick={() => onFollowUp(q)}>
                {q}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
