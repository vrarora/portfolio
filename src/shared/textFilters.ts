import { BLOCKLIST } from "./blocklist";

const CONTROL_AND_ZERO_WIDTH = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g;

/** NFKC, strip control and zero-width characters, tidy whitespace. */
export function cleanText(input: string) {
  return input
    .normalize("NFKC")
    .replace(CONTROL_AND_ZERO_WIDTH, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Collapses runs of the same character longer than three: "loooool" -> "loool". */
export function collapseRepeats(input: string) {
  return input.replace(/(.)\1{3,}/gu, "$1$1$1");
}

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i", "+": "t" };

function foldLeet(word: string) {
  return word.replace(/[013457@$!+]/g, (ch) => LEET[ch] ?? ch);
}

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|in|dev|app|xyz|me|ly|sh|ai|info|biz|link)\b|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)/i;

/** True for http links, www hosts, bare common TLDs and email addresses. @handles pass. */
export function containsUrl(input: string) {
  return URL_PATTERN.test(input.replace(/\s+/g, " "));
}

const blockSet = new Set(BLOCKLIST.map((w) => w.toLowerCase()));

/** True when any whole word, after folding, is on the blocklist. */
export function containsBlockedTerm(input: string) {
  const folded = collapseRepeats(cleanText(input).toLowerCase());
  const words = folded.split(/[^\p{L}\p{N}@$!+]+/u).filter(Boolean);
  for (const raw of words) {
    const w = foldLeet(raw).replace(/[^\p{L}]/gu, "");
    if (w && blockSet.has(w)) return true;
    if (w.length > 3 && blockSet.has(w.replace(/(.)\1+/g, "$1"))) return true;
  }
  return false;
}

export type NoteValidation =
  | { ok: true }
  | { ok: false; reason: "empty" | "text_long" | "name_long" | "url" | "blocked" | "doodle_large" };

export function validateNoteInput(input: {
  text: string;
  name: string;
  strokeCount: number;
  pointCount: number;
  limits: { textMax: number; nameMax: number; strokesMax: number; pointsMax: number };
}): NoteValidation {
  const text = cleanText(input.text);
  const name = cleanText(input.name);
  if (text.length === 0 && input.strokeCount === 0) return { ok: false, reason: "empty" };
  if (text.length > input.limits.textMax) return { ok: false, reason: "text_long" };
  if (name.length > input.limits.nameMax) return { ok: false, reason: "name_long" };
  if (input.strokeCount > input.limits.strokesMax || input.pointCount > input.limits.pointsMax) {
    return { ok: false, reason: "doodle_large" };
  }
  if (containsUrl(text) || containsUrl(name)) return { ok: false, reason: "url" };
  if (containsBlockedTerm(text) || containsBlockedTerm(name)) return { ok: false, reason: "blocked" };
  return { ok: true };
}
