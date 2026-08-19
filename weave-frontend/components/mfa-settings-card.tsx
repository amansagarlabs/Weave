"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, Pill } from "./ui";

type CurrentUser = { email: string; mfaEnabled: boolean };
type MfaSetupResponse = { secret: string; otpauthUri: string; recoveryCodes: string[]; message: string };

export function MfaSettingsCard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<MfaSetupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<CurrentUser>("/users/me")
      .then(setUser)
      .catch((caught) => setMessage(caught instanceof Error ? caught.message : "Could not load MFA settings."))
      .finally(() => setLoading(false));
  }, []);

  async function beginSetup() {
    setBusy(true);
    setMessage("");
    try {
      const response = await api<MfaSetupResponse>("/auth/mfa/setup", { method: "POST" });
      setSetup(response);
      setCode("");
      setMessage("Scan the secret, then enter a code to enable MFA.");
      setUser((current) => current ? { ...current, mfaEnabled: false } : current);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not start MFA setup.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setup && !user?.mfaEnabled) return;
    setBusy(true);
    setMessage("");
    try {
      if (user?.mfaEnabled) {
        await api("/auth/mfa/disable", { method: "POST", body: JSON.stringify({ code }) });
        setUser((current) => current ? { ...current, mfaEnabled: false } : current);
        setMessage("Multi-factor authentication is disabled.");
        return;
      }
      await api("/auth/mfa/enable", { method: "POST", body: JSON.stringify({ code }) });
      setUser((current) => current ? { ...current, mfaEnabled: true } : current);
      setSetup(null);
      setCode("");
      setMessage("Multi-factor authentication is enabled.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update MFA.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <Card><p className="text-sm font-bold text-[var(--muted)]">Loading MFA settings...</p></Card>;
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Security</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-.05em]">Multi-factor authentication</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Use an authenticator app or recovery codes to make password, magic-link, and Google sign-ins require a second step.</p>
        </div>
        <Pill tone={user?.mfaEnabled ? "forest" : "coral"}>{user?.mfaEnabled ? "Enabled" : "Disabled"}</Pill>
      </div>

      {!user?.mfaEnabled && !setup ? (
        <button
          type="button"
          onClick={beginSetup}
          disabled={busy}
          className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60"
        >
          {busy ? "Starting..." : "Start MFA setup"}
        </button>
      ) : null}

      {setup ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4">
          <div>
            <p className="text-sm font-bold">Secret</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 text-sm font-mono">{setup.secret}</p>
          </div>
          <div>
            <p className="text-sm font-bold">otpauth URI</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 text-xs font-mono">{setup.otpauthUri}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Recovery codes</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {setup.recoveryCodes.map((item) => (
                <span key={item} className="rounded-xl bg-white px-4 py-3 text-sm font-mono">{item}</span>
              ))}
            </div>
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">Copy the recovery codes now. They will not be shown again.</p>
        </div>
      ) : null}

      {(setup || user?.mfaEnabled) ? (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold">
            Verification code
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
          <button
            type="submit"
            disabled={busy}
            className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : user?.mfaEnabled ? "Disable MFA" : "Enable MFA"}
          </button>
        </form>
      ) : null}

      {message ? (
        <p role={message.includes("enabled") || message.includes("disabled") ? "status" : "alert"} className={`text-sm font-bold ${message.includes("enabled") || message.includes("disabled") ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>
          {message}
        </p>
      ) : null}
    </Card>
  );
}
