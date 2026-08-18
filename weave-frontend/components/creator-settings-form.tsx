"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { SelectField } from "./form-controls";
import { Card, Pill, StatusBadge } from "./ui";

type CurrentUser = { id: number; email: string; phone: string | null; role: string; locale: string; notificationPreference: string };
type CreatorProfile = { displayName: string; publicSlug: string; categoriesJson: string | null; platformsJson: string | null; city: string | null; contentLanguage: string | null; availabilityStatus: string | null };

const localeOptions = [
  { value: "en-IN", label: "English (India)" },
  { value: "hi-IN", label: "Hindi (India)" },
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
] as const;

const notificationOptions = [
  { value: "EMAIL", label: "Email" },
  { value: "IN_APP", label: "In-app" },
  { value: "BOTH", label: "Email + in-app" },
] as const;

function list(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function CreatorSettingsForm() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [locale, setLocale] = useState("en-IN");
  const [notificationPreference, setNotificationPreference] = useState("EMAIL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([api<CurrentUser>("/users/me"), api<CreatorProfile>("/creator/profile/me")])
      .then(([loadedUser, loadedProfile]) => {
        setUser(loadedUser);
        setProfile(loadedProfile);
        setLocale(loadedUser.locale || "en-IN");
        setNotificationPreference(loadedUser.notificationPreference || "EMAIL");
      })
      .catch((caught) => setMessage(caught instanceof Error ? `${caught.message}. Complete creator onboarding first.` : "Could not load settings right now."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const saved = await api<CurrentUser>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ locale, notificationPreference }),
      });
      setUser(saved);
      setMessage("Settings saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="rounded-2xl bg-[var(--card)] p-6 text-sm font-bold text-[var(--muted)]">Loading your settings…</div>;

  const categories = list(profile?.categoriesJson);
  const platforms = list(profile?.platformsJson);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <form onSubmit={submit} className="rounded-2xl bg-[var(--card)] p-5 shadow-[0_8px_24px_rgba(23,34,31,.06)]">
        <h2 className="text-xl font-black tracking-[-.04em]">Account preferences</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Change the parts of your account that affect how Weave talks to you.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ReadOnlyField label="Email" value={user?.email ?? "Loading..."} />
          <ReadOnlyField label="Role" value={user?.role ?? "CREATOR"} />
          <div className="md:col-span-2">
            <SelectField
              label="Language and region"
              value={locale}
              onChange={setLocale}
              options={localeOptions}
              hint="This updates the locale stored on your user account."
            />
          </div>
          <div className="md:col-span-2">
            <SelectField
              label="Notification preference"
              value={notificationPreference}
              onChange={setNotificationPreference}
              options={notificationOptions}
              hint="This preference is stored on your account and can be used by future notification routing."
            />
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-sm font-bold">Notifications</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Notification routing will follow the preference you set here. Future channels can reuse the same account setting.</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : "Save settings ↗"}</button>
          {message ? <p role={message === "Settings saved." ? "status" : "alert"} className={`text-sm font-bold ${message === "Settings saved." ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>{message}</p> : null}
        </div>
      </form>
      <aside className="lg:sticky lg:top-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-[var(--forest)] px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Account snapshot</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">What this account looks like inside Weave.</h2>
          </div>
          <div className="p-5">
            <div className="rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Public profile</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-.06em]">{profile?.displayName ?? "Creator name"}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{profile?.city || "City"} · @{profile?.publicSlug || "your-slug"}</p>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--muted)]">Visible profile bits</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.length ? categories.map((category) => <Pill key={category}>{category}</Pill>) : <span className="text-sm text-[var(--muted)]">No categories saved yet.</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {platforms.length ? platforms.map((platform) => <Pill key={platform}>{platform}</Pill>) : null}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--muted)]">Account status</p>
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge status={profile?.availabilityStatus || "AVAILABLE"} />
                <Pill tone="forest">{user?.locale || locale}</Pill>
                <Pill tone="lime">{notificationOptions.find((option) => option.value === (user?.notificationPreference || notificationPreference))?.label ?? "Email"}</Pill>
              </div>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="text-sm font-bold">
      {label}
      <input
        value={value}
        readOnly
        className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal text-[var(--muted)] outline-none"
      />
    </label>
  );
}
