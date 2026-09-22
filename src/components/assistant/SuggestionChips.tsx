"use client";

import { assistantFaq } from "@/content/assistant-faq";

export function SuggestionChips({ onPick }: { onPick: (faqId: string) => void }) {
  return (
    <ul className="ask-chips" aria-label="Suggested questions">
      {assistantFaq
        .filter((f) => f.chip)
        .map((f) => (
          <li key={f.id}>
            <button type="button" className="ask-chip" onClick={() => onPick(f.id)}>
              {f.question}
            </button>
          </li>
        ))}
    </ul>
  );
}
