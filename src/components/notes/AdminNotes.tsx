"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { ConvexScope, useConvexGate } from "@/components/providers/ConvexClientProvider";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { DoodleSvg } from "./DoodleSvg";

import "./notes.css";

const TOKEN_KEY = "vp.admin.token";

type Snapshot = { notes: Doc<"notes">[]; banned: Doc<"bannedVisitors">[]; paused: boolean };

function Panel({ token, onForget }: { token: string; onForget: () => void }) {
  const listAll = useMutation(api.admin.listAll);
  const setHidden = useMutation(api.admin.setHidden);
  const banVisitor = useMutation(api.admin.banVisitor);
  const unbanVisitor = useMutation(api.admin.unbanVisitor);
  const setNotesPaused = useMutation(api.admin.setNotesPaused);
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData((await listAll({ token })) as Snapshot);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, [listAll, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (error) {
    return (
      <p className="admin-error">
        {error.includes("unauthorized") ? "Wrong token." : error.includes("locked") ? "Too many attempts. Wait an hour." : error.includes("not_configured") ? "ADMIN_TOKEN is not set on this deployment." : error}{" "}
        <button type="button" className="link-quiet admin-link" onClick={onForget}>
          Enter another token
        </button>
      </p>
    );
  }
  if (!data) return <p className="t-caption">Loading</p>;

  const bannedIds = new Set(data.banned.map((b) => b.visitorId));

  return (
    <div className="admin">
      <div className="admin-bar">
        <label className="admin-switch">
          <input type="checkbox" checked={data.paused} onChange={async (e) => { await setNotesPaused({ token, paused: e.target.checked }); void refresh(); }} />
          Pause new notes
        </label>
        <span className="t-caption">{data.notes.length} notes, {data.banned.length} banned</span>
        <button type="button" className="home-btn" onClick={() => void refresh()}>Refresh</button>
        <button type="button" className="link-quiet admin-link" onClick={onForget}>Forget token</button>
      </div>
      <ul className="admin-list">
        {data.notes.map((n) => (
          <li key={n._id} className={`admin-row${n.hidden ? " is-hidden" : ""}`}>
            {n.strokes ? <DoodleSvg className="admin-doodle" strokes={n.strokes} /> : <span className="admin-doodle" />}
            <div className="admin-row-body">
              <p>{n.text || <em>(doodle only)</em>}</p>
              <p className="t-caption admin-meta">
                {n.authorName} · {new Date(n.createdAt).toLocaleString()} · <code>{n.visitorId}</code>
                {n.hidden ? " · hidden" : ""}
                {bannedIds.has(n.visitorId) ? " · banned" : ""}
              </p>
            </div>
            <div className="admin-actions">
              <button type="button" className="home-btn" onClick={async () => { await setHidden({ token, id: n._id, hidden: !n.hidden }); void refresh(); }}>
                {n.hidden ? "Unhide" : "Hide"}
              </button>
              {bannedIds.has(n.visitorId) ? (
                <button type="button" className="home-btn" onClick={async () => { await unbanVisitor({ token, visitorId: n.visitorId }); void refresh(); }}>Unban</button>
              ) : (
                <button type="button" className="home-btn" onClick={async () => { await banVisitor({ token, visitorId: n.visitorId, hideNotes: true }); void refresh(); }}>Ban</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Hidden, unlinked moderation page. The token lives in sessionStorage for the tab. */
export function AdminNotes() {
  const gate = useConvexGate();
  const [token, setToken] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    gate.connect();
    try {
      setToken(window.sessionStorage.getItem(TOKEN_KEY));
    } catch {
      /* private mode */
    }
  }, [gate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    try {
      window.sessionStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* private mode */
    }
    setToken(t);
  };

  const forget = () => {
    try {
      window.sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* private mode */
    }
    setToken(null);
    setDraft("");
  };

  return (
    <section className="container admin-page">
      <h1>Notes moderation</h1>
      {!gate.configured ? <p>Convex is not configured for this build.</p> : null}
      {gate.configured && !token ? (
        <form className="admin-token" onSubmit={submit}>
          <label className="notes-field">
            <span className="t-caption notes-field-label">Admin token</span>
            <input type="password" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" />
          </label>
          <button type="submit" className="home-btn">Enter</button>
        </form>
      ) : null}
      {gate.configured && token && gate.ready ? (
        <ConvexScope>
          <Panel token={token} onForget={forget} />
        </ConvexScope>
      ) : null}
    </section>
  );
}
