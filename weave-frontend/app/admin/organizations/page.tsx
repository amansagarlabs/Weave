"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Pill } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";

type Organization = { id: number; name: string; slug: string; personal: boolean; disabled: boolean; createdBy: number; memberCount: number; createdAt: string };

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const load = useCallback(async () => { try { setOrganizations(await api<Organization[]>("/admin/organizations")); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load organizations."); } }, []);
  useEffect(() => { void load(); }, [load]);

  async function toggle(item: Organization) {
    setBusy(item.id); setMessage("");
    try { const updated = await api<Organization>(`/admin/organizations/${item.id}/${item.disabled ? "restore" : "disable"}`, { method: "PATCH" }); setOrganizations(current => current.map(value => value.id === updated.id ? updated : value)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update organization."); }
    finally { setBusy(null); }
  }

  return <SurfacePage role="admin" title="Organization management." eyebrow="Super Admin" description="Review organization membership counts and disable or restore team organizations. Personal accounts cannot be disabled here.">
    {message ? <p role="alert" className="mb-4 rounded-2xl border border-[var(--danger)]/30 bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--danger)]">{message}</p> : null}
    <Card className="overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[var(--paper)] text-xs uppercase tracking-widest text-[var(--muted)]"><tr><th className="p-4">Organization</th><th className="p-4">Type</th><th className="p-4">Members</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{organizations.length ? organizations.map(item => <tr key={item.id} className="border-t border-[var(--line)]"><td className="p-4"><div className="font-bold">{item.name}</div><div className="mt-1 text-xs text-[var(--muted)]">{item.slug}</div></td><td className="p-4">{item.personal ? "Personal" : "Team"}</td><td className="p-4">{item.memberCount}</td><td className="p-4"><Pill tone={item.disabled ? "coral" : "forest"}>{item.disabled ? "Disabled" : "Active"}</Pill></td><td className="p-4">{item.personal ? <span className="text-[var(--muted)]">Protected</span> : <button type="button" disabled={busy === item.id} onClick={() => void toggle(item)} className="font-bold text-[var(--forest)] underline">{busy === item.id ? "Updating..." : item.disabled ? "Restore" : "Disable"}</button>}</td></tr>) : <tr><td colSpan={5} className="p-6 text-[var(--muted)]">No organizations found.</td></tr>}</tbody></table></Card>
  </SurfacePage>;
}
