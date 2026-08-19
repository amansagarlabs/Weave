"use client";

import { useEffect, useState } from "react";
import { Globe, Instagram, Linkedin, Play, Music2, Twitter } from "lucide-react";
import { api } from "../lib/api";
import { ButtonLink, Card, Pill, StatusBadge } from "./ui";
import { PublicNav } from "./public-nav";

type Profile = { userId: number; displayName: string; publicSlug: string; categoriesJson: string | null; platformsJson: string | null; city: string | null; contentLanguage: string | null; availabilityStatus: string | null; influencingScore: number | null };
type Package = { id: number; contentType: string; price: number; deliveryDays: number; revisionsIncluded: number; active: boolean };
type Asset = { id: number; title: string; assetUrl: string; contentType: string; createdAt: string };
function list(value: string | null) { try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }
type PlatformLink = { platform: string; handle: string; href: string };
function platformLinks(value: string | null): PlatformLink[] {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => {
      const platform = String(typeof entry === "string" ? entry : entry?.platform ?? "").trim();
      const handle = String(typeof entry === "string" ? entry : entry?.handle ?? "").trim();
      const key = platform.toLowerCase().replace(/[^a-z]/g, "");
      if (!platform || !handle) return null;
      if (/^https?:\/\//i.test(handle)) return { platform, handle, href: handle };
      const clean = handle.replace(/^@/, "");
      const hosts: Record<string, string> = {
        instagram: `https://instagram.com/${encodeURIComponent(clean)}`,
        x: `https://x.com/${encodeURIComponent(clean)}`,
        twitter: `https://x.com/${encodeURIComponent(clean)}`,
        tiktok: `https://tiktok.com/@${encodeURIComponent(clean)}`,
        youtube: `https://youtube.com/@${encodeURIComponent(clean)}`,
        medium: `https://medium.com/@${encodeURIComponent(clean)}`,
        linkedin: `https://linkedin.com/in/${encodeURIComponent(clean)}`,
        facebook: `https://facebook.com/${encodeURIComponent(clean)}`,
      };
      const href = hosts[key] ?? (key.includes("website") ? `https://${clean}` : "");
      return href ? { platform, handle, href } : null;
    }).filter((entry): entry is PlatformLink => Boolean(entry));
  } catch { return []; }
}
function platformIcon(platform: string) {
  const key = platform.toLowerCase().replace(/[^a-z]/g, "");
  if (key === "instagram") return Instagram;
  if (key === "x" || key === "twitter") return Twitter;
  if (key === "youtube") return Play;
  if (key === "tiktok") return Music2;
  if (key === "linkedin") return Linkedin;
  return Globe;
}

