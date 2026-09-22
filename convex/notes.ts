import { query } from "./_generated/server";

// Placeholder until step 10 adds posting, moderation and filters.
export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("notes")
      .withIndex("by_hidden_created", (q) => q.eq("hidden", false))
      .order("desc")
      .take(200);
    return rows.map(({ visitorId: _visitorId, ...note }) => note);
  },
});
