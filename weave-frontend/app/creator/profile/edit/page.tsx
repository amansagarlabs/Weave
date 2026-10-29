"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Check, CheckCircle, ChevronRight, Loader2, Package as PackageIcon, X } from "lucide-react";
import { api } from "../../../../lib/api";
import { useAppToast } from "../../../../components/hooks/use-app-toast";
import { Card, Pill, StatusBadge } from "../../../../components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { SurfacePage } from "../../../../components/surface";
import { PlatformEntriesField, parsePlatformEntries, sanitizePlatformEntries, type PlatformEntry } from "../../../../components/platform-entries";
import { weaveCategories } from "../../../../components/category-picker";
import { AvatarUpload } from "./avatar-upload";
import { LivePreview } from "./live-preview";

type Profile = {
  displayName: string;
  publicSlug: string;
  categoriesJson: string | null;
  platformsJson: string | null;
  city: string | null;
  contentLanguage: string | null;
  availabilityStatus: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type PackageItem = {
  id: number;
  ownerId: number;
  contentType: string;
  price: number;
  deliveryDays: number;
  revisionsIncluded: number;
  active: boolean;
};

const LANGUAGES = ["", "English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Malayalam", "Gujarati", "Punjabi"] as const;
const MAX_PLATFORMS = 6;
const MAX_NAME = 60;
const MAX_BIO = 280;

function parseList(value: string | null): string[] {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function CreatorProfileEdit() {
  const router = useRouter();
  const { success, error: notifyError } = useAppToast();

  const [profile, setProfile] = useState({ displayName: "", publicSlug: "", bio: "", city: "", contentLanguage: "", availabilityStatus: "AVAILABLE" as string | null });
  const [platforms, setPlatforms] = useState<PlatformEntry[]>([{ platform: "", handle: "" }]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [slugCheck, setSlugCheck] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const initialRef = useRef("");
  const initialSlugRef = useRef("");
  const slugTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    Promise.all([
      api<Profile>("/creator/profile/me").catch(() => null),
      api<PackageItem[]>("/creator/packages").catch(() => []),
    ]).then(([pData, pkgData]) => {
      if (pData) {
        const p = parsePlatformEntries(pData.platformsJson);
        setProfile({ displayName: pData.displayName, publicSlug: pData.publicSlug, bio: pData.bio ?? "", city: pData.city ?? "", contentLanguage: pData.contentLanguage ?? "", availabilityStatus: pData.availabilityStatus ?? "AVAILABLE" });
        setPlatforms(p.length ? p : [{ platform: "", handle: "" }]);
        setSelectedCategories(parseList(pData.categoriesJson));
        setAvatarUrl(pData.avatarUrl ?? null);
        initialSlugRef.current = pData.publicSlug;
      }
      if (pkgData) setPackages(pkgData.filter((pkg) => pkg.active));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    initialRef.current = JSON.stringify({ profile, platforms: sanitizePlatformEntries(platforms), selectedCategories, avatarUrl });
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const cur = JSON.stringify({ profile, platforms: sanitizePlatformEntries(platforms), selectedCategories, avatarUrl });
    setHasUnsavedChanges(cur !== initialRef.current);
  }, [profile, platforms, selectedCategories, avatarUrl, loading]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [hasUnsavedChanges]);

  const checkSlug = useCallback((slug: string) => {
    clearTimeout(slugTimer.current);
    if (!slug || slug === initialSlugRef.current || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { setSlugCheck("idle"); return; }
    setSlugCheck("checking");
    slugTimer.current = setTimeout(async () => {
      try {
        const r = await api<{ available: boolean }>(`/creator/profile/slug-check?slug=${encodeURIComponent(slug)}`);
        setSlugCheck(r.available ? "available" : "taken");
      } catch { setSlugCheck("idle"); }
    }, 300);
  }, []);

  function updateProfile(name: keyof typeof profile, value: string) {
    setProfile((c) => ({ ...c, [name]: value }));
    if (name === "publicSlug") checkSlug(value);
    setSaved(false);
  }

  function toggleAvailability() {
    setProfile((c) => ({ ...c, availabilityStatus: c.availabilityStatus === "AVAILABLE" ? null : "AVAILABLE" }));
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((c) => c.includes(cat) ? c.filter((x) => x !== cat) : [...c, cat]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError("");
    setSaved(false);
    if (!profile.displayName.trim()) { setSaveError("Display name is required."); return; }
    if (!profile.publicSlug.trim()) { setSaveError("Public profile slug is required."); return; }
    if (slugCheck === "checking") { setSaveError("Please wait for slug availability check."); return; }
    if (slugCheck === "taken") { setSaveError("This slug is already taken. Please choose another."); return; }
    setBusy(true);
    try {
      await api("/creator/profile", { method: "POST", body: JSON.stringify({ displayName: profile.displayName.trim(), publicSlug: profile.publicSlug.trim(), city: profile.city.trim() || null, contentLanguage: profile.contentLanguage || null, availabilityStatus: profile.availabilityStatus, bio: profile.bio.trim() || null, categoriesJson: JSON.stringify(selectedCategories), platformsJson: JSON.stringify(sanitizePlatformEntries(platforms)) }) });
      success("Profile saved", "Your public profile has been updated.");
      initialRef.current = JSON.stringify({ profile, platforms: sanitizePlatformEntries(platforms), selectedCategories, avatarUrl });
      setHasUnsavedChanges(false);
      setSaved(true);
      router.refresh();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Could not save your profile.";
      setSaveError(msg);
      notifyError("Could not save profile", msg);
    } finally { setBusy(false); }
  }

  if (loading) {
    return (
      <SurfacePage role="creator" title="Edit your public profile." action="Preview profile" actionHref="/creator/sample">
        <div className="rounded-2xl bg-[var(--card)] p-6 text-sm font-bold text-[var(--muted)]">Loading your profile…</div>
      </SurfacePage>
    );
  }

  const previewPlatforms = sanitizePlatformEntries(platforms);

  return (
    <SurfacePage
      role="creator"
      title="Edit your public profile."
      action="Preview profile"
      actionHref={profile.publicSlug ? `/creator/${encodeURIComponent(profile.publicSlug)}` : "/creator/sample"}
    >
      {hasUnsavedChanges && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--orange)]/30 bg-[var(--orange)]/10 px-5 py-3">
          <AlertTriangle size={16} className="shrink-0 text-[var(--orange)]" />
          <p className="text-sm font-bold text-[var(--ink)]">You have unsaved changes</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Section 1 — Profile photo */}
          <Card>
            <h2 className="text-xl font-black tracking-[-.04em]">Profile photo</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Upload a clear photo of yourself. This is the first thing people see.</p>
            <div className="mt-5">
              <AvatarUpload avatarUrl={avatarUrl} onUpload={(url) => { setAvatarUrl(url); setSaved(false); }} onRemove={() => { setAvatarUrl(null); setSaved(false); }} />
            </div>
          </Card>

          {/* Section 2 — Profile details */}
          <Card>
            <h2 className="text-xl font-black tracking-[-.04em]">Profile details</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Keep your public page honest and easy to understand.</p>

            {/* Availability toggle */}
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4">
              <div>
                <p className="text-sm font-bold">Available for brand deals</p>
                <p className="mt-1 text-xs text-[var(--muted)]">When toggled on, brands can find and book you.</p>
              </div>
              <button type="button" role="switch" aria-checked={profile.availabilityStatus === "AVAILABLE"} onClick={toggleAvailability} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${profile.availabilityStatus === "AVAILABLE" ? "bg-[var(--forest)]" : "bg-[var(--line)]"}`}>
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${profile.availabilityStatus === "AVAILABLE" ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="display-name" className="text-sm font-bold">Display name <span className="text-[var(--danger)]">*</span></label>
                <input id="display-name" required maxLength={MAX_NAME} value={profile.displayName} onChange={(e) => updateProfile("displayName", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]" />
                <p className="mt-1 text-right text-xs tabular-nums text-[var(--muted)]">{profile.displayName.length}/{MAX_NAME}</p>
              </div>
              <div>
                <label htmlFor="public-slug" className="text-sm font-bold">Public profile slug <span className="text-[var(--danger)]">*</span></label>
                <input id="public-slug" required value={profile.publicSlug} onChange={(e) => updateProfile("publicSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]" placeholder="your-slug" />
                {profile.publicSlug ? <p className="mt-1 text-xs text-[var(--muted)]">weave.in/creator/{profile.publicSlug}</p> : null}
                {slugCheck === "checking" && <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]"><Loader2 size={12} className="animate-spin" /> Checking availability…</p>}
                {slugCheck === "available" && <p className="mt-1 flex items-center gap-1 text-xs text-[var(--forest)]"><Check size={12} /> Available</p>}
                {slugCheck === "taken" && <p className="mt-1 flex items-center gap-1 text-xs text-[var(--danger)]"><X size={12} /> Already taken</p>}
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="bio" className="text-sm font-bold">Bio</label>
              <p className="mt-1 text-xs text-[var(--muted)]">Tell brands and creators what you're about.</p>
              <textarea id="bio" maxLength={MAX_BIO} rows={3} value={profile.bio} onChange={(e) => { updateProfile("bio", e.target.value); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 font-normal outline-none focus:border-[var(--forest)]" placeholder="I create content about…" />
              <p className="mt-1 text-right text-xs tabular-nums text-[var(--muted)]">{profile.bio.length}/{MAX_BIO}</p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="city" className="text-sm font-bold">City</label>
                <input id="city" value={profile.city} onChange={(e) => updateProfile("city", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]" placeholder="Mumbai" />
              </div>
              <div>
                <label htmlFor="content-language" className="text-sm font-bold">Content language</label>
                <select id="content-language" value={profile.contentLanguage} onChange={(e) => updateProfile("contentLanguage", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]">
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l || "Select language"}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Section 3 — Platforms */}
          <Card>
            <PlatformEntriesField entries={platforms} onChange={(e) => { if (e.length <= MAX_PLATFORMS) setPlatforms(e); setSaved(false); }} showMetrics hint="Add your active social accounts and optional audience stats. Manual metrics are shown as self-reported until platform verification is available." />
            {platforms.length >= MAX_PLATFORMS ? <p className="mt-3 text-xs text-[var(--muted)]">Maximum {MAX_PLATFORMS} platforms.</p> : null}
          </Card>

          {/* Section 4 — Categories */}
          <Card>
            <h2 className="text-xl font-black tracking-[-.04em]">Categories</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Select the categories that best describe your content.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {weaveCategories.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button key={cat} type="button" onClick={() => { toggleCategory(cat); setSaved(false); }} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-all active:scale-[.97] ${active ? "bg-[var(--forest)] text-white" : "border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--forest)]"}`}>
                    {active ? <Check size={14} /> : null}
                    {cat}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Section 5 — Rate card preview */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-[-.04em]">Your rate card</h2>
              <Link href="/creator/packages" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--forest)] underline">Manage packages <ChevronRight size={14} /></Link>
            </div>
            {packages.length > 0 ? (
              <div className="mt-4 space-y-3">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PackageIcon size={16} className="shrink-0 text-[var(--muted)]" />
                      <div>
                        <p className="text-sm font-bold">{pkg.contentType}</p>
                        <p className="text-xs text-[var(--muted)]">{pkg.deliveryDays} day{pkg.deliveryDays === 1 ? "" : "s"} delivery</p>
                      </div>
                    </div>
                    <p className="text-sm font-black tabular-nums">₹{Number(pkg.price).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-5 text-center">
                <p className="text-sm font-bold text-[var(--muted)]">No packages yet</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Create packages to let brands know your pricing.</p>
                <Link href="/creator/packages/new" className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-bold text-[var(--on-bright)] transition-transform active:scale-[.97]">Create your first package</Link>
              </div>
            )}
          </Card>

          {/* Save */}
          <div className="flex flex-wrap items-center gap-4">
            <button disabled={busy || slugCheck === "checking"} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--forest)] px-6 font-bold text-white shadow-[4px_4px_0_var(--orange)] transition-transform active:scale-[.97] disabled:opacity-60">
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? "Saving…" : "Save profile ↗"}
            </button>
            {profile.publicSlug ? <Link href={`/creator/${encodeURIComponent(profile.publicSlug)}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[var(--forest)] underline underline-offset-4">Open public profile ↗</Link> : null}
            {saved && !busy ? <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--forest)]"><CheckCircle size={16} /> Profile saved</span> : null}
            {saveError ? <p role="alert" className="text-sm font-bold text-[var(--danger)]">{saveError}</p> : null}
          </div>
        </form>

        {/* Right column — Live preview */}
        <aside className="lg:sticky lg:top-6">
          <LivePreview displayName={profile.displayName} publicSlug={profile.publicSlug} bio={profile.bio} city={profile.city} contentLanguage={profile.contentLanguage} availabilityStatus={profile.availabilityStatus} categories={selectedCategories} platforms={previewPlatforms} packages={packages} avatarUrl={avatarUrl} />
        </aside>
      </div>
    </SurfacePage>
  );
}
