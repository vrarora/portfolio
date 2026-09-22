import { google } from "@ai-sdk/google";
import {
  Agent,
  abortStream,
  createThread,
  getThreadMetadata,
  listUIMessages,
  saveMessage,
  stepCountIs,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { pickFallback } from "../src/shared/pickFallback";
import { joinAnswer } from "../src/shared/assistantOutput";
import { components, internal } from "./_generated/api";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { SYSTEM_PROMPT } from "./knowledge";
import { assertVisitorId, getSiteState, isBanned, setSiteState } from "./lib/guards";
import { rateLimiter } from "./rateLimits";

const PAUSE_KEY = "assistantPausedUntil";
const PAUSE_MS = 20 * 60 * 1000;
const MAX_PROMPT = 400;

export const pauseState = query({
  args: {},
  handler: async (ctx) => {
    const until = await getSiteState<number>(ctx, PAUSE_KEY);
    const configured = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_MODEL);
    return { pausedUntil: until && until > Date.now() ? until : null, configured };
  },
});

export const getOrCreateThread = mutation({
  args: { visitorId: v.string(), threadId: v.optional(v.string()) },
  handler: async (ctx, { visitorId, threadId }) => {
    assertVisitorId(visitorId);
    if (await isBanned(ctx, visitorId)) throw new ConvexError({ code: "banned" });
    if (threadId) {
      try {
        const meta = await getThreadMetadata(ctx, components.agent, { threadId });
        if (meta.userId === visitorId && meta.status === "active") return threadId;
      } catch {
        /* unknown thread, create a fresh one */
      }
    }
    return createThread(ctx, components.agent, { userId: visitorId, title: "Ask Vaibhav" });
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    visitorId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, { threadId, visitorId, paginationOpts, streamArgs }) => {
    assertVisitorId(visitorId);
    const meta = await getThreadMetadata(ctx, components.agent, { threadId });
    if (meta.userId !== visitorId) throw new ConvexError({ code: "forbidden" });
    const paginated = await listUIMessages(ctx, components.agent, { threadId, paginationOpts });
    const streams = await syncStreams(ctx, components.agent, { threadId, streamArgs });
    return { ...paginated, streams };
  },
});

export const sendMessage = mutation({
  args: { threadId: v.string(), visitorId: v.string(), prompt: v.string() },
  handler: async (ctx, { threadId, visitorId, prompt }) => {
    assertVisitorId(visitorId);
    const text = prompt.trim();
    if (text.length === 0 || text.length > MAX_PROMPT) {
      return { kind: "invalid" as const, reason: "length" as const };
    }
    if (await isBanned(ctx, visitorId)) return { kind: "invalid" as const, reason: "banned" as const };

    const meta = await getThreadMetadata(ctx, components.agent, { threadId });
    if (meta.userId !== visitorId) throw new ConvexError({ code: "forbidden" });

    const pausedUntil = await getSiteState<number>(ctx, PAUSE_KEY);
    if (pausedUntil && pausedUntil > Date.now()) return { kind: "paused" as const, until: pausedUntil };

    const burst = await rateLimiter.limit(ctx, "askPerVisitorBurst", { key: visitorId });
    if (!burst.ok) return { kind: "rate_limited" as const, retryAfter: burst.retryAfter };
    const daily = await rateLimiter.limit(ctx, "askPerVisitorDaily", { key: visitorId });
    if (!daily.ok) return { kind: "rate_limited" as const, retryAfter: daily.retryAfter };
    const globalMinute = await rateLimiter.limit(ctx, "askGlobalMinute");
    if (!globalMinute.ok) return { kind: "rate_limited" as const, retryAfter: globalMinute.retryAfter };
    const globalDaily = await rateLimiter.limit(ctx, "askGlobalDaily");
    if (!globalDaily.ok) {
      const until = Date.now() + globalDaily.retryAfter;
      await setSiteState(ctx, PAUSE_KEY, until);
      return { kind: "paused" as const, until };
    }

    const { messageId } = await saveMessage(ctx, components.agent, { threadId, userId: visitorId, prompt: text });
    await ctx.scheduler.runAfter(0, internal.assistant.generate, { threadId, visitorId, promptMessageId: messageId, prompt: text });
    return { kind: "queued" as const, messageId };
  },
});

export const abort = mutation({
  args: { threadId: v.string(), visitorId: v.string(), order: v.number() },
  handler: async (ctx, { threadId, visitorId, order }) => {
    assertVisitorId(visitorId);
    const meta = await getThreadMetadata(ctx, components.agent, { threadId });
    if (meta.userId !== visitorId) throw new ConvexError({ code: "forbidden" });
    return abortStream(ctx, components.agent, { threadId, order, reason: "visitor stopped" });
  },
});

export const pause = internalMutation({
  args: { until: v.number() },
  handler: async (ctx, { until }) => setSiteState(ctx, PAUSE_KEY, until),
});

export const saveFallback = internalMutation({
  args: { threadId: v.string(), visitorId: v.string(), promptMessageId: v.string(), text: v.string() },
  handler: async (ctx, { threadId, visitorId, promptMessageId, text }) => {
    await saveMessage(ctx, components.agent, {
      threadId,
      userId: visitorId,
      promptMessageId,
      agentName: "fallback",
      message: { role: "assistant", content: text },
    });
  },
});

function isQuotaError(error: unknown) {
  const text = error instanceof Error ? `${error.message} ${error.name}` : String(error);
  return /429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(text);
}

export const generate = internalAction({
  args: { threadId: v.string(), visitorId: v.string(), promptMessageId: v.string(), prompt: v.string() },
  handler: async (ctx, { threadId, visitorId, promptMessageId, prompt }) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    const fallback = async (pauseMs: number) => {
      const picked = pickFallback(prompt);
      await ctx.runMutation(internal.assistant.saveFallback, {
        threadId,
        visitorId,
        promptMessageId,
        text: joinAnswer(picked.answer, picked.followUps),
      });
      if (pauseMs > 0) await ctx.runMutation(internal.assistant.pause, { until: Date.now() + pauseMs });
    };

    if (!apiKey || !model) {
      await fallback(PAUSE_MS);
      return;
    }

    const agent = new Agent(components.agent, {
      name: "Vaibhav",
      languageModel: google(model),
      instructions: SYSTEM_PROMPT,
      contextOptions: { recentMessages: 8, searchOptions: { limit: 0 } },
      storageOptions: { saveMessages: "promptAndOutput" },
      callSettings: { maxOutputTokens: 350, temperature: 0.4 },
      stopWhen: stepCountIs(1),
    });

    try {
      const result = await agent.streamText(
        ctx,
        { threadId, userId: visitorId },
        { promptMessageId },
        { saveStreamDeltas: { chunking: "word", throttleMs: 250 } },
      );
      await result.consumeStream();
    } catch (error) {
      console.error("assistant.generate failed", error);
      await fallback(isQuotaError(error) ? PAUSE_MS : 0);
    }
  },
});
