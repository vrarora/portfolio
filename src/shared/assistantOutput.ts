/**
 * The model answers in plain text, then an optional line `---` followed by
 * up to three follow-up questions, one per line. Streaming stays readable
 * and the client can parse follow-ups once the message is complete.
 */
export const FOLLOW_UP_DIVIDER = "\n---";

export function splitAnswer(text: string): { answer: string; followUps: string[] } {
  const index = text.indexOf(FOLLOW_UP_DIVIDER);
  if (index === -1) return { answer: text.trim(), followUps: [] };
  const answer = text.slice(0, index).trim();
  const followUps = text
    .slice(index + FOLLOW_UP_DIVIDER.length)
    .split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length > 0 && line.length <= 80)
    .slice(0, 3);
  return { answer, followUps };
}

export function joinAnswer(answer: string, followUps: string[]) {
  if (followUps.length === 0) return answer;
  return `${answer}${FOLLOW_UP_DIVIDER}\n${followUps.join("\n")}`;
}
