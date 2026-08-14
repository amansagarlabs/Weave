"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ButtonLink, Card, StatusBadge } from "./ui";

type EditRequest = { id: number; creatorId: number; editorId: number; status: string; revisionCount: number; paymentStatus: string; suspensionFlag: boolean };

export function EditRequestList({ role }: { role: "creator" | "editor" }) {
  const [items, setItems] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const endpoint = role === "creator" ? "/creator/editor-requests" : "/editor/requests";
  useEffect(() => { api<EditRequest[]>(endpoint).then(setItems).catch((caught) => setError(caught instanceof Error ? `${caught.message}. Sign in to load requests.` : "Could not load requests.")).finally(() => setLoading(false)); }, [endpoint]);
  if (loading) return <Card><p className="text-sm font-bold text-[var(--muted)]">Loading requests…</p></Card>;
  if (error) return <Card><p role="alert" className="text-sm font-bold text-[var(--danger)]">{error}</p></Card>;
  if (!items.length) return <Card className="border border-dashed border-[var(--line)] text-center"><h2 className="text-2xl font-black">{role === "creator" ? "No editor requests yet." : "Your queue is clear."}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">{role === "creator" ? "Choose an editor and send a clear brief. Revision and payment status will stay together here." : "New creator requests will show the brief, deadline, revision cap, and payment-link state here."}</p><div className="mt-5"><ButtonLink href={role === "creator" ? "/creator/hire-editor" : "/editor/gigs"} variant="accent">{role === "creator" ? "Browse editors" : "Manage your gigs"}</ButtonLink></div></Card>;
  return <div className="space-y-3">{items.map((item) => <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Request #{item.id}</p><h2 className="mt-2 font-black">{role === "creator" ? `Editor ${item.editorId}` : `Creator ${item.creatorId}`}</h2><p className="mt-1 text-sm text-[var(--muted)]">{item.revisionCount} of 3 revisions · Payment {item.paymentStatus.toLowerCase()}</p></div><div className="flex items-center gap-3"><StatusBadge status={item.status.replaceAll("_", " ")} /><ButtonLink href={`/${role}/editor-requests/${item.id}`.replace("/editor/editor-requests", "/editor/requests")} variant="outline">Open request ↗</ButtonLink></div></Card>)}</div>;
}
