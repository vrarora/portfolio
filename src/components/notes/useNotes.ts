"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api } from "@convex/_generated/api";
import { getVisitorId } from "@/lib/visitor";
import { NOTES_HOME_COUNT } from "@/shared/limits";
import type { NoteColor } from "@/shared/limits";
import type { Stroke } from "@/shared/strokeCodec";
import type { NoteView } from "./NoteCard";
import { pickPlacement } from "./placement";

const MINE_KEY = "vp.notes.mine";

function readMine(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(MINE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export type PostInput = { authorName: string; text: string; strokes: Stroke[]; color: NoteColor; website: string };

export type PostOutcome =
  | { ok: true }
  | { ok: false; reason: "rate_limited" | "invalid" | "blocked" | "paused" | "network"; detail?: string; retryAfter?: number; scope?: "global" };

/** Live notes from Convex plus post and remove. Must render inside ConvexScope. */
export function useNotes(limit = NOTES_HOME_COUNT) {
  const rows = useQuery(api.notes.listVisible, { limit });
  const wall = useQuery(api.notes.wallState, {});
  const post = useMutation(api.notes.post);
  const removeOwn = useMutation(api.notes.removeOwn);
  const [mine, setMine] = useState<string[]>([]);
  const visitorId = useRef("");

  useEffect(() => {
    visitorId.current = getVisitorId();
    setMine(readMine());
  }, []);

  const notes = useMemo<NoteView[] | null>(() => {
    if (!rows) return null;
    return rows
      .map((r) => ({
        id: r._id,
        authorName: r.authorName,
        text: r.text,
        strokes: r.strokes,
        color: r.color,
        x: r.x,
        y: r.y,
        rotation: r.rotation,
        createdAt: r.createdAt,
        owner: r.owner,
        mine: mine.includes(r._id),
      }))
      .reverse();
  }, [rows, mine]);

  const submit = useCallback(
    async (input: PostInput): Promise<PostOutcome> => {
      const placement = pickPlacement(notes ?? []);
      try {
        const result = await post({
          visitorId: visitorId.current,
          authorName: input.authorName,
          text: input.text,
          strokes: input.strokes.length > 0 ? input.strokes : undefined,
          color: input.color,
          x: placement.x,
          y: placement.y,
          rotation: placement.rotation,
          website: input.website,
        });
        if (result.ok) {
          const next = [...readMine(), result.id].slice(-20);
          try {
            window.localStorage.setItem(MINE_KEY, JSON.stringify(next));
          } catch {
            /* private mode */
          }
          setMine(next);
          return { ok: true };
        }
        return { ok: false, reason: result.reason, detail: "detail" in result ? result.detail : undefined, retryAfter: "retryAfter" in result ? result.retryAfter : undefined, scope: "scope" in result ? result.scope : undefined };
      } catch (error) {
        console.error("notes.post failed", error);
        return { ok: false, reason: "network" };
      }
    },
    [post, notes],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await removeOwn({ visitorId: visitorId.current, id: id as never });
      } catch {
        /* ignore */
      }
    },
    [removeOwn],
  );

  return { notes, paused: wall?.paused ?? false, loading: rows === undefined, submit, remove };
}
