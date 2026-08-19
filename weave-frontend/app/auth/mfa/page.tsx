"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";

export default function MfaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("Enter your authenticator or recovery code.");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = params.get("token");
    if (!token) {
      setMessage("This MFA challenge is missing its token.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const payload = await api<{ user: { role: string } }>("/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ token, code }),
      });
      const next = params.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        router.replace(next);
        return;
      }
      router.replace(`/${String(payload.user.role).toLowerCase()}/dashboard`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The code was not accepted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6 py-12 text-[var(--ink)]">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--line)] bg-[var(--card)] p-7 shadow-[0_18px_60px_rgba(23,34,31,.08)] sm:p-9">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--muted)]">Multi-factor sign in</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.06em]">Check your code.</h1>
        <p className="mt-3 text-[var(--muted)]">Use your authenticator app or one of your recovery codes to finish signing in.</p>

        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-bold">
            Code
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              inputMode="text"
              required
              className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              placeholder="123456 or recovery code"
            />
          </label>

          {message ? (
            <p role="status" aria-live="polite" className="rounded-2xl bg-[var(--accent)]/15 px-4 py-3 text-sm font-bold text-[var(--ink)]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--orange)] transition-transform active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Checking..." : "Verify and continue →"}
          </button>
        </form>
      </div>
    </main>
  );
}
