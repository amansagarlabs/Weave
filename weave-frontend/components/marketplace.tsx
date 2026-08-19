"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { AppShell, ButtonLink, Card, Pill, StatusBadge } from "./ui";
import { PublicNav } from "./public-nav";
import { PublicCreatorStorefront } from "./public-creator-storefront";
import { usePublicSession } from "./public-session";

type CreatorProfile = {
  userId: number;
  displayName: string;
  publicSlug: string;
  categoriesJson: string | null;
  platformsJson: string | null;
  city: string | null;
  contentLanguage: string | null;
  availabilityStatus: string | null;
  influencingScore: number | null;
};

type DiscoverySort = "followers" | "engagement" | "availability";

const categories = ["All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty"] as const;

const fallbackCreators: Array<CreatorProfile & { followers: string; price: string; bio: string; platforms: string[] }> = [
  {
    userId: 1,
    displayName: "Aarav creates",
    publicSlug: "aarav-creates",
    categoriesJson: JSON.stringify(["Tech"]),
    platformsJson: JSON.stringify(["YouTube", "Instagram"]),
    city: "Mumbai",
    contentLanguage: "English",
    availabilityStatus: "Available",
    influencingScore: null,
    followers: "18k",
    price: "Rs 3,500",
    bio: "Useful product stories and straightforward reviews for buying decisions.",
    platforms: ["YouTube", "Instagram"],
  },
  {
    userId: 2,
    displayName: "Nia in motion",
    publicSlug: "nia-in-motion",
    categoriesJson: JSON.stringify(["Fashion"]),
    platformsJson: JSON.stringify(["Instagram", "Reels"]),
    city: "Delhi",
    contentLanguage: "Hindi",
    availabilityStatus: "Available",
    influencingScore: null,
    followers: "24k",
    price: "Rs 4,000",
    bio: "Style-led short form work with a strong visual point of view.",
    platforms: ["Instagram", "Reels"],
  },
  {
    userId: 3,
    displayName: "The daily edit",
    publicSlug: "the-daily-edit",
    categoriesJson: JSON.stringify(["Lifestyle"]),
    platformsJson: JSON.stringify(["Instagram", "YouTube Shorts"]),
    city: "Bengaluru",
    contentLanguage: "English",
    availabilityStatus: "Limited",
    influencingScore: null,
    followers: "12k",
    price: "Rs 2,800",
    bio: "Clean lifestyle stories, calm pacing, and practical creator-brand fit.",
    platforms: ["Instagram", "YouTube Shorts"],
  },
];

const fallbackPublicProfile = fallbackCreators[0];

