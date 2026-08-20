"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import {
  ArrowRight,
  AtSign,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Eye,
  Globe2,
  ImagePlus,
  Instagram,
  MessageCircle,
  Share2,
  Sparkles,
  TrendingUp,
  Youtube,
} from "lucide-react";
import { api } from "../lib/api";
import { parsePlatformEntries, type PlatformEntry } from "./platform-entries";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AppShell, Card, StatusBadge } from "./ui";

type Profile = {
  displayName: string;
  publicSlug: string;
  categoriesJson: string | null;
  platformsJson: string | null;
  city: string | null;
  contentLanguage: string | null;
  availabilityStatus: string | null;
};

type Booking = {
  id: number;
  brandId: number;
  status: string;
  amount: number | string;
  createdAt: string;
};

type Conversation = {
  threadId: string;
  participantEmail?: string;
  latestBody: string;
  latestAt: string;
  bookingStatus?: string | null;
};

type Invoice = {
  id: number;
  bookingId: number;
  status: string;
  amount: number;
  netPayable: number | null;
};

type PortfolioAsset = {
  id: number;
  title: string;
  assetUrl: string;
  contentType: string;
  createdAt: string;
};

type CreatorPackage = { id: number };

type DashboardData = {
  profile: Profile | null;
  bookings: Booking[];
  conversations: Conversation[];
  invoices: Invoice[];
  portfolio: PortfolioAsset[];
  packages: CreatorPackage[];
};

const emptyData: DashboardData = {
  profile: null,
  bookings: [],
  conversations: [],
  invoices: [],
  portfolio: [],
  packages: [],
};

const inactiveBookingStatuses = new Set(["PAID", "REJECTED", "CANCELLED"]);

function list(value: string | null | undefined) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function number(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function compact(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function money(value: number) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("") || "C";
}

function platformIcon(platform: string) {
  const normalized = platform.toLowerCase();
  if (normalized.includes("instagram")) return Instagram;
  if (normalized.includes("youtube")) return Youtube;
  if (normalized.includes("web") || normalized.includes("site")) return Globe2;
  return AtSign;
}

function SelfReportedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.14em] text-current opacity-55">
      <Check size={11} aria-hidden="true" /> Self-reported
    </span>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Eye }) {
  return (
    <div className="min-w-0 px-5 py-5 sm:px-6">
      <div className="flex items-center gap-2 text-[var(--muted)]">
        <Icon size={15} aria-hidden="true" />
        <p className="text-[11px] font-black uppercase tracking-[.15em]">{label}</p>
      </div>
      <p className="mt-4 truncate text-[1.75rem] font-black tracking-[-.055em] tabular-nums">{value}</p>
      <p className="mt-1.5 truncate text-xs text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function AudienceChart({ platforms }: { platforms: PlatformEntry[] }) {
  const values = platforms
    .map((entry) => ({ platform: entry.platform || "Platform", followers: number(entry.followers) }))
    .filter((entry) => entry.followers > 0);

  if (!values.length) {
    return (
      <Card className="flex min-h-[250px] flex-col justify-between border border-[var(--line)] bg-[var(--card)] p-6 shadow-none sm:p-7">
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">Audience signal</p>
            <BarChart3 size={18} className="text-[var(--forest)]" aria-hidden="true" />
          </div>
          <h2 className="mt-7 max-w-md text-2xl font-black tracking-[-.045em]">Turn your social reach into a clear story.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">Add audience, views, and engagement once. Weave keeps self-reported numbers clearly labelled.</p>
        </div>
        <Link href="/creator/profile/edit" className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-black text-[var(--on-bright)] transition-transform active:scale-[.97]">
          Add social stats <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </Card>
    );
  }

  const spec: any = {
    type: "bar",
    background: "transparent",
    padding: { top: 14, right: 18, bottom: 8, left: 8 },
    data: [{ id: "audience", values }],
    xField: "platform",
    yField: "followers",
    color: ["#e8f55b"],
    bar: { style: { cornerRadius: [10, 10, 3, 3] } },
    axes: [
      { orient: "bottom", label: { style: { fill: "rgba(255,255,255,.58)", fontSize: 11 } }, tick: { visible: false }, domainLine: { visible: false }, grid: { visible: false } },
      { orient: "left", label: { style: { fill: "rgba(255,255,255,.38)", fontSize: 10 }, formatMethod: (value: number) => compact(value) }, tick: { visible: false }, domainLine: { visible: false }, grid: { style: { stroke: "rgba(255,255,255,.09)", lineDash: [3, 5] } } },
    ],
    tooltip: {
      visible: true,
      renderMode: "canvas",
      confine: true,
      mark: { content: [{ key: "Followers", value: (datum: any) => Number(datum?.[0]?.datum?.followers ?? 0).toLocaleString("en-IN") }] },
    },
  };

  return (
    <Card className="overflow-hidden bg-[var(--dark-panel)] p-0 text-[var(--on-dark)] shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-white/45">Audience by platform</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-.045em]">Where your community lives</h2>
        </div>
        <SelfReportedBadge />
      </div>
      <div className="h-[230px] px-2 pb-3" aria-label={values.map((item) => `${item.platform}: ${item.followers} followers`).join(", ")}>
        <VChart spec={spec} />
      </div>
    </Card>
  );
}

