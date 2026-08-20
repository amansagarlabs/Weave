"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";

type AdminAuditEvent = { id: number; adminUserId: number; action: string; targetType: string; targetId: number | null; details: string | null; createdAt: string };
type AuthAuditEvent = { id: number; userId: number | null; eventType: string; outcome: "SUCCESS" | "FAILURE" | "CHALLENGE"; details: string | null; createdAt: string };
type AuditView = "privileged" | "authentication";

function outcomeClass(outcome: AuthAuditEvent["outcome"]) {
  if (outcome === "FAILURE") return "bg-[var(--orange)]/15 text-[var(--orange)]";
  if (outcome === "CHALLENGE") return "bg-[var(--accent)] text-[var(--on-bright)]";
  return "bg-[color-mix(in_srgb,var(--forest)_12%,transparent)] text-[var(--forest)]";
}

export default function AdminAudit() {
  const [view, setView] = useState<AuditView>("privileged");
  const [adminEvents, setAdminEvents] = useState<AdminAuditEvent[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthAuditEvent[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const results = await Promise.allSettled([
      api<AdminAuditEvent[]>("/admin/audit"),
      api<AuthAuditEvent[]>("/admin/audit/auth"),
    ]);
    if (results[0].status === "fulfilled") setAdminEvents(results[0].value);
    if (results[1].status === "fulfilled") setAuthEvents(results[1].value);
    const unavailable = results.filter((result) => result.status === "rejected").length;
    if (unavailable) setError(`${unavailable} audit source${unavailable === 1 ? " is" : "s are"} unavailable.`);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <SurfacePage role="admin" title="Security audit." eyebrow="Super Admin" description="Privileged and authentication events are recorded without passwords, tokens, MFA codes, raw IP addresses, or raw browser identifiers.">
    {error ? <p role="alert" className="mb-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
    <div className="mb-5 flex gap-2 border-b border-[var(--line)] pb-3" role="tablist" aria-label="Audit event type">
      <button type="button" role="tab" aria-selected={view === "privileged"} onClick={() => setView("privileged")} className={`rounded-full px-4 text-sm font-black ${view === "privileged" ? "bg-[var(--forest)] text-white" : "bg-[var(--card)] text-[var(--muted)]"}`}>Privileged actions</button>
      <button type="button" role="tab" aria-selected={view === "authentication"} onClick={() => setView("authentication")} className={`rounded-full px-4 text-sm font-black ${view === "authentication" ? "bg-[var(--forest)] text-white" : "bg-[var(--card)] text-[var(--muted)]"}`}>Authentication</button>
    </div>

    {view === "privileged" ? <Card className="overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Action</th><th className="p-4">Target</th><th className="p-4">Admin user</th><th className="p-4">Time</th></tr></thead><tbody>{adminEvents.length ? adminEvents.map((event) => <tr key={event.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{event.action.replaceAll("_", " ")}<div className="mt-1 text-xs font-normal text-[var(--muted)]">{event.details}</div></td><td className="p-4">{event.targetType}{event.targetId ? ` #${event.targetId}` : ""}</td><td className="p-4">#{event.adminUserId}</td><td className="p-4 text-[var(--muted)]">{new Date(event.createdAt).toLocaleString("en-IN")}</td></tr>) : <tr><td colSpan={4} className="p-6 text-[var(--muted)]">No privileged actions recorded.</td></tr>}</tbody></table></Card> : null}

    {view === "authentication" ? <Card className="overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Event</th><th className="p-4">Outcome</th><th className="p-4">User</th><th className="p-4">Safe detail</th><th className="p-4">Time</th></tr></thead><tbody>{authEvents.length ? authEvents.map((event) => <tr key={event.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{event.eventType.replaceAll("_", " ")}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${outcomeClass(event.outcome)}`}>{event.outcome}</span></td><td className="p-4">{event.userId ? `#${event.userId}` : "Unresolved"}</td><td className="p-4 text-xs text-[var(--muted)]">{event.details ?? "-"}</td><td className="p-4 text-[var(--muted)]">{new Date(event.createdAt).toLocaleString("en-IN")}</td></tr>) : <tr><td colSpan={5} className="p-6 text-[var(--muted)]">No authentication events recorded.</td></tr>}</tbody></table></Card> : null}
  </SurfacePage>;
}