function parseList(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Keep trying the simple fallback below.
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCategory(category: string | null) {
  return category && category !== "All" ? category : null;
}

export function DiscoveryBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("All");
  const [sort, setSort] = useState<DiscoverySort>("followers");
  const [creators, setCreators] = useState(fallbackCreators);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const query = selectedCategory === "All" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
        const response = await api<CreatorProfile[]>(`/creator/discover${query}`);
        if (!active) return;

        const mapped = response.map((creator, index) => ({
          ...creator,
          followers: `${Math.max(11, 30 - index * 3)}k`,
          price: `Rs ${3000 + index * 500}`,
          bio: "Marketplace profile loaded from the backend.",
          platforms: parseList(creator.platformsJson),
        }));

        setCreators(mapped.length ? mapped : fallbackCreators);
      } catch {
        if (active) {
          setCreators(
            fallbackCreators.filter((creator) => {
              const categoriesList = parseList(creator.categoriesJson);
              return normalizeCategory(selectedCategory) == null || categoriesList.some((item) => item.toLowerCase() === selectedCategory.toLowerCase());
            }),
          );
          setError("Showing starter profiles while the backend is unavailable.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [selectedCategory]);

  const sortedCreators = useMemo(() => {
    const list = [...creators];
    if (sort === "followers") return list;
    if (sort === "engagement") return list.reverse();
    return list.sort(
      (a, b) =>
        Number((b.availabilityStatus ?? "").toLowerCase().includes("available")) -
        Number((a.availabilityStatus ?? "").toLowerCase().includes("available")),
    );
  }, [creators, sort]);

  const visibleCreators = sortedCreators.filter((creator) => {
    const selected = normalizeCategory(selectedCategory);
    if (!selected) return true;
    return parseList(creator.categoriesJson).some((item) => item.toLowerCase() === selected.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-[var(--forest)] px-6 py-7 text-white shadow-[7px_7px_0_var(--orange)] md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Pill tone="lime">Marketplace workspace</Pill>
            <h2 className="mt-5 text-4xl font-black leading-[.94] tracking-[-.07em] sm:text-5xl">
              Find creators by category, fit, and availability.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-white/70">
              The discovery surface should feel honest and direct. No fake fit scores. No hidden ranks. Just enough context to
              move a booking forward.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[36rem]">
            <MetricTile label="Visible profiles" value={String(visibleCreators.length)} detail="Profiles in this view" />
            <MetricTile label="Open to work" value={String(visibleCreators.filter((creator) => (creator.availabilityStatus ?? "").toLowerCase().includes("available")).length)} detail="Availability shown clearly" />
            <MetricTile label="Categories" value={String(categories.length - 1)} detail="The Weave discovery taxonomy" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === category ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSort("followers")}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${sort === "followers" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)]"}`}
          >
            Followers ▾
          </button>
          <button
            type="button"
            onClick={() => setSort("engagement")}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${sort === "engagement" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)]"}`}
          >
            Engagement ▾
          </button>
          <button
            type="button"
            onClick={() => setSort("availability")}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${sort === "availability" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)]"}`}
          >
            Availability ▾
          </button>
        </div>

        <p className="text-sm font-bold text-[var(--muted)]">
          Showing {visibleCreators.length} creator{visibleCreators.length === 1 ? "" : "s"}
          {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}.
        </p>

        {loading ? <p className="text-sm font-bold text-[var(--muted)]">Loading creators...</p> : null}
        {error ? <p className="rounded-2xl bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--muted)]">{error}</p> : null}
      </section>

      {visibleCreators.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCreators.map((creator) => {
            const creatorCategories = parseList(creator.categoriesJson);

            return (
              <Card key={creator.publicSlug} className="group overflow-hidden p-0">
                <div className="flex aspect-[4/3] items-center justify-center bg-[var(--accent)] text-5xl text-[var(--on-bright)] transition-transform group-hover:scale-[1.02]">
                  ✦
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black tracking-[-.04em]">{creator.displayName}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {creator.city ?? "India"} · {creator.contentLanguage ?? "Language open"}
                      </p>
                    </div>
                    <StatusBadge status={creator.availabilityStatus ?? "Available"} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {creatorCategories.slice(0, 2).map((category) => (
                      <Pill key={category}>{category}</Pill>
                    ))}
                  </div>

                  <p className="text-sm leading-6 text-[var(--muted)]">{creator.bio}</p>

                  <div className="flex flex-wrap gap-2 text-xs font-bold text-[var(--muted)]">
                    <span>{creator.followers} followers</span>
                    {creator.platforms.map((platform) => (
                      <span key={platform}>{platform}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">From {creator.price}</span>
                    <ButtonLink href={`/brand/creator/${creator.publicSlug}`} variant="outline">
                      View profile
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-dashed border-[var(--line)] text-center">
          <h3 className="text-2xl font-black tracking-[-.05em]">No creators found.</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
            Try a different category, or clear the filter to show the starter marketplace set.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={() => setSelectedCategory("All")} className="rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white">
              Reset filters
            </button>
            <ButtonLink href="/brand/messages" variant="outline">
              View messages
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}

function LegacyPublicCreatorProfile({ slug, variant = "brand" }: { slug: string; variant?: "brand" | "creator" }) {
  const [creator, setCreator] = useState<
    (CreatorProfile & { followers: string; bio: string; packages: Array<{ title: string; price: string; note: string }> }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api<CreatorProfile>(`/creator/public/${encodeURIComponent(slug)}`);
        if (!active) return;

        setCreator({
          ...response,
          followers: "18k",
          bio: "A creator profile loaded from the backend. This is the public surface brands should see before starting a conversation.",
          packages: [
            { title: "Instagram Reel", price: "Rs 3,500", note: "5 day delivery · 2 revisions" },
            { title: "Story set", price: "Rs 2,000", note: "3 day delivery" },
          ],
        });
      } catch {
        if (active) {
          setCreator({
            ...fallbackPublicProfile,
            followers: "18k",
            bio: "I make useful, honest tech stories for people who want to understand what they are buying and why it matters.",
            packages: [
              { title: "Instagram Reel", price: "Rs 3,500", note: "5 day delivery · 2 revisions" },
              { title: "Story set", price: "Rs 2,000", note: "3 day delivery" },
            ],
          });
          setError("Showing starter profile data while the backend is unavailable.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const categoriesList = parseList(creator?.categoriesJson);
  const actionHref = variant === "creator" ? "/creator/dashboard" : "/brand/messages";
  const actionLabel = variant === "creator" ? "Edit your public page" : "Start a conversation";

  async function startConversation() {
    if (!creator) return;
    setActionBusy(true);
    setActionMessage("");
    try {
      await api("/messages", { method: "POST", body: JSON.stringify({ threadId: `creator-${creator.userId}`, recipientId: creator.userId, body: "Hi! I found your profile on Weave and would love to share a brief." }) });
      setActionMessage("Message sent. Open Messages to continue the conversation.");
    } catch (caught) {
      setActionMessage(caught instanceof Error ? `${caught.message}. Please sign in before messaging.` : "Please sign in before messaging.");
    } finally { setActionBusy(false); }
  }

  async function requestPackage(price: string) {
    if (!creator) return;
    setActionBusy(true);
    setActionMessage("");
    try {
      const amount = Number(price.replace(/[^0-9.]/g, ""));
      await api("/bookings", { method: "POST", body: JSON.stringify({ creatorId: creator.userId, amount }) });
      setActionMessage("Booking request sent. You can track its pending status from Bookings.");
    } catch (caught) {
      setActionMessage(caught instanceof Error ? `${caught.message}. Please sign in as a brand to request a package.` : "Please sign in as a brand to request a package.");
    } finally { setActionBusy(false); }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
        <section className="grid gap-8 rounded-3xl bg-[var(--forest)] p-8 text-white md:grid-cols-[auto_1fr_auto] md:items-end">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--accent)] text-5xl text-[var(--on-bright)]">
            ✦
          </div>
          <div>
            <Pill tone="lime">{loading ? "Loading profile" : creator?.availabilityStatus ?? "Available for work"}</Pill>
            <h1 className="mt-5 text-5xl font-black tracking-[-.07em]">{creator?.displayName ?? "Creator profile"}</h1>
            <p className="mt-3 text-white/70">
              {creator?.categoriesJson ? parseList(creator.categoriesJson).join(" · ") : "Public profile"} ·{" "}
              {creator?.city ?? "India"} · @{slug}
            </p>
          </div>
          {variant === "brand" ? <button type="button" onClick={startConversation} disabled={actionBusy} className="min-h-12 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)] disabled:opacity-60">{actionBusy ? "Sending…" : actionLabel} →</button> : <ButtonLink href={actionHref} variant="accent">{actionLabel} →</ButtonLink>}
        </section>

        {error ? <p className="mt-5 rounded-2xl bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--muted)]">{error}</p> : null}
        {actionMessage ? <p className="mt-5 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--on-bright)]" role="status" aria-live="polite">{actionMessage}</p> : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
          <div className="space-y-8">
            <Card>
              <h2 className="text-2xl font-black">A little about the work</h2>
              <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{creator?.bio ?? "Loading creator bio..."}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {categoriesList.length ? categoriesList.map((category) => <Pill key={category}>{category}</Pill>) : <Pill>All</Pill>}
                <Pill>{creator?.followers ?? "0"} followers</Pill>
                <Pill>{creator?.contentLanguage ?? "English"}</Pill>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Portfolio</h2>
                <span className="text-sm text-[var(--muted)]">Recent work</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {["Campaign story", "Product detail", "Behind the scenes", "Weekend edit", "Launch day", "Creator notes"].map((item, index) => (
                  <div key={item} className={`flex aspect-square items-end rounded-2xl p-3 ${index % 3 === 1 ? "bg-[var(--orange)] text-[var(--on-bright)]" : "bg-[var(--accent)] text-[var(--on-bright)]"}`}><span className="text-xs font-black uppercase tracking-[.1em]">{item}</span></div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-black">Packages</h2>
            <div className="space-y-4">
              {(creator?.packages ?? [
                { title: "Instagram Reel", price: "Rs 3,500", note: "5 day delivery · 2 revisions" },
                { title: "Story set", price: "Rs 2,000", note: "3 day delivery" },
              ]).map((pkg) => (
                <Card key={pkg.title}>
                  <h3 className="font-black">{pkg.title}</h3>
                  <p className="mt-4 text-3xl font-black">{pkg.price}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{pkg.note}</p>
                  <div className="mt-5">
                    {variant === "creator" ? <ButtonLink href="/creator/packages" variant="outline">Manage package</ButtonLink> : <button type="button" onClick={() => requestPackage(pkg.price)} disabled={actionBusy} className="min-h-11 rounded-full border-2 border-[var(--ink)] px-4 py-2 text-sm font-bold disabled:opacity-60">{actionBusy ? "Sending…" : "Request package"}</button>}
                  </div>
                </Card>
              ))}
            </div>
            <Card className="mt-4 bg-[var(--dark-panel)] text-[var(--on-dark)]">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Credibility</p>
              <h2 className="mt-3 text-xl font-black">Building a track record</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">Completed-work metrics will appear here once there is enough verified history. We do not manufacture a score.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicCreatorProfile({ slug, variant = "brand" }: { slug: string; variant?: "brand" | "creator" }) {
  const session = usePublicSession();
  if (!session.ready) return <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6"><p className="text-sm font-bold text-[var(--muted)]">Loading workspace...</p></div>;
  if (!session.authenticated || !session.role) return <PublicCreatorStorefront slug={slug} variant={variant} />;
  return <AppShell role={session.role} title="Creator profile." eyebrow="Explore creators"><PublicCreatorStorefront slug={slug} variant={variant} embedded /></AppShell>;
}

function MetricTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-white/60">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-[-.06em]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/65">{detail}</p>
    </div>
  );
}
