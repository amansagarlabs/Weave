"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Organization = {
  id: number;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  active: boolean;
};

export function OrganizationSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<Organization[]>("/organizations")
      .then(setOrganizations)
      .catch(() => setError("Organizations are unavailable"));
  }, []);

  const active = organizations.find(organization => organization.active) ?? organizations[0];

  async function switchOrganization(id: number) {
    setError(null);
    try {
      await api(`/organizations/${id}/switch`, { method: "POST" });
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not switch organization");
    }
  }

  async function createOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await api("/organizations", { method: "POST", body: JSON.stringify({ name }) });
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create organization");
    }
  }

  if (collapsed) {
    return (
      <button type="button" title={active?.name ?? "Organization"} aria-label={active?.name ?? "Organization"} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-black text-white">
        {active?.name.slice(0, 1).toUpperCase() ?? "O"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button type="button" className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 text-left hover:bg-white/15" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{active?.name ?? "Choose organization"}</span>
          <span className="block text-[11px] text-white/55">{active?.role ?? "Account"}</span>
        </span>
        <ChevronsUpDown size={16} className="shrink-0 text-white/60" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-2 text-[var(--ink)] shadow-xl">
          {organizations.map(organization => (
            <button key={organization.id} type="button" className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-semibold hover:bg-[var(--wash)]" onClick={() => void switchOrganization(organization.id)}>
              <span className="truncate">{organization.name}</span>
              {organization.active ? <Check size={15} aria-label="Active organization" /> : null}
            </button>
          ))}
          <div className="my-2 border-t border-[var(--line)]" />
          {creating ? (
            <form className="space-y-2 p-1" onSubmit={createOrganization}>
              <label className="sr-only" htmlFor="new-organization-name">Organization name</label>
              <input id="new-organization-name" value={name} onChange={event => setName(event.target.value)} placeholder="Organization name" className="min-h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm" autoFocus />
              <div className="flex gap-2">
                <button type="submit" className="min-h-9 flex-1 rounded-xl bg-[var(--forest)] px-3 text-xs font-bold text-white">Create</button>
                <button type="button" className="min-h-9 rounded-xl px-3 text-xs font-bold" onClick={() => setCreating(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button type="button" className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-bold hover:bg-[var(--wash)]" onClick={() => setCreating(true)}>
              <Plus size={15} aria-hidden="true" /> Create organization
            </button>
          )}
          {error ? <p className="px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
