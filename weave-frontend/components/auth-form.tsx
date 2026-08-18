"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authCopy } from "../lib/copy";
import { api } from "../lib/api";

type Role = "creator" | "brand" | "editor";
type AuthMode = "login" | "signup";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function AuthForm({ mode, role = "creator" }: { mode: AuthMode; role?: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<Role>(role);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const payload = await api<{ message?: string; user: { role: string } }>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(mode === "login" ? { email, password } : { email, password, role: selectedRole }) });

      if (mode === "signup") {
        setNotice(payload.message ?? "Check your email to activate your account.");
        return;
      }

      const requestedPath = searchParams.get("next");
      const destination =
        mode === "login" && requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : mode === "login"
            ? `/${String(payload.user.role).toLowerCase()}/dashboard`
            : `/${selectedRole}/onboarding`;
      router.push(destination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-10 space-y-5 text-[var(--ink)]" onSubmit={submit}>
      {mode === "signup" ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-[var(--muted)]">I am joining as</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {authCopy.roleOptions.map((option) => {
              const active = selectedRole === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedRole(option.value)}
                  className={`rounded-2xl border-2 p-4 text-left transition-transform active:scale-[.98] ${
                    active ? "border-[var(--forest)] bg-[var(--accent)] text-[var(--on-bright)]" : "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
                  }`}
                >
                  <span className="block text-sm font-black uppercase tracking-[.14em]">{option.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{option.copy}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <label className="block text-sm font-bold">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          placeholder="you@example.com"
        />
      </label>

      {mode === "login" ? (
        <div className="-mt-2 text-right text-sm font-bold">
          <Link href="/password-reset" className="text-[var(--action)] underline">Forgot password?</Link>
        </div>
      ) : null}

      <label className="block text-sm font-bold">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          placeholder="Enter your password"
        />
      </label>

      {notice ? <p role="status" aria-live="polite" className="rounded-2xl bg-[var(--accent)]/15 px-4 py-3 text-sm font-bold text-[var(--ink)]">{notice}</p> : null}
      {error ? (
        <p role="alert" aria-live="polite" className="rounded-2xl bg-[var(--orange)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--orange)] transition-transform active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "One moment..." : mode === "login" ? authCopy.login.submit : authCopy.signup.submit}
      </button>

      {mode === "login" && process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true" ? (
        <a href={`${API_URL}/oauth2/authorization/google`} className="flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 py-3 text-sm font-bold text-[var(--ink)]">
          Continue with Google
        </a>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
        {mode === "login" ? (
          <Link href="/signup" className="text-[var(--action)] underline">
            {authCopy.login.switchLink}
          </Link>
        ) : (
          <Link href="/login" className="text-[var(--action)] underline">
            {authCopy.signup.switchLink}
          </Link>
        )}
        <Link href="/help" className="text-[var(--muted)] underline">
          Need help?
        </Link>
      </div>
    </form>
  );
}