function PlatformIconLinks({ links, align = "end" }: { links: PlatformLink[]; align?: "start" | "end" }) {
  if (!links.length) return null;

  return <div className={`flex max-w-[9rem] shrink-0 flex-wrap gap-2 ${align === "start" ? "justify-start" : "justify-end"}`} aria-label="Creator social links">
    {links.map((link) => {
      const Icon = platformIcon(link.platform);
      return <a key={`${link.platform}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" title={`${link.platform}: ${link.handle}`} aria-label={`${link.platform}: ${link.handle}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20">
        <Icon size={18} aria-hidden="true" />
      </a>;
    })}
  </div>;
}

export function PublicCreatorStorefront({ slug, variant = "brand", embedded = false }: { slug: string; variant?: "brand" | "creator"; embedded?: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const encodedSlug = encodeURIComponent(slug);
    api<Profile>(`/creator/public/${encodedSlug}`)
      .then(setProfile)
      .catch(() => setError("This creator profile could not be found. Check the username and try again."))
      .finally(() => setLoading(false));
    api<Package[]>(`/creator/public/${encodedSlug}/packages`).then(setPackages).catch(() => setPackages([]));
    api<Asset[]>(`/creator/public/${encodedSlug}/portfolio`).then(setAssets).catch(() => setAssets([]));
  }, [slug]);

  async function contact() { if (!profile) return; setBusy(true); setMessage(""); try { await api("/messages", { method: "POST", body: JSON.stringify({ threadId: `creator-${profile.userId}`, recipientId: profile.userId, body: "Hi! I found your profile on Weave and would love to share a brief." }) }); setMessage("Message sent. Open Messages to continue."); } catch (caught) { setMessage(caught instanceof Error ? `${caught.message}. Sign in before messaging.` : "Sign in before messaging."); } finally { setBusy(false); } }
  async function request(pkg: Package) { if (!profile) return; setBusy(true); setMessage(""); try { await api("/bookings", { method: "POST", body: JSON.stringify({ creatorId: profile.userId, packageId: pkg.id, amount: pkg.price }) }); setMessage("Booking request sent. Track it from Bookings."); } catch (caught) { setMessage(caught instanceof Error ? `${caught.message}. Sign in as a brand to request a package.` : "Sign in as a brand to request a package."); } finally { setBusy(false); } }

  return <div className="min-h-screen bg-[var(--paper)]">{embedded ? null : <PublicNav />}<div className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">{loading ? <Card className="mt-10"><p className="font-bold text-[var(--muted)]">Loading creator profile...</p></Card> : error || !profile ? <Card className="mt-10"><h1 className="text-2xl font-black">Creator profile unavailable.</h1><p className="mt-3 text-sm text-[var(--muted)]">{error || "This creator profile does not exist."}</p><div className="mt-5"><ButtonLink href={variant === "brand" ? "/brand/discover" : "/"} variant="outline">Go back</ButtonLink></div></Card> : <>
    <section className="mt-8 grid gap-8 rounded-3xl bg-[var(--forest)] p-8 text-white md:grid-cols-[auto_1fr_auto] md:items-end"><div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--accent)] text-5xl text-[var(--on-bright)]" aria-hidden="true">*</div><div><Pill tone="lime">{profile.availabilityStatus || "Available for work"}</Pill><h1 className="mt-5 text-5xl font-black tracking-[-.07em]">{profile.displayName}</h1><p className="mt-3 text-white/70">{list(profile.categoriesJson).join(" · ") || "Creator"} · {profile.city || "India"} · @{profile.publicSlug}</p></div><div className="flex flex-col items-end gap-3"><PlatformIconLinks links={platformLinks(profile.platformsJson)} />{variant === "brand" ? <button type="button" onClick={contact} disabled={busy} className="min-h-12 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)]">{busy ? "Sending..." : "Start a conversation"}</button> : <ButtonLink href="/creator/profile/edit" variant="accent">Edit your public page</ButtonLink>}</div></section>
    {message ? <p role="status" className="mt-5 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--on-bright)]">{message}</p> : null}
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr]"><div className="space-y-8"><Card><h2 className="text-2xl font-black">About the work</h2><p className="mt-4 leading-7 text-[var(--muted)]">This public profile is backed by the creator&apos;s saved Weave profile. Audience metrics appear only when the creator has provided them.</p><div className="mt-6 flex flex-wrap gap-2">{list(profile.categoriesJson).map((category) => <Pill key={category}>{category}</Pill>)}<Pill>{profile.contentLanguage || "Language open"}</Pill></div></Card>
      <Card><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Portfolio</h2><span className="text-sm text-[var(--muted)]">Creator-managed</span></div>{assets.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2">{assets.map((asset) => <div key={asset.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--ink)]"><div className="aspect-square">{asset.contentType.startsWith("video/") ? <video className="h-full w-full object-cover" src={asset.assetUrl} controls preload="metadata" /> : <img className="h-full w-full object-cover" src={asset.assetUrl} alt={asset.title} />}</div><p className="bg-[var(--card)] px-4 py-3 text-sm font-bold">{asset.title}</p></div>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-8 text-center"><p className="font-black">No portfolio work published yet.</p><p className="mt-2 text-sm text-[var(--muted)]">The creator is still preparing their public showcase.</p></div>}</Card>
    </div><div><h2 className="mb-4 text-2xl font-black">Packages</h2>{packages.length ? <div className="space-y-4">{packages.map((pkg) => <Card key={pkg.id}><h3 className="font-black">{pkg.contentType}</h3><p className="mt-4 text-3xl font-black tabular-nums">INR {pkg.price.toLocaleString("en-IN")}</p><p className="mt-1 text-sm text-[var(--muted)]">{pkg.deliveryDays} day delivery · {pkg.revisionsIncluded} revisions included</p><div className="mt-5">{variant === "brand" ? <button type="button" onClick={() => request(pkg)} disabled={busy} className="min-h-11 rounded-full border-2 border-[var(--ink)] px-4 py-2 text-sm font-bold disabled:opacity-60">{busy ? "Sending..." : "Request package"}</button> : <ButtonLink href="/creator/packages" variant="outline">Manage package</ButtonLink>}</div></Card>)}</div> : <Card><h3 className="font-black">No packages published yet.</h3><p className="mt-2 text-sm text-[var(--muted)]">This creator is still setting up their rate card.</p></Card>}<Card className="mt-4 bg-[var(--ink)] text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Credibility</p><h2 className="mt-3 text-xl font-black">Building a track record</h2><p className="mt-2 text-sm leading-6 text-white/70">Completed-work metrics will appear after enough verified history.</p></Card></div></div>
  </>}</div></div>;
}
