"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { CategoryPickerField } from "./category-picker";
import { PlatformEntriesField, parsePlatformEntries, sanitizePlatformEntries, type PlatformEntry } from "./platform-entries";
import { Card, Pill, StatusBadge } from "./ui";
type Profile = { displayName: string; publicSlug: string; categoriesJson: string | null; platformsJson: string | null; city: string | null; contentLanguage: string | null; availabilityStatus: string | null };

function parseList(value: string | null) { try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }

export function CreatorProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState({ displayName: "", publicSlug: "", city: "", contentLanguage: "", availabilityStatus: "AVAILABLE" });
  const [platforms, setPlatforms] = useState<PlatformEntry[]>([{ platform: "", handle: "" }]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Profile>("/creator/profile/me")
      .then((data) => {
        const loadedPlatforms = parsePlatformEntries(data.platformsJson);
        setProfile({ displayName: data.displayName, publicSlug: data.publicSlug, city: data.city ?? "", contentLanguage: data.contentLanguage ?? "", availabilityStatus: data.availabilityStatus ?? "AVAILABLE" });
        setPlatforms(loadedPlatforms.length ? loadedPlatforms : [{ platform: "", handle: "" }]);
        setSelected(parseList(data.categoriesJson));
      })
      .catch((caught) => setMessage(caught instanceof Error ? `${caught.message}. Complete onboarding first if this is a new account.` : "Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  function update(name: keyof typeof profile, value: string) { setProfile((current) => ({ ...current, [name]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(""); try { await api("/creator/profile", { method: "POST", body: JSON.stringify({ displayName: profile.displayName, publicSlug: profile.publicSlug, city: profile.city, contentLanguage: profile.contentLanguage, availabilityStatus: profile.availabilityStatus, categoriesJson: JSON.stringify(selected), platformsJson: JSON.stringify(sanitizePlatformEntries(platforms)) }) }); setMessage("Profile saved."); router.refresh(); } catch (caught) { setMessage(caught instanceof Error ? caught.message : "Could not save your profile."); } finally { setBusy(false); } }

  if (loading) return <div className="rounded-2xl bg-[var(--card)] p-6 text-sm font-bold text-[var(--muted)]">Loading your profile…</div>;
  const previewPlatforms = sanitizePlatformEntries(platforms);
  const previewCategories = selected.length ? selected : ["Your categories will show here"];
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <form onSubmit={submit} className="rounded-2xl bg-[var(--card)] p-5 shadow-[0_8px_24px_rgba(23,34,31,.06)]" noValidate>
        <h2 className="text-xl font-black tracking-[-.04em]">Profile details</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Keep your public page honest and easy to understand.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Display name" value={profile.displayName} onChange={(value) => update("displayName", value)} required />
          <Field label="Public profile slug" value={profile.publicSlug} onChange={(value) => update("publicSlug", value)} required />
          <Field label="City" value={profile.city} onChange={(value) => update("city", value)} />
          <Field label="Content language" value={profile.contentLanguage} onChange={(value) => update("contentLanguage", value)} />
        </div>
        <PlatformEntriesField entries={platforms} onChange={setPlatforms} />
        <CategoryPickerField selected={selected} onChange={setSelected} />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : "Save profile ↗"}</button>
          {profile.publicSlug ? <a href={`/creator/${encodeURIComponent(profile.publicSlug)}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[var(--forest)] underline underline-offset-4">Open public profile ↗</a> : null}
          {message ? <p role={message === "Profile saved." ? "status" : "alert"} className={`text-sm font-bold ${message === "Profile saved." ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>{message}</p> : null}
        </div>
      </form>
      <aside className="lg:sticky lg:top-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-[var(--forest)] px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Live preview</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">This is what your public page reads like.</h2>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Public slug</p>
                <p className="mt-2 text-lg font-black">{profile.publicSlug || "your-slug"}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{profile.city || "City"}</p>
              </div>
              <StatusBadge status={profile.availabilityStatus || "AVAILABLE"} />
            </div>
            <div className="mt-6 rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-sm font-bold text-[var(--muted)]">Profile header</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-.06em]">{profile.displayName || "Display name"}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {previewCategories.length ? previewCategories.join(" · ") : "Categories will appear here"}
                {profile.contentLanguage ? ` · ${profile.contentLanguage}` : ""}
              </p>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--muted)]">Categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.length ? selected.map((category) => <Pill key={category}>{category}</Pill>) : <span className="text-sm text-[var(--muted)]">Select categories to build your public identity.</span>}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--muted)]">Platforms</p>
              <div className="mt-3 space-y-3">
                {previewPlatforms.length ? previewPlatforms.map((entry) => (
                  <div key={`${entry.platform}-${entry.handle}`} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3">
                    <p className="text-sm font-bold">{entry.platform || "Platform"}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{entry.handle || "Handle"}</p>
                  </div>
                )) : <p className="text-sm text-[var(--muted)]">Add at least one platform row.</p>}
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="text-sm font-bold">Public page note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Audience metrics stay hidden until the creator has saved them. Weave does not invent performance numbers.</p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-"); return <label htmlFor={id} className="text-sm font-bold">{label}<input id={id} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]" /></label>; }
