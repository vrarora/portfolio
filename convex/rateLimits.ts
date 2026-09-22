import { RateLimiter, HOUR, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const DAY = 24 * HOUR;

function envInt(name: string, fallback: number) {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  askPerVisitorBurst: { kind: "token bucket", rate: 6, period: MINUTE, capacity: 3 },
  askPerVisitorDaily: { kind: "fixed window", rate: 20, period: DAY },
  askGlobalMinute: { kind: "fixed window", rate: 8, period: MINUTE },
  askGlobalDaily: {
    kind: "fixed window",
    rate: envInt("ASSISTANT_DAILY_BUDGET", 180),
    period: DAY,
  },
  notePost: { kind: "fixed window", rate: 3, period: HOUR },
  notePostGlobal: { kind: "fixed window", rate: 60, period: HOUR },
  adminAttempt: { kind: "fixed window", rate: 10, period: HOUR },
});
