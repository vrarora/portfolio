const KEY = "vp.visitor";
const PATTERN = /^v_[a-z0-9]{20,40}$/;

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

/** Stable anonymous id per browser, used as the Agent userId and rate-limit key. */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing && PATTERN.test(existing)) return existing;
    const fresh = `v_${randomId()}`;
    window.localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return `v_${randomId()}`;
  }
}

export const VISITOR_ID_PATTERN = PATTERN;
