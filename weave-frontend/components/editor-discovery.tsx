"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, EmptyState, Pill } from "./ui";

type Gig = { id: number; contentType: string; price: number; deliveryDays: number; revisionsIncluded: number; active: boolean };
type Editor = { editorId: number; portfolioLinksJson: string; gigs: Gig[] };

function portfolioCount(value: string) { try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.length : 0; } catch { return 0; } }

export function EditorDiscovery() {
  const [editors, setEditors] = useState<Editor[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [sentTo, setSentTo] = useState<number | null>(null); const [sending, setSending] = useState<number | null>(null);
  useEffect(() => { api<Editor[]>("/editor/discover").then(setEditors).catch(() => setError("We could not load editors right now.")).finally(() => setLoading(false)); }, []);
  async function request(editorId: number) { setSending(editorId); try { await api("/edit-requests", { method: "POST", body: JSON.stringify({ editorId }) }); setSentTo(editorId); } catch { setError("We could not send that request. Please try again."); } finally { setSending(null); } }
  if (loading) return <Card><p className="text-sm text-[var(--muted)]">Finding available editors...</p></Card>;
  if (error && editors.length === 0) return <Card><p className="text-sm text-red-700">{error}</p></Card>;
  if (editors.length === 0) return <EmptyState title="Editors are joining soon." copy="Check back when more editing partners publish their services." href="/creator/dashboard" action="Back to dashboard" />;
  return <div className="space-y-4">{error ? <p className="text-sm text-red-700">{error}</p> : null}<div className="grid gap-5 md:grid-cols-2">{editors.map((editor) => { const firstGig = editor.gigs[0]; return <Card key={editor.editorId} className="flex h-full flex-col justify-between"><div><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--forest)]">Editor #{editor.editorId}</p><h3 className="mt-2 text-xl font-black">A fresh editing partner</h3></div><Pill>{portfolioCount(editor.portfolioLinksJson)} portfolio links</Pill></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">Review the editor&apos;s published services and choose a package that fits your next brief.</p>{firstGig ? <div className="mt-5 rounded-2xl bg-[var(--paper)] p-4"><div className="flex items-center justify-between gap-3"><span className="font-black">{firstGig.contentType}</span><span className="font-black tabular-nums">₹{firstGig.price.toLocaleString("en-IN")}</span></div><p className="mt-2 text-sm text-[var(--muted)]">{firstGig.deliveryDays} day delivery · {firstGig.revisionsIncluded} revisions included</p>{editor.gigs.length > 1 ? <p className="mt-2 text-xs font-bold text-[var(--forest)]">{editor.gigs.length} packages available</p> : null}</div> : <p className="mt-5 rounded-2xl bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">No active packages yet.</p>}</div><div className="mt-6"><button type="button" className="w-full rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--orange)]" onClick={() => request(editor.editorId)} disabled={sending === editor.editorId || sentTo === editor.editorId}>{sentTo === editor.editorId ? "Request sent" : sending === editor.editorId ? "Sending..." : "Send editing request"}</button></div></Card>; })}</div></div>;
}