function PortfolioStrip({ items }: { items: PortfolioAsset[] }) {
  const portfolioLayout = items.length === 1
    ? "mt-6"
    : items.length === 2
      ? "mt-6 grid gap-4 md:h-[420px] md:grid-cols-[minmax(0,1.4fr)_minmax(260px,.6fr)]"
      : "mt-6 grid gap-4 lg:h-[520px] lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,.45fr)] lg:grid-rows-3";

  return (
    <section aria-labelledby="portfolio-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">Your work</p>
          <h2 id="portfolio-heading" className="mt-2 text-2xl font-black tracking-[-.045em]">Portfolio pulse</h2>
        </div>
        <Link href="/creator/portfolio" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-black text-[var(--forest)] hover:bg-[var(--card)]">Manage portfolio <ChevronRight size={16} aria-hidden="true" /></Link>
      </div>
      {items.length ? (
        <div className={portfolioLayout}>
          {items.slice(0, 4).map((item, index) => (
            <Link key={item.id} href="/creator/portfolio" className={`group relative min-h-0 overflow-hidden rounded-[22px] bg-[var(--dark-panel)] ${items.length === 1 ? "block h-[340px] sm:h-[440px]" : items.length === 2 ? "h-[280px] md:h-full" : index === 0 ? "h-[340px] sm:h-[420px] lg:row-span-3 lg:h-full" : "h-[220px] lg:h-auto"}`}>
              <div className="h-full overflow-hidden">
                {item.contentType.startsWith("video/") ? (
                  <video src={item.assetUrl} muted playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
                ) : (
                  <img src={item.assetUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 text-white">
                <p className="truncate font-black">{item.title}</p>
                <p className="mt-1 text-xs text-white/65">{item.contentType.startsWith("video/") ? "Video" : "Image"}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="mt-5 flex flex-col items-start justify-between gap-6 border border-dashed border-[var(--line)] shadow-none sm:flex-row sm:items-center">
          <div><h3 className="text-lg font-black">Show brands what you make.</h3><p className="mt-2 text-sm text-[var(--muted)]">Upload your strongest photo or video to start your portfolio.</p></div>
          <Link href="/creator/portfolio/upload" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--forest)] px-5 text-sm font-black text-white"><ImagePlus size={16} aria-hidden="true" /> Upload work</Link>
        </Card>
      )}
    </section>
  );
}

export function CreatorDashboard() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const requests = [
      api<Profile>("/creator/profile/me"),
      api<Booking[]>("/bookings"),
      api<Conversation[]>("/messages"),
      api<Invoice[]>("/invoices"),
      api<PortfolioAsset[]>("/creator/portfolio"),
      api<CreatorPackage[]>("/creator/packages"),
    ] as const;

    Promise.allSettled(requests).then((results) => {
      const [profile, bookings, conversations, invoices, portfolio, packages] = results;
      setData({
        profile: profile.status === "fulfilled" ? profile.value : null,
        bookings: bookings.status === "fulfilled" ? bookings.value : [],
        conversations: conversations.status === "fulfilled" ? conversations.value : [],
        invoices: invoices.status === "fulfilled" ? invoices.value : [],
        portfolio: portfolio.status === "fulfilled" ? portfolio.value : [],
        packages: packages.status === "fulfilled" ? packages.value : [],
      });
      setLoadError(results.every((result) => result.status === "rejected"));
    }).finally(() => setLoading(false));
  }, []);

  const platforms = useMemo(() => parsePlatformEntries(data.profile?.platformsJson ?? null), [data.profile?.platformsJson]);
  const categories = useMemo(() => list(data.profile?.categoriesJson), [data.profile?.categoriesJson]);
  const totalFollowers = platforms.reduce((sum, entry) => sum + number(entry.followers), 0);
  const reportedViews = platforms.map((entry) => number(entry.averageViews)).filter(Boolean);
  const averageViews = reportedViews.length ? reportedViews.reduce((sum, value) => sum + value, 0) / reportedViews.length : 0;
  const reportedEngagement = platforms.map((entry) => number(entry.engagementRate)).filter(Boolean);
  const engagement = reportedEngagement.length ? reportedEngagement.reduce((sum, value) => sum + value, 0) / reportedEngagement.length : 0;
  const activeBookings = data.bookings.filter((booking) => !inactiveBookingStatuses.has(booking.status));
  const pendingRequests = data.bookings.filter((booking) => booking.status === "PENDING").length;
  const paidInvoices = data.invoices.filter((invoice) => invoice.status === "PAID");
  const earned = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.netPayable ?? invoice.amount ?? 0), 0);
  const awaitingPayment = data.invoices.filter((invoice) => ["DRAFT", "SENT"].includes(invoice.status)).reduce((sum, invoice) => sum + Number(invoice.netPayable ?? invoice.amount ?? 0), 0);
  const completenessSteps = [Boolean(data.profile?.displayName), Boolean(data.profile?.publicSlug), platforms.length > 0, categories.length > 0, data.portfolio.length > 0, data.packages.length > 0];
  const completeness = Math.round((completenessSteps.filter(Boolean).length / completenessSteps.length) * 100);
  const displayName = data.profile?.displayName || "Your creator profile";
  const publicHref = data.profile?.publicSlug ? `/creator/${encodeURIComponent(data.profile.publicSlug)}` : "/creator/profile/edit";

  return (
    <AppShell role="creator" title="Overview" eyebrow="Creator studio">
      {loadError ? <p role="alert" className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-[var(--danger)]">Your creator data could not be loaded. Refresh the page or sign in again.</p> : null}

      <section>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Avatar className="h-20 w-20 border-2 border-[var(--line)] sm:h-24 sm:w-24">
                <AvatarFallback className="bg-[var(--forest)] text-xl text-white">{initials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3"><StatusBadge status={data.profile?.availabilityStatus || "Complete profile"} />{platforms.length ? <SelfReportedBadge /> : null}</div>
                <h2 className="mt-3 truncate text-4xl font-black tracking-[-.065em] sm:text-[2.75rem]">{loading ? "Loading studio..." : displayName}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{data.profile?.publicSlug ? `@${data.profile.publicSlug}` : "Choose your public username"}{data.profile?.city ? ` · ${data.profile.city}` : ""}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              {platforms.length ? platforms.map((entry) => {
                const Icon = platformIcon(entry.platform);
                return <span key={`${entry.platform}-${entry.handle}`} className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[var(--paper)] px-3 text-xs font-bold text-[var(--muted)]"><Icon size={15} className="text-[var(--forest)]" aria-hidden="true" /><span className="text-[var(--ink)]">{entry.platform || "Platform"}</span><span>{entry.handle}</span></span>;
              }) : <Link href="/creator/profile/edit" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-dashed border-[var(--line)] px-4 text-xs font-bold text-[var(--muted)]">Add social accounts <ArrowRight size={14} aria-hidden="true" /></Link>}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/creator/portfolio/upload" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-black text-[var(--on-bright)] transition-transform active:scale-[.97]"><ImagePlus size={17} aria-hidden="true" /> Upload content</Link>
              <Link href={publicHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--line)] px-4 text-sm font-black text-[var(--ink)] hover:bg-[var(--paper)]"><Eye size={17} aria-hidden="true" /> Public profile</Link>
              <button type="button" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${publicHref}`)} className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 text-sm font-black text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Copy public profile link"><Share2 size={17} aria-hidden="true" /> Share</button>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[24px] bg-[var(--dark-panel)] p-6 text-white sm:p-7">
            <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/45">Profile strength</p><p className="mt-2 text-sm text-white/55">Ready to share</p></div><span className="text-3xl font-black tabular-nums">{completeness}%</span></div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Creator profile completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completeness}><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${completeness}%` }} /></div>
            <div className="mt-5 flex items-center justify-between gap-2 text-xs text-white/55"><span>{data.portfolio.length} works</span><span>{data.packages.length} packages</span><span>{platforms.length} socials</span></div>
            <Link href="/creator/profile/edit" className="mt-6 inline-flex min-h-11 items-center justify-between gap-2 rounded-xl bg-white px-4 text-sm font-black text-[var(--ink)] hover:bg-[var(--accent)]">Edit creator profile <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section aria-label="Creator performance summary" className="mt-7 overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)]">
        <div className="grid divide-y divide-[var(--line)] sm:grid-cols-2 sm:[&>*:nth-child(2)]:border-l sm:[&>*:nth-child(2)]:border-[var(--line)] lg:grid-cols-4 lg:divide-y-0 lg:[&>*+*]:border-l lg:[&>*+*]:border-[var(--line)]">
          <Metric label="Total audience" value={totalFollowers ? compact(totalFollowers) : "Not added"} detail={totalFollowers ? `${platforms.filter((entry) => number(entry.followers) > 0).length} platforms reported` : "Add follower counts"} icon={TrendingUp} />
          <Metric label="Average views" value={averageViews ? compact(averageViews) : "Not added"} detail="Reported platform average" icon={Eye} />
          <Metric label="Engagement" value={engagement ? `${engagement.toFixed(1)}%` : "Not added"} detail="Reported average rate" icon={BarChart3} />
          <Metric label="Brand interest" value={loading ? "-" : String(data.conversations.length + pendingRequests)} detail={`${data.conversations.length} conversations · ${pendingRequests} requests`} icon={MessageCircle} />
        </div>
      </section>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
        <AudienceChart platforms={platforms} />
        <Card className="border border-[var(--line)] p-6 shadow-none sm:p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">Collaboration snapshot</p><h2 className="mt-2 text-2xl font-black tracking-[-.045em]">Work and earnings</h2></div><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-bright)]"><Sparkles size={19} aria-hidden="true" /></span></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--paper)] p-4"><BriefcaseBusiness size={17} className="text-[var(--forest)]" aria-hidden="true" /><p className="mt-4 text-2xl font-black tabular-nums">{activeBookings.length}</p><p className="mt-1 text-xs text-[var(--muted)]">Active collaborations</p></div>
            <div className="rounded-2xl bg-[var(--paper)] p-4"><Banknote size={17} className="text-[var(--forest)]" aria-hidden="true" /><p className="mt-4 text-2xl font-black tabular-nums">{money(earned)}</p><p className="mt-1 text-xs text-[var(--muted)]">Settled earnings</p></div>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--line)] p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-[var(--muted)]">Awaiting payment</span><span className="font-black tabular-nums">{money(awaitingPayment)}</span></div></div>
          <Link href="/creator/earnings" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-4 text-sm font-black text-white">Open earnings <ArrowRight size={15} aria-hidden="true" /></Link>
        </Card>
      </div>

      <div className="mt-14"><PortfolioStrip items={data.portfolio} /></div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-6">
        <section aria-labelledby="collaborations-heading">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">In progress</p><h2 id="collaborations-heading" className="mt-2 text-2xl font-black tracking-[-.045em]">Latest collaborations</h2></div><Link href="/creator/bookings" className="min-h-11 rounded-full px-3 py-2 text-sm font-black text-[var(--forest)]">View all</Link></div>
          <div className="mt-5 space-y-3">
            {activeBookings.length ? activeBookings.slice(0, 3).map((booking) => <Link key={booking.id} href={`/creator/bookings/${booking.id}`} className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,34,31,.07)]"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--muted)]">Brand {booking.brandId} · Booking #{booking.id}</p><p className="mt-2 font-black tabular-nums">{money(Number(booking.amount))}</p></div><div className="flex items-center gap-3"><StatusBadge status={booking.status} /><ChevronRight size={17} aria-hidden="true" /></div></Link>) : <Card className="border border-dashed border-[var(--line)] shadow-none"><p className="font-black">No active collaborations.</p><p className="mt-2 text-sm text-[var(--muted)]">New brand requests will appear here.</p></Card>}
          </div>
        </section>

        <section aria-labelledby="conversations-heading">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">Inbox</p><h2 id="conversations-heading" className="mt-2 text-2xl font-black tracking-[-.045em]">Recent conversations</h2></div><Link href="/creator/messages" className="min-h-11 rounded-full px-3 py-2 text-sm font-black text-[var(--forest)]">Open inbox</Link></div>
          <div className="mt-5 space-y-3">
            {data.conversations.length ? data.conversations.slice(0, 3).map((conversation) => <Link key={conversation.threadId} href={`/creator/messages/${encodeURIComponent(conversation.threadId)}`} className="flex min-h-20 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 transition-colors hover:border-[var(--forest)]"><Avatar className="h-11 w-11"><AvatarFallback>{initials(conversation.participantEmail || "Brand")}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate font-black">{conversation.participantEmail || "Brand conversation"}</p><p className="mt-1 truncate text-sm text-[var(--muted)]">{conversation.latestBody}</p></div><ChevronRight size={17} className="shrink-0 text-[var(--muted)]" aria-hidden="true" /></Link>) : <Card className="border border-dashed border-[var(--line)] shadow-none"><p className="font-black">Your inbox is quiet.</p><p className="mt-2 text-sm text-[var(--muted)]">Brand conversations will appear here with their booking context.</p></Card>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
