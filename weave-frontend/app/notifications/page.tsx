"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { SurfacePage } from "../../components/surface";
import { Card, Pill } from "../../components/ui";
import { Modal } from "../../components/modal";

type Notification = {
  id: number;
  title: string;
  detail: string;
  kind: string;
  unread: boolean;
  createdAt: string;
};

function formatDate(value: string) {
  const created = new Date(value);
  const now = new Date();
  const sameDay = created.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay) return "Today";
  if (created.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(created);
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Notification[]>("/notifications")
      .then(setNotifications)
      .catch((caught) => setMessage(caught instanceof Error ? caught.message : "Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    setBusy(true);
    setMessage("");
    try {
      const saved = await api<Notification[]>("/notifications/read-all", { method: "POST" });
      setNotifications(saved);
      setConfirmOpen(false);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update notifications.");
    } finally {
      setBusy(false);
    }
  }

  const unread = notifications.filter((item) => item.unread).length;

  return (
    <SurfacePage role="creator" title="Notifications." eyebrow="Shared workspace" description="Updates that need your attention, grouped in one place.">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="font-black">All updates</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {loading ? "Loading notifications..." : unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You're all caught up."}
            </p>
          </div>
          <button type="button" onClick={() => setConfirmOpen(true)} disabled={!unread || loading} className="min-h-11 rounded-full px-3 text-sm font-bold underline disabled:cursor-not-allowed disabled:opacity-40">
            Mark all as read
          </button>
        </div>
        {message ? <p role="alert" className="mt-4 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-bold">{message}</p> : null}
        <div className="divide-y divide-[var(--line)]">
          {notifications.length ? notifications.map((item) => (
            <article key={item.id} className="flex gap-4 py-5">
              <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.unread ? "bg-[var(--orange)]" : "bg-[var(--line)]"}`} aria-label={item.unread ? "Unread" : "Read"} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black">{item.title}</h3>
                  <Pill>{formatDate(item.createdAt)}</Pill>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
              </div>
            </article>
          )) : !loading ? <div className="py-8 text-sm text-[var(--muted)]">No notifications yet.</div> : null}
        </div>
      </Card>
      <Modal
        open={confirmOpen}
        title="Mark all notifications as read?"
        description="This updates your notification state on the server. You can still open each item later."
        onClose={() => setConfirmOpen(false)}
      >
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="min-h-12 rounded-full border-2 border-[var(--ink)] px-5 py-3 text-sm font-bold transition-transform active:scale-[.97]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={markAllRead}
            disabled={busy}
            className="min-h-12 rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition-transform active:scale-[.97] disabled:opacity-60"
          >
            {busy ? "Saving..." : "Mark all read"}
          </button>
        </div>
      </Modal>
    </SurfacePage>
  );
}
