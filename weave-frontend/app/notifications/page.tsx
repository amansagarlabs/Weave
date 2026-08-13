"use client";

import { useState } from "react";
import { SurfacePage } from "../../components/surface";
import { Card, Pill } from "../../components/ui";

const initialNotifications = [
  { id: 1, title: "Your profile is ready for a final pass.", detail: "Add a package or portfolio item to help the right people understand your offer.", date: "Today", unread: true },
  { id: 2, title: "Payment-link status stays visible to everyone.", detail: "Weave never describes payment links as escrow or held funds.", date: "Yesterday", unread: false },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter((item) => item.unread).length;
  function markAllRead() { setNotifications((items) => items.map((item) => ({ ...item, unread: false }))); }
  return <SurfacePage role="creator" title="Notifications." eyebrow="Shared workspace" description="Updates that need your attention, grouped in one place."><Card><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4"><div><h2 className="font-black">All updates</h2><p className="mt-1 text-sm text-[var(--muted)]">{unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You’re all caught up."}</p></div><button type="button" onClick={markAllRead} disabled={!unread} className="min-h-11 rounded-full px-3 text-sm font-bold underline disabled:cursor-not-allowed disabled:opacity-40">Mark all as read</button></div><div className="divide-y divide-[var(--line)]">{notifications.map((item) => <article key={item.id} className="flex gap-4 py-5"><div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.unread ? "bg-[var(--orange)]" : "bg-[var(--line)]"}`} aria-label={item.unread ? "Unread" : "Read"} /><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">{item.title}</h3><Pill>{item.date}</Pill></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p></div></article>)}</div></Card></SurfacePage>;
}
