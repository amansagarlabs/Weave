"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Pill } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";

type Policy = { id: number; role: "CREATOR" | "BRAND" | "EDITOR" | "ADMIN"; resource: string; action: string; allowed: boolean; updatedAt: string };
const roleOrder = ["CREATOR", "BRAND", "EDITOR", "ADMIN"] as const;

export default function AdminRbac() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [role, setRole] = useState<Policy["role"]>("CREATOR");
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => { try { setPolicies(await api<Policy[]>("/admin/rbac/policies")); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load policies."); } }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => policies.filter(policy => policy.role === role), [policies, role]);
  const resources = useMemo(() => [...new Set(visible.map(policy => policy.resource))], [visible]);
  const actions = ["READ", "CREATE", "UPDATE", "DELETE"];

  async function toggle(policy: Policy) {
    setBusy(policy.id); setMessage("");
    try { const updated = await api<Policy>(`/admin/rbac/policies/${policy.id}`, { method: "PATCH", body: JSON.stringify({ allowed: !policy.allowed }) }); setPolicies(current => current.map(item => item.id === updated.id ? updated : item)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update policy."); }
    finally { setBusy(null); }
  }

  return <SurfacePage role="admin" title="Role permissions." eyebrow="Super Admin" description="Control which CRUD actions each role can perform. Server-side policy checks apply to the main booking, package, profile, editor request, invoice, and message APIs.">
    <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] pb-3">{roleOrder.map(item => <button key={item} type="button" onClick={() => setRole(item)} className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-black ${role === item ? "bg-[var(--forest)] text-white" : "bg-[var(--wash)] text-[var(--muted)]"}`}>{item}</button>)}</div>
    {message ? <p role="alert" className="mt-4 rounded-2xl border border-[var(--danger)]/30 bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--danger)]">{message}</p> : null}
    <Card className="mt-6 overflow-x-auto p-0"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Resource</th>{actions.map(action => <th key={action} className="p-4 text-center">{action}</th>)}</tr></thead><tbody>{resources.map(resource => <tr key={resource} className="border-t border-[var(--line)]"><th scope="row" className="p-4 font-black">{resource}</th>{actions.map(action => { const policy = visible.find(item => item.resource === resource && item.action === action); return <td key={action} className="p-4 text-center">{policy ? <button type="button" disabled={busy === policy.id || role === "ADMIN"} onClick={() => void toggle(policy)} aria-label={`${policy.allowed ? "Disable" : "Enable"} ${role} ${resource} ${action}`} className={`inline-flex min-h-9 min-w-20 items-center justify-center rounded-full px-3 text-xs font-black transition ${policy.allowed ? "bg-[var(--accent)] text-[var(--on-bright)]" : "bg-[var(--wash)] text-[var(--muted)]"}`}>{policy.allowed ? "Allowed" : "Denied"}</button> : <span className="text-[var(--muted)]">-</span>}</td>; })}</tr>)}</tbody></table></Card>
    <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]"><Pill tone="lime">Live policy</Pill><span>Admin permissions are always enabled to prevent locking out the control plane.</span></div>
  </SurfacePage>;
}
