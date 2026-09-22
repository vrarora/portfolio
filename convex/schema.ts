import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const stroke = v.object({
  c: v.string(),
  w: v.number(),
  p: v.array(v.number()),
});

export default defineSchema({
  notes: defineTable({
    authorName: v.string(),
    text: v.string(),
    strokes: v.optional(v.array(stroke)),
    color: v.union(
      v.literal("paper"),
      v.literal("accent"),
      v.literal("gold"),
      v.literal("green"),
      v.literal("blue"),
    ),
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    visitorId: v.string(),
    createdAt: v.number(),
    hidden: v.boolean(),
    hiddenAt: v.optional(v.number()),
    owner: v.optional(v.boolean()),
  })
    .index("by_hidden_created", ["hidden", "createdAt"])
    .index("by_visitor", ["visitorId", "createdAt"]),

  siteState: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  bannedVisitors: defineTable({
    visitorId: v.string(),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_visitor", ["visitorId"]),
});
