"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, Pill } from "./ui";

type BillingAccount = {
  plan: string;
  provider: string;
  status: string;
  portalUrl: string;
  freePlan: boolean;
  message: string;
};

export function BillingSettingsCard() {
  const [account, setAccount] = useState<BillingAccount | null>(null);
  const [plan, setPlan] = useState("FREE");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<BillingAccount>("/billing")
      .then((response) => {
        setAccount(response);
        setPlan(response.plan);
        setMessage(response.message);
      })
      .catch((caught) => setMessage(caught instanceof Error ? caught.message : "Could not load billing settings."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await api<BillingAccount>("/billing/plan", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      setAccount(response);
      setMessage(response.message);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update billing plan.");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setMessage("");
    try {
      const response = await api<BillingAccount>("/billing/portal", { method: "POST" });
      window.location.assign(response.portalUrl);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not open billing portal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Billing</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-.05em]">Subscription and portal</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Free plans complete internally with no gateway call. Paid plans use UniBee only.</p>
        </div>
        <Pill tone={account?.freePlan ? "forest" : "lime"}>{account?.freePlan ? "Free plan" : `${account?.provider ?? "None"} provider`}</Pill>
      </div>

      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Plan
          <select value={plan} onChange={(event) => setPlan(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-base outline-none">
            <option value="FREE">FREE</option>
            <option value="CREATOR_PRO">CREATOR_PRO</option>
            <option value="AGENCY">AGENCY</option>
          </select>
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">
            {busy ? "Saving..." : "Save plan"}
          </button>
          <button type="button" onClick={openPortal} disabled={busy} className="min-h-12 rounded-full border-2 border-[var(--ink)] px-6 font-bold disabled:opacity-60">
            Open portal
          </button>
        </div>
      </form>

      {account ? (
        <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:grid-cols-3">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Status</p><p className="mt-1 font-black">{account.status}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Provider</p><p className="mt-1 font-black">{account.provider}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Portal</p><p className="mt-1 break-all text-sm font-mono">{account.portalUrl}</p></div>
        </div>
      ) : null}

      {message ? <p role="status" className="text-sm font-bold text-[var(--forest)]">{message}</p> : null}
    </Card>
  );
}
