"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Confirming your email...");
  const [error, setError] = useState(false);
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setError(true); setMessage("This verification link is missing its token."); return; }
    fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, { credentials: "include" })
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Verification failed"); setMessage(payload.message); })
      .catch((caught) => { setError(true); setMessage(caught instanceof Error ? caught.message : "Verification failed"); });
  }, []);
  return <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6 text-center text-[var(--ink)]"><div className="w-full max-w-md rounded-[32px] border border-[var(--line)] bg-[var(--card)] p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--muted)]">Weave</p><h1 className="mt-5 text-4xl font-black tracking-[-.06em]">{error ? "Link unavailable" : "Email confirmed"}</h1><p className="mt-4 text-[var(--muted)]">{message}</p><Link href="/login" className="mt-7 inline-flex rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-bold text-white">Go to login</Link></div></main>;
}
