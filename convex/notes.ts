import { v } from "convex/values";

import { seedNotes } from "../src/content/notes-seed";
import {
  NOTE_COLORS,
  NOTE_DEFAULT_NAME,
  NOTE_DUPLICATE_WINDOW_MS,
  NOTE_NAME_MAX,
  NOTE_POINTS_TOTAL_MAX,
  NOTE_REMOVE_WINDOW_MS,
  NOTE_ROTATION_MAX,
  NOTE_STROKES_MAX,
  NOTE_TEXT_MAX,
} from "../src/shared/limits";
import { countPoints, validateStrokes } from "../src/shared/strokeCodec";
import { cleanText, collapseRepeats, validateNoteInput } from "../src/shared/textFilters";
import { internalMutation, mutation, query } from "./_generated/server";
import { assertVisitorId, getSiteState, isBanned } from "./lib/guards";
import { rateLimiter } from "./rateLimits";

export const NOTES_PAUSED_KEY = "notesPaused";

const strokeValidator = v.object({ c: v.string(), w: v.number(), p: v.array(v.number()) });
const colorValidator = v.union(...NOTE_COLORS.map((c) => v.literal(c)));

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));

export const listVisible = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("notes")
      .withIndex("by_hidden_created", (q) => q.eq("hidden", false))
      .order("desc")
      .take(Math.min(200, Math.max(1, limit ?? 200)));
    return rows.map(({ visitorId: _visitorId, hiddenAt: _hiddenAt, ...note }) => note);
  },
});

export const wallState = query({
  args: {},
  handler: async (ctx) => ({ paused: (await getSiteState<boolean>(ctx, NOTES_PAUSED_KEY)) === true }),
});

export const post = mutation({
  args: {
    visitorId: v.string(),
    authorName: v.string(),
    text: v.string(),
    strokes: v.optional(v.array(strokeValidator)),
    color: colorValidator,
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    /** Honeypot. Real visitors never fill it. */
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertVisitorId(args.visitorId);
    if (args.website && args.website.length > 0) return { ok: false as const, reason: "invalid" as const };
    if ((await getSiteState<boolean>(ctx, NOTES_PAUSED_KEY)) === true) return { ok: false as const, reason: "paused" as const };
    if (await isBanned(ctx, args.visitorId)) return { ok: false as const, reason: "blocked" as const };

    const text = collapseRepeats(cleanText(args.text));
    const authorName = cleanText(args.authorName) || NOTE_DEFAULT_NAME;
    const strokes = args.strokes ?? [];
    if (strokes.length > 0 && !validateStrokes(strokes)) return { ok: false as const, reason: "invalid" as const };

    const check = validateNoteInput({
      text,
      name: authorName,
      strokeCount: strokes.length,
      pointCount: countPoints(strokes),
      limits: { textMax: NOTE_TEXT_MAX, nameMax: NOTE_NAME_MAX, strokesMax: NOTE_STROKES_MAX, pointsMax: NOTE_POINTS_TOTAL_MAX },
    });
    if (!check.ok) {
      const reason = check.reason === "url" || check.reason === "blocked" ? ("blocked" as const) : ("invalid" as const);
      return { ok: false as const, reason, detail: check.reason };
    }

    // Same visitor, same text, within ten minutes.
    if (text.length > 0) {
      const recent = await ctx.db
        .query("notes")
        .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId).gt("createdAt", Date.now() - NOTE_DUPLICATE_WINDOW_MS))
        .collect();
      if (recent.some((n) => n.text === text)) return { ok: false as const, reason: "invalid" as const, detail: "duplicate" as const };
    }

    const perVisitor = await rateLimiter.limit(ctx, "notePost", { key: args.visitorId });
    if (!perVisitor.ok) return { ok: false as const, reason: "rate_limited" as const, retryAfter: perVisitor.retryAfter };
    const global = await rateLimiter.limit(ctx, "notePostGlobal");
    if (!global.ok) return { ok: false as const, reason: "rate_limited" as const, retryAfter: global.retryAfter, scope: "global" as const };

    const id = await ctx.db.insert("notes", {
      authorName,
      text,
      strokes: strokes.length > 0 ? strokes : undefined,
      color: args.color,
      x: clamp01(args.x),
      y: clamp01(args.y),
      rotation: Math.max(-NOTE_ROTATION_MAX, Math.min(NOTE_ROTATION_MAX, args.rotation)),
      visitorId: args.visitorId,
      createdAt: Date.now(),
      hidden: false,
    });
    return { ok: true as const, id };
  },
});

export const removeOwn = mutation({
  args: { visitorId: v.string(), id: v.id("notes") },
  handler: async (ctx, { visitorId, id }) => {
    assertVisitorId(visitorId);
    const note = await ctx.db.get(id);
    if (!note || note.visitorId !== visitorId) return { ok: false as const };
    if (Date.now() - note.createdAt > NOTE_REMOVE_WINDOW_MS) return { ok: false as const, reason: "expired" as const };
    await ctx.db.patch(id, { hidden: true, hiddenAt: Date.now() });
    return { ok: true as const };
  },
});

/** Inserts the two owner notes once. Run: npx convex run notes:seedOwnerNotes */
export const seedOwnerNotes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_visitor", (q) => q.eq("visitorId", "v_owner00000000000000000000"))
      .collect();
    if (existing.length > 0) return { inserted: 0 };
    let inserted = 0;
    for (const seed of seedNotes) {
      await ctx.db.insert("notes", {
        authorName: seed.authorName,
        text: seed.text,
        strokes: seed.strokes,
        color: seed.color,
        x: seed.x,
        y: seed.y,
        rotation: seed.rotation,
        visitorId: "v_owner00000000000000000000",
        createdAt: Date.now() - (seedNotes.length - inserted) * 1000,
        hidden: false,
        owner: true,
      });
      inserted += 1;
    }
    return { inserted };
  },
});
