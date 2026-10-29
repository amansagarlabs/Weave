"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Card } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";
import { useAppToast } from "../../../components/hooks/use-app-toast";

type Asset = { id: number; title: string; assetUrl: string; contentType: string; sizeBytes: number; createdAt: string };

export default function CreatorPortfolio() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [message, setMessage] = useState("Loading portfolio...");
  const [editing, setEditing] = useState<Asset | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [replacement, setReplacement] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);
  const [busy, setBusy] = useState(false);
  const { success, error: notifyError } = useAppToast();

  function loadAssets() {
    return api<Asset[]>("/creator/portfolio").then((items) => {
      setAssets(items);
      setMessage(items.length ? "" : "Your uploaded work will appear here.");
    });
  }

  useEffect(() => {
    loadAssets()
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load portfolio."));
  }, []);

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("title", editTitle.trim());
      if (replacement) body.append("file", replacement);
      await api(`/creator/portfolio/${editing.id}`, { method: "PUT", body });
      setEditing(null);
      setReplacement(null);
      success("Portfolio item updated", "Your portfolio changes are now live.");
      await loadAssets();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not update portfolio item.";
      notifyError("Update failed", message);
      setMessage(message);
    } finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/creator/portfolio/${deleting.id}`, { method: "DELETE" });
      setAssets((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      success("Portfolio item deleted", "The work was removed from your public profile.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not delete portfolio item.";
      notifyError("Delete failed", message);
      setMessage(message);
    } finally { setBusy(false); }
  }

  return <SurfacePage role="creator" title="Your portfolio." action="Upload work" actionHref="/creator/portfolio/upload" description="Give people a feel for your range. You can update visibility any time.">
    {message ? <Card><p className="text-sm font-bold text-[var(--muted)]">{message}</p></Card> : null}
    {assets.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{assets.map((asset) => <Card key={asset.id} className="overflow-hidden p-0"><div className="aspect-square bg-[var(--ink)]">{asset.contentType.startsWith("video/") ? <video className="h-full w-full object-cover" src={asset.assetUrl} controls preload="metadata" /> : <img className="h-full w-full object-cover" src={asset.assetUrl} alt={asset.title} />}</div><div className="p-4"><span className="text-sm font-bold">{asset.title}</span><p className="mt-1 text-xs text-[var(--muted)]">{new Date(asset.createdAt).toLocaleDateString("en-IN")}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setEditing(asset); setEditTitle(asset.title); setReplacement(null); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-xs font-bold hover:bg-[var(--paper)]"><Pencil size={14} aria-hidden="true" />Edit</button><button type="button" onClick={() => setDeleting(asset)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--orange)] px-3 text-xs font-bold text-[var(--orange)] hover:bg-[var(--orange)]/10"><Trash2 size={14} aria-hidden="true" />Delete</button></div></div></Card>)}</div> : null}
    {editing ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/45 px-5" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="edit-portfolio-title" className="w-full max-w-lg rounded-3xl bg-[var(--card)] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Edit portfolio item</p><h2 id="edit-portfolio-title" className="mt-2 text-2xl font-black">Update your work</h2></div><button type="button" aria-label="Close edit dialog" onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-[var(--paper)]"><X size={18} /></button></div><form onSubmit={saveEdit} className="mt-6 space-y-5"><label className="block text-sm font-bold">Portfolio title<input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" /></label><label className="block text-sm font-bold">Replace content<span className="mt-2 block text-xs font-normal text-[var(--muted)]">Optional. Leave empty to keep the current file.</span><input type="file" accept="image/*,video/*" onChange={(event) => setReplacement(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-full border border-[var(--line)] px-5 text-sm font-bold">Cancel</button><button type="submit" disabled={busy} className="min-h-11 rounded-full bg-[var(--forest)] px-5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Saving..." : "Save changes"}</button></div></form></div></div> : null}
    {deleting ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/45 px-5" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="delete-portfolio-title" className="w-full max-w-md rounded-3xl bg-[var(--card)] p-6 shadow-2xl"><h2 id="delete-portfolio-title" className="text-2xl font-black">Delete this portfolio item?</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><strong>{deleting.title}</strong> will be removed from your portfolio and public profile. This cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} className="min-h-11 rounded-full border border-[var(--line)] px-5 text-sm font-bold">Cancel</button><button type="button" disabled={busy} onClick={() => void confirmDelete()} className="min-h-11 rounded-full bg-[var(--orange)] px-5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Deleting..." : "Delete item"}</button></div></div></div> : null}
  </SurfacePage>;
}
