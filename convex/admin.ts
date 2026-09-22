import { ConvexError, v } from "convex/values";

import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { safeEqual, setSiteState } from "./lib/guards";
import { NOTES_PAUSED_KEY } from "./notes";
import { rateLimiter } from "./rateLimits";

/** Token-gated moderation. Failed attempts count against adminAttempt (10/hour). */
async function assertAdmin(ctx: MutationCtx, token: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new ConvexError({ code: "not_configured" });
  const gate = await rateLimiter.check(ctx, "adminAttempt");
  if (!gate.ok) throw new ConvexError({ code: "locked", retryAfter: gate.retryAfter });
  if (!safeEqual(token, expected)) {
    await rateLimiter.limit(ctx, "adminAttempt");
    throw new ConvexError({ code: "unauthorized" });
  }
}

export const verify = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await assertAdmin(ctx, token);
    return { ok: true };
  },
});

export const listAll = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await assertAdmin(ctx, token);
    const notes = await ctx.db.query("notes").order("desc").take(300);
    const banned = await ctx.db.query("bannedVisitors").collect();
    const paused = await ctx.db
      .query("siteState")
      .withIndex("by_key", (q) => q.eq("key", NOTES_PAUSED_KEY))
      .first();
    return { notes, banned, paused: paused?.value === true };
  },
});

export const setHidden = mutation({
  args: { token: v.string(), id: v.id("notes"), hidden: v.boolean() },
  handler: async (ctx, { token, id, hidden }) => {
    await assertAdmin(ctx, token);
    await ctx.db.patch(id, { hidden, hiddenAt: hidden ? Date.now() : undefined });
    return { ok: true };
  },
});

export const banVisitor = mutation({
  args: { token: v.string(), visitorId: v.string(), reason: v.optional(v.string()), hideNotes: v.optional(v.boolean()) },
  handler: async (ctx, { token, visitorId, reason, hideNotes }) => {
    await assertAdmin(ctx, token);
    const existing = await ctx.db
      .query("bannedVisitors")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .first();
    if (!existing) await ctx.db.insert("bannedVisitors", { visitorId, reason, createdAt: Date.now() });
    if (hideNotes) {
      const notes = await ctx.db
        .query("notes")
        .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
        .collect();
      for (const note of notes) if (!note.hidden) await ctx.db.patch(note._id, { hidden: true, hiddenAt: Date.now() });
    }
    return { ok: true };
  },
});

export const unbanVisitor = mutation({
  args: { token: v.string(), visitorId: v.string() },
  handler: async (ctx, { token, visitorId }) => {
    await assertAdmin(ctx, token);
    const rows = await ctx.db
      .query("bannedVisitors")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
    return { ok: true };
  },
});

export const setNotesPaused = mutation({
  args: { token: v.string(), paused: v.boolean() },
  handler: async (ctx, { token, paused }) => {
    await assertAdmin(ctx, token);
    await setSiteState(ctx, NOTES_PAUSED_KEY, paused);
    return { ok: true };
  },
});
