export type AskNote =
  | { kind: "rate_limited"; retryAt: number }
  | { kind: "paused"; retryAt: number }
  | { kind: "offline" }
  | { kind: "error" };

export type AskItem = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "done" | "streaming" | "pending";
  /** local: answered on the client from the FAQ. fallback: curated answer saved by the server. */
  source: "local" | "server" | "fallback";
  createdAt: number;
  order?: number;
  note?: AskNote;
};
