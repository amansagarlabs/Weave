"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ButtonLink, Card } from "./ui";

type Conversation = {
  threadId: string;
  participantId: number;
  participantEmail?: string;
  participantRole?: string;
  latestBody: string;
  latestAt: string;
  bookingStatus?: string | null;
  bookingAmount?: number | string | null;
};

export function MessageInbox({ role }: { role: "creator" | "brand" }) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Conversation[]>("/messages")
      .then(setItems)
      .catch((caught) => setError(caught instanceof Error ? `${caught.message}. Sign in to load your inbox.` : "Could not load inbox."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card><p className="text-sm font-bold text-[var(--muted)]">Loading messages…</p></Card>;
  if (error) return <Card><p role="alert" className="text-sm font-bold text-[var(--danger)]">{error}</p></Card>;
  if (!items.length) return <Card className="border border-dashed border-[var(--line)] text-center"><h2 className="text-2xl font-black">{role === "brand" ? "Start the right conversation." : "Your inbox is quiet."}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">{role === "brand" ? "Discover a creator, share the context behind your brief, and keep the work conversation in one place." : "When a brand reaches out, you’ll see the conversation and its work context here."}</p><div className="mt-5"><ButtonLink href={role === "brand" ? "/brand/discover" : "/creator/hire-editor"} variant="accent">{role === "brand" ? "Discover creators" : "Browse editors"}</ButtonLink></div></Card>;

  return <div className="space-y-3">{items.map((item) => {
    const label = item.bookingStatus ? `Booking · ${item.bookingStatus.replaceAll("_", " ")}` : "Conversation";
    const roleLabel = item.participantRole?.toLowerCase() ?? "participant";
    const amount = item.bookingAmount == null ? "" : ` · ₹${Number(item.bookingAmount).toLocaleString("en-IN")}`;
    return <Card key={item.threadId} className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">{label}</p><h2 className="mt-2 font-black">{item.participantEmail ?? `Participant ${item.participantId}`}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{roleLabel}{amount}</p><p className="mt-2 max-w-xl truncate text-sm text-[var(--muted)]">{item.latestBody}</p><p className="mt-2 text-xs text-[var(--muted)]">{new Date(item.latestAt).toLocaleString("en-IN")}</p></div><ButtonLink href={`/${role}/messages/${encodeURIComponent(item.threadId)}`} variant="outline">Open thread ↗</ButtonLink></Card>;
  })}</div>;
}
