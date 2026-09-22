import { assistantFaq, assistantCopy, offLimits } from "../content/assistant-faq";
import type { Faq } from "../content/assistant-faq";

export type Fallback = {
  answer: string;
  followUps: string[];
  source: "faq" | "off-limits" | "none";
  faqId?: string;
};

const STOP = new Set(["the", "a", "an", "of", "to", "in", "on", "at", "is", "are", "you", "your", "do", "does", "what", "how", "i", "me", "my", "and", "or", "for", "with", "about", "it", "this", "that", "be", "can", "tell"]);

export function normalise(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text: string) {
  return normalise(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function scoreFaq(faq: Faq, q: string, qWords: Set<string>) {
  let score = 0;
  for (const kw of faq.keywords) {
    const k = normalise(kw);
    if (k.includes(" ")) {
      if (q.includes(k)) score += 3;
    } else if (qWords.has(k)) {
      score += 2;
    }
  }
  for (const w of words(faq.question)) if (qWords.has(w)) score += 1;
  return score;
}

/** Best curated answer for a visitor question. Off-limits topics win outright. */
export function pickFallback(question: string): Fallback {
  const q = normalise(question);
  const qWords = new Set(words(question));

  for (const rule of offLimits) {
    if (rule.keywords.some((kw) => q.includes(normalise(kw)))) {
      return { answer: rule.response, followUps: ["Are you open to new roles?", "How do you ship in code?"], source: "off-limits" };
    }
  }

  let best: Faq | null = null;
  let bestScore = 0;
  for (const faq of assistantFaq) {
    const s = scoreFaq(faq, q, qWords);
    if (s > bestScore) {
      best = faq;
      bestScore = s;
    }
  }
  if (best && bestScore >= 2) {
    return { answer: best.answer, followUps: best.followUps, source: "faq", faqId: best.id };
  }
  return {
    answer: assistantCopy.noMatch,
    followUps: assistantFaq.filter((f) => f.chip).map((f) => f.question),
    source: "none",
  };
}
