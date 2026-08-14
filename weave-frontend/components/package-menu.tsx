"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ButtonLink, Card, StatusBadge } from "./ui";

type ManagedPackage = { id: number; contentType: string; price: number | string; deliveryDays: number; revisionsIncluded: number; active: boolean };

export function PackageMenu({ role = "creator" }: { role?: "creator" | "editor" }) {
  const base = role === "editor" ? "/editor/gigs" : "/creator/packages";
  const [items, setItems] = useState<ManagedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState<number | null>(null);
  useEffect(() => { api<ManagedPackage[]>(base).then(setItems).catch((caught) => setError(caught instanceof Error ? `${caught.message}. Sign in as a ${role} to load packages.` : "Could not load packages.")).finally(() => setLoading(false)); }, [base, role]);
  async function archive(id: number) { setArchiving(id); setError(""); try { await api<void>(`${base}/${id}`, { method: "DELETE" }); setItems((current) => current.filter((item) => item.id !== id)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not archive package."); } finally { setArchiving(null); } }
  if (loading) return <Card><p className="text-sm font-bold text-[var(--muted)]">Loading your menu…</p></Card>;
  if (error) return <Card><p role="alert" className="text-sm font-bold text-[var(--danger)]">{error}</p><div className="mt-4"><ButtonLink href={`${base}/new`} variant="accent">Add a package</ButtonLink></div></Card>;
  if (!items.length) return <Card className="border border-dashed border-[var(--line)] text-center"><h2 className="text-2xl font-black">{role === "editor" ? "Your gig menu is ready for its first offer." : "Your menu is ready for its first offer."}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">Set a clear price, delivery promise, and revision count so people know what to ask for.</p><div className="mt-5"><ButtonLink href={`${base}/new`} variant="accent">Add your first package</ButtonLink></div></Card>;
  return <div className="grid gap-5 md:grid-cols-2">{items.map((item) => <Card key={item.id}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{role === "editor" ? "Editing gig" : "Creator package"}</p><h2 className="mt-3 text-2xl font-black">{item.contentType}</h2></div><StatusBadge status="Active" /></div><p className="mt-8 text-3xl font-black tabular-nums">₹{Number(item.price).toLocaleString("en-IN")}</p><p className="mt-1 text-sm text-[var(--muted)]">{item.deliveryDays} day delivery · {item.revisionsIncluded} revision{item.revisionsIncluded === 1 ? "" : "s"}</p><div className="mt-6 flex gap-3"><Link href={`${base}/edit?id=${item.id}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-[var(--ink)] px-4 py-2 text-sm font-bold">Edit</Link><button type="button" onClick={() => archive(item.id)} disabled={archiving === item.id} className="min-h-11 rounded-full px-4 py-2 text-sm font-bold text-[var(--muted)] underline disabled:opacity-50">{archiving === item.id ? "Archiving…" : "Archive"}</button></div></Card>)}</div>;
}
