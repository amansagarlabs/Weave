"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Pill } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";

type OutboxEvent = {
  id: string;
  eventType: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

type WebhookEvent = {
  id: string;
  providerEventId: string;
  eventType: string;
  invoiceId: number | null;
  status: string;
  attempts: number;
  lastError: string | null;
  receivedAt: string;
  processedAt: string | null;
};

function tone(status: string) {
  return ["FAILED", "DEAD_LETTER", "REJECTED"].includes(status) ? "coral" as const : "forest" as const;
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN") : "-";
}

export default function AdminOperations() {
  const [outbox, setOutbox] = useState<OutboxEvent[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [outboxEvents, webhookEvents] = await Promise.all([
        api<OutboxEvent[]>("/admin/operations/outbox"),
        api<WebhookEvent[]>("/admin/operations/webhooks"),
      ]);
      setOutbox(outboxEvents);
      setWebhooks(webhookEvents);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load operations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function retry(id: string) {
    setBusy(id);
    setMessage("");
    try {
      const updated = await api<OutboxEvent>(`/admin/operations/outbox/retry/${id}`, { method: "POST" });
      setOutbox((current) => current.map((event) => event.id === updated.id ? updated : event));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not requeue the event.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SurfacePage role="admin" title="Operations and delivery." eyebrow="Admin" description="Inspect notification outbox and payment webhook delivery without exposing payloads or secrets.">
      {message ? <p role="alert" className="mt-4 rounded-2xl border border-[var(--danger)]/30 bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--danger)]">{message}</p> : null}

      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Notifications</p>
            <h2 className="mt-2 text-2xl font-black">Outbox delivery</h2>
          </div>
          <button type="button" onClick={() => void load()} className="text-sm font-bold text-[var(--forest)] underline">Refresh</button>
        </div>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Event</th><th className="p-4">Status</th><th className="p-4">Attempts</th><th className="p-4">Created</th><th className="p-4">Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-6 text-[var(--muted)]">Loading operations...</td></tr> : outbox.length ? outbox.map((event) => <tr key={event.id} className="border-t border-[var(--line)]"><td className="p-4"><div className="font-bold">{event.eventType}</div><div className="mt-1 max-w-[360px] truncate text-xs text-[var(--danger)]">{event.lastError ?? "No delivery error"}</div></td><td className="p-4"><Pill tone={tone(event.status)}>{event.status}</Pill></td><td className="p-4">{event.attempts}</td><td className="p-4 text-[var(--muted)]">{date(event.createdAt)}</td><td className="p-4">{["FAILED", "DEAD_LETTER"].includes(event.status) ? <button type="button" disabled={busy === event.id} onClick={() => void retry(event.id)} className="font-bold text-[var(--forest)] underline">{busy === event.id ? "Retrying..." : "Retry"}</button> : "-"}</td></tr>) : <tr><td colSpan={5} className="p-6 text-[var(--muted)]">No outbox events recorded.</td></tr>}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-10">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Payments</p>
        <h2 className="mt-2 text-2xl font-black">Webhook delivery</h2>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Event</th><th className="p-4">Invoice</th><th className="p-4">Status</th><th className="p-4">Attempts</th><th className="p-4">Received</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan={5} className="p-6 text-[var(--muted)]">Loading webhooks...</td></tr> : webhooks.length ? webhooks.map((event) => <tr key={event.id} className="border-t border-[var(--line)]"><td className="p-4"><div className="font-bold">{event.eventType}</div><div className="mt-1 max-w-[300px] truncate text-xs text-[var(--muted)]">{event.providerEventId}</div><div className="mt-1 max-w-[360px] truncate text-xs text-[var(--danger)]">{event.lastError ?? ""}</div></td><td className="p-4">{event.invoiceId ? `#${event.invoiceId}` : "-"}</td><td className="p-4"><Pill tone={tone(event.status)}>{event.status}</Pill></td><td className="p-4">{event.attempts}</td><td className="p-4 text-[var(--muted)]">{date(event.receivedAt)}</td></tr>) : <tr><td colSpan={5} className="p-6 text-[var(--muted)]">No webhook events recorded.</td></tr>}</tbody>
          </table>
        </Card>
      </section>
    </SurfacePage>
  );
}
