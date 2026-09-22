import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";

export const VISITOR_ID = /^v_[a-z0-9]{20,40}$/;

export function assertVisitorId(visitorId: string) {
  if (!VISITOR_ID.test(visitorId)) throw new ConvexError({ code: "invalid_visitor" });
}

export async function isBanned(ctx: QueryCtx | MutationCtx, visitorId: string) {
  const row = await ctx.db
    .query("bannedVisitors")
    .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
    .first();
  return row !== null;
}

export async function getSiteState<T>(ctx: QueryCtx | MutationCtx, key: string): Promise<T | null> {
  const row = await ctx.db
    .query("siteState")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();
  return row ? (row.value as T) : null;
}

export async function setSiteState(ctx: MutationCtx, key: string, value: unknown) {
  const row = await ctx.db
    .query("siteState")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();
  if (row) await ctx.db.patch(row._id, { value, updatedAt: Date.now() });
  else await ctx.db.insert("siteState", { key, value, updatedAt: Date.now() });
}

/** Constant-time string compare for the admin token. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
