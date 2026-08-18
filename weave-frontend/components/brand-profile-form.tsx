"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, Pill } from "./ui";

type BrandProfile = { companyName: string; industry: string | null; gstin: string | null };

export function BrandProfileForm({ mode = "onboarding" }: { mode?: "onboarding" | "settings" }) {
  const [values, setValues] = useState({ companyName: "", industry: "", gstin: "" });
  const [loading, setLoading] = useState(mode === "settings");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode !== "settings") return;
    api<BrandProfile>("/brand/profile/me")
      .then((profile) => setValues({ companyName: profile.companyName, industry: profile.industry ?? "", gstin: profile.gstin ?? "" }))
      .catch((caught) => setMessage(caught instanceof Error ? `${caught.message}. Complete brand onboarding first.` : "Could not load brand profile."))
      .finally(() => setLoading(false));
  }, [mode]);

  function update(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/brand/profile", { method: "POST", body: JSON.stringify(values) });
      setMessage("Brand profile saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not save brand profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="rounded-2xl bg-[var(--card)] p-6 text-sm font-bold text-[var(--muted)]">Loading your brand profile…</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <form onSubmit={submit} className="rounded-2xl bg-[var(--card)] p-5 shadow-[0_8px_24px_rgba(23,34,31,.06)]">
        <h2 className="text-xl font-black tracking-[-.04em]">{mode === "settings" ? "Company and account" : "Company details"}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Give creators enough context to see the people behind the brief.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Company name" value={values.companyName} required onChange={(value) => update("companyName", value)} />
          <Field label="Industry" value={values.industry} onChange={(value) => update("industry", value)} />
          <Field label="GSTIN (optional)" value={values.gstin} onChange={(value) => update("gstin", value)} hint="Add this when your billing details are ready." />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : mode === "settings" ? "Save changes ↗" : "Save profile and continue ↗"}</button>
          {message ? <p role={message === "Brand profile saved." ? "status" : "alert"} className={`text-sm font-bold ${message === "Brand profile saved." ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>{message}</p> : null}
        </div>
      </form>
      <aside className="lg:sticky lg:top-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-[var(--forest)] px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Live preview</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">This is the brand presence creators will read.</h2>
          </div>
          <div className="p-5">
            <div className="rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Public brand card</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-.06em]">{values.companyName || "Company name"}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{values.industry || "Industry"} · {values.gstin ? "Billing ready" : "GSTIN optional"}</p>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--muted)]">Visible details</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>{values.companyName || "Company"}</Pill>
                {values.industry ? <Pill tone="lime">{values.industry}</Pill> : <Pill tone="default">Industry open</Pill>}
                {values.gstin ? <Pill tone="forest">GSTIN set</Pill> : <Pill tone="default">GSTIN optional</Pill>}
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="text-sm font-bold">Creator trust note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Creators see enough company context to decide whether the brief feels real and relevant before they reply.</p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, required = false, hint }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; hint?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <label htmlFor={id} className="text-sm font-bold">
      {label}
      <input
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]"
      />
      {hint ? <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}
