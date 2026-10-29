"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PublicNav } from "../../../components/public-nav";
import { Footer } from "../../../components/footer";
import { api } from "../../../lib/api";

export default function PasswordResetConfirmPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setError("This reset link is missing its token."); setBusy(false); return; }
    try {
      const result = await api<{ message: string }>("/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token, password }) });
      setMessage(result.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reset your password.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]"><PublicNav /><section className="flex min-h-[calc(100svh-77px)] items-center justify-center px-6 py-12"><div className="w-full max-w-lg rounded-[32px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_18px_60px_rgba(23,34,31,.08)]"><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--muted)]">Account access</p><h1 className="mt-4 text-4xl font-black tracking-[-.06em]">Choose a new password.</h1><p className="mt-3 text-[var(--muted)]">The link can be used once and expires shortly.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-bold">New password<input type="password" required minLength={8} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[var(--ink)]" autoComplete="new-password" /></label>{message ? <p role="status" className="rounded-2xl bg-[var(--accent)]/15 px-4 py-3 text-sm font-bold">{message}</p> : null}{error ? <p role="alert" className="rounded-2xl bg-[var(--orange)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}<button disabled={busy || Boolean(message)} className="min-h-12 w-full rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--orange)] disabled:opacity-70">{busy ? "Updating..." : "Update password"}</button>{message ? <Link href="/login" className="block text-center text-sm font-bold text-[var(--action)] underline">Go to login</Link> : null}</form></div></section><Footer compact /></main>;
}
