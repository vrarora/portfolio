// Fails when the assistant system prompt outgrows its budget.
// Run: npm run check:prompt
import { PROMPT_BUDGET_CHARS, SYSTEM_PROMPT } from "../convex/knowledge";

const length = SYSTEM_PROMPT.length;
const tokens = Math.round(length / 4);
console.log(`system prompt: ${length} chars (~${tokens} tokens), budget ${PROMPT_BUDGET_CHARS}`);
if (length > PROMPT_BUDGET_CHARS) {
  console.error("Prompt over budget.");
  process.exit(1);
}
