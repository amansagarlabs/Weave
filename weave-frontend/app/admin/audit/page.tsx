"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";

type AuditEvent = { id: number; adminUserId: number; action: string; targetType: string; targetId: number | null; details: string | null; createdAt: string };

export default function AdminAudit() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => { try { setEvents(await api<AuditEvent[]>("/admin/audit")); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load audit events."); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <SurfacePage role="admin" title="Privileged action audit." eyebrow="Super Admin" description="Recent administrative actions are recorded without storing passwords, tokens, or payment payloads.">
    {error ? <p role="alert" className="mb-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
    <Card className="overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Action</th><th className="p-4">Target</th><th className="p-4">Admin user</th><th className="p-4">Time</th></tr></thead><tbody>{events.length ? events.map(event => <tr key={event.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{event.action}<div className="mt-1 text-xs font-normal text-[var(--muted)]">{event.details}</div></td><td className="p-4">{event.targetType}{event.targetId ? ` #${event.targetId}` : ""}</td><td className="p-4">#{event.adminUserId}</td><td className="p-4 text-[var(--muted)]">{new Date(event.createdAt).toLocaleString("en-IN")}</td></tr>) : <tr><td colSpan={4} className="p-6 text-[var(--muted)]">No privileged actions recorded.</td></tr>}</tbody></table></Card>
  </SurfacePage>;
}
