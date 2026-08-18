"use client";

import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { Role } from "./workspace-nav";

type Notification = { id: number; title: string; detail: string; kind: string; unread: boolean; createdAt: string };

function targetFor(item: Notification, role: Role) {
  const kind = item.kind.toUpperCase();
  if (kind === "MESSAGE") return `/${role}/messages`;
  if (kind === "EDITOR_REQUEST") return role === "editor" ? "/editor/requests" : "/creator/editor-requests";
  if (kind === "PAYMENT") return role === "brand" ? "/brand/bookings" : `/${role}/earnings`;
  return `/${role}/bookings`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
}

export function NotificationMenu({ role }: { role: Role }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter((item) => item.unread).length;

  useEffect(() => {
    api<Notification[]>("/notifications").then(setItems).catch(() => undefined);
  }, []);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (open && rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function markRead(id: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
    await api(`/notifications/${id}/read`, { method: "POST" }).catch(() => undefined);
  }

  async function markAllRead() {
    const saved = await api<Notification[]>("/notifications/read-all", { method: "POST" }).catch(() => null);
    if (saved) setItems(saved);
  }

  return <div ref={rootRef} className="relative">
    <button type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[0_8px_24px_rgba(23,34,31,.06)] transition-colors hover:bg-[var(--paper)]">
      <Bell size={18} aria-hidden="true" />
      {unread ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--orange)] px-1 text-[10px] font-black text-white">{unread > 9 ? "9+" : unread}</span> : null}
    </button>
    {open ? <aside aria-label="Notifications" className="absolute right-0 top-[calc(100%+0.6rem)] z-40 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[0_18px_40px_rgba(23,34,31,.16)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4"><div><h2 className="font-black">Notifications</h2><p className="mt-1 text-xs text-[var(--muted)]">{unread ? `${unread} unread` : "You're all caught up"}</p></div><button type="button" onClick={() => void markAllRead()} disabled={!unread} className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-xs font-bold underline disabled:opacity-40"><Check size={14} />Mark all read</button></div>
      <div className="max-h-[min(28rem,65vh)] overflow-y-auto p-2">
        {items.length ? items.slice(0, 8).map((item) => <Link key={item.id} href={targetFor(item, role)} onClick={() => void markRead(item.id)} className={`block rounded-2xl px-3 py-3 transition-colors hover:bg-[var(--paper)] ${item.unread ? "bg-[var(--accent)]/10" : ""}`}><div className="flex gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.unread ? "bg-[var(--orange)]" : "bg-[var(--line)]"}`} aria-hidden="true" /><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><strong className="text-sm">{item.title}</strong><time className="shrink-0 text-[10px] font-bold text-[var(--muted)]">{dateLabel(item.createdAt)}</time></span><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{item.detail}</span></span></div></Link>) : <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">No notifications yet.</p>}
      </div>
      <div className="border-t border-[var(--line)] p-3"><Link href="/notifications" onClick={() => setOpen(false)} className="flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-bold hover:bg-[var(--paper)]">View all notifications</Link></div>
    </aside> : null}
  </div>;
}
