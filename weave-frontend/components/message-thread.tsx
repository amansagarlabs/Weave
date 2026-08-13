"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { ButtonLink, Card } from "./ui";

type Message = { id: number; threadId: string; senderId: number; recipientId: number; body: string; createdAt: string };

export function MessageThread({ threadId, role }: { threadId: string; role: "creator" | "brand" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api<Message[]>(`/messages/${encodeURIComponent(threadId)}`).then(setMessages).catch(() => setError("Sign in to load this conversation.")); }, [threadId]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true); setError("");
    try {
      const message = await api<Message>("/messages", { method: "POST", body: JSON.stringify({ threadId, recipientId: 1, body: body.trim() }) });
      setMessages((current) => [...current, message]);
      setBody("");
    } catch (caught) { setError(caught instanceof Error ? `${caught.message}. Sign in before sending.` : "Sign in before sending."); }
    finally { setBusy(false); }
  }

  return <div className="grid gap-8 lg:grid-cols-[1fr_320px]"><Card className="flex min-h-[520px] flex-col"><div className="border-b border-[var(--line)] pb-4 font-black">{role === "brand" ? "Creator conversation" : "Brand conversation"}</div><div className="flex-1 space-y-4 py-6">{messages.length ? messages.map((message) => <div key={message.id} className={`max-w-sm rounded-2xl p-4 text-sm leading-6 ${message.senderId === 1 ? "bg-[var(--paper)]" : "ml-auto bg-[var(--accent)]"}`}>{message.body}</div>) : <p className="text-sm text-[var(--muted)]">No messages yet. Start with the brief, timeline, and what a good outcome looks like.</p>}</div>{error ? <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}<form className="flex gap-3 border-t border-[var(--line)] pt-4" onSubmit={send}><label htmlFor="message-body" className="sr-only">Message</label><input id="message-body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-12 flex-1 rounded-full border border-[var(--line)] px-5" placeholder="Write a message" /><button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-5 font-bold text-white disabled:opacity-60">{busy ? "Sending…" : "Send"}</button></form></Card><Card className="h-fit"><p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Work context</p><h2 className="mt-3 text-xl font-black">Keep the brief clear</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Share deliverables, timeline, revisions, and payment-link expectations before work begins.</p><div className="mt-5"><ButtonLink href={role === "brand" ? "/brand/bookings" : "/creator/bookings"} variant="outline">View bookings</ButtonLink></div></Card></div>;
}
