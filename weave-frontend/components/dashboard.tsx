"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import { ArrowUpRight, Bookmark, CheckCircle2, Clock3, Heart, Play, Sparkles, TrendingUp, Users, WandSparkles } from "lucide-react";
import { api } from "../lib/api";
import { AppShell, ButtonLink, Card, Pill, Role } from "./ui";

type Booking = { id: number; status: string; amount: number | string; createdAt?: string };
type MessageThread = { threadId: string; latestAt: string };
type EditRequest = { id: number; status: string };
type Gig = { id: number };
type Invoice = { id: number; status: string; netPayable: number | null; amount: number; createdAt?: string };
type ViewTab = "Overview" | "Feed" | "Analytics";
type FeedFilter = "All" | "Video" | "Photo";
type ActivityChartType = "line" | "area" | "bar" | "pie";

type FeedPost = {
  id: string;
  kind: "Video" | "Photo";
  author: string;
  handle: string;
  title: string;
  caption: string;
  image: string;
  video?: string;
  likes: number;
  comments: number;
  tag: string;
  href: string;
};

const pexelsPosts: FeedPost[] = [
  { id: "studio-light", kind: "Video", author: "Aarav Menon", handle: "@aaravmakes", title: "Morning light, better stories", caption: "A quick look at the texture study for the new skincare brief.", image: "https://images.pexels.com/videos/1918465/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=1200", video: "https://videos.pexels.com/video-files/1918465/1918465-uhd_3840_2160_24fps.mp4", likes: 248, comments: 18, tag: "Behind the brief", href: "https://www.pexels.com/video/1918465/" },
  { id: "product-table", kind: "Photo", author: "Maya Studio", handle: "@mayastudio.in", title: "The campaign moodboard is live", caption: "Looking for a creator who can keep this soft, tactile energy moving.", image: "https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg?auto=compress&cs=tinysrgb&w=1200", likes: 186, comments: 24, tag: "Open brief", href: "https://www.pexels.com/photo/woman-using-laptop-3764014/" },
  { id: "edit-timeline", kind: "Video", author: "Nisha Cutroom", handle: "@nishacuts", title: "From selects to final cut", caption: "The tiny choices are where the rhythm starts to feel like a story.", image: "https://images.pexels.com/videos/7385122/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=1200", video: "https://videos.pexels.com/video-files/7385122/7385122-uhd_2560_1440_30fps.mp4", likes: 312, comments: 31, tag: "Edit notes", href: "https://www.pexels.com/video/7385122/" },
];

const roleCopy: Record<Exclude<Role, "admin">, { title: string; eyebrow: string; subhead: string; primary: string; primaryHref: string; spotlight: string; spotlightDetail: string; spotlightHref: string; accent: string }> = {
  creator: { title: "Your studio, in motion.", eyebrow: "Creator workspace", subhead: "Keep your next brief, your best work, and the people behind it close.", primary: "Upload content", primaryHref: "/creator/portfolio/upload", spotlight: "Build a sharper showcase", spotlightDetail: "Add a portfolio photo or video, then share your public username with brands.", spotlightHref: "/creator/profile/edit", accent: "Creator signal" },
  brand: { title: "Campaigns that feel alive.", eyebrow: "Brand workspace", subhead: "Move from a loose idea to a clear brief, then keep every collaborator in rhythm.", primary: "Discover creators", primaryHref: "/brand/discover", spotlight: "Your next campaign starts with a good fit", spotlightDetail: "Browse the creator feed, save a few voices, and open a conversation around the work you actually want.", spotlightHref: "/brand/discover", accent: "Campaign signal" },
  editor: { title: "The cut room is open.", eyebrow: "Editor workspace", subhead: "See what is waiting, what is moving, and where your craft can make the biggest difference.", primary: "Manage gigs", primaryHref: "/editor/gigs", spotlight: "Make your edit offer unmistakable", spotlightDetail: "A focused gig helps creators know exactly when to bring you in. Add a service, turnaround, and revision boundary.", spotlightHref: "/editor/gigs", accent: "Editor signal" },
};

function money(value: number) { return `INR ${Math.round(value).toLocaleString("en-IN")}`; }

function MetricCard({ label, value, detail, icon: Icon, tone = "light" }: { label: string; value: string; detail: string; icon: typeof TrendingUp; tone?: "light" | "dark" }) {
  return <div className={`rounded-[26px] border p-5 ${tone === "dark" ? "border-white/10 bg-[var(--dark-panel)] text-white" : "border-[var(--line)] bg-[var(--card)]"}`}><div className="flex items-center justify-between gap-3"><span className={`text-[11px] font-black uppercase tracking-[.16em] ${tone === "dark" ? "text-white/55" : "text-[var(--muted)]"}`}>{label}</span><Icon size={17} className={tone === "dark" ? "text-[var(--accent)]" : "text-[var(--forest)]"} aria-hidden="true" /></div><p className="mt-5 text-3xl font-black tracking-[-.06em]">{value}</p><p className={`mt-2 text-xs font-bold ${tone === "dark" ? "text-white/55" : "text-[var(--muted)]"}`}>{detail}</p></div>;
}

function FeedCard({ post, saved, liked, onSave, onLike }: { post: FeedPost; saved: boolean; liked: boolean; onSave: () => void; onLike: () => void }) {
  return <article className="group overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--card)]"><div className="relative aspect-[1.42/1] overflow-hidden bg-[var(--forest)]"><img src={post.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />{post.video ? <video className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" src={post.video} poster={post.image} muted loop playsInline autoPlay /> : null}<div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><Pill tone="lime">{post.tag}</Pill><span className="rounded-full bg-black/45 p-2 text-white backdrop-blur"><Play size={14} fill="currentColor" aria-hidden="true" /></span></div><a href={post.href} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 text-[10px] font-bold text-white/75 underline underline-offset-2">Pexels</a></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-xs font-black text-[var(--forest)]">{post.author} <span className="font-medium text-[var(--muted)]">{post.handle}</span></p><h3 className="mt-2 text-lg font-black tracking-[-.035em]">{post.title}</h3></div><span className="shrink-0 rounded-full bg-[var(--wash)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted)]">{post.kind}</span></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{post.caption}</p><div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4"><div className="flex items-center gap-4 text-xs font-bold text-[var(--muted)]"><button type="button" aria-label={`${liked ? "Unlike" : "Like"} ${post.title}`} onClick={onLike} className={`inline-flex items-center gap-1.5 ${liked ? "text-[var(--orange)]" : "hover:text-[var(--ink)]"}`}><Heart size={15} fill={liked ? "currentColor" : "none"} aria-hidden="true" />{post.likes + (liked ? 1 : 0)}</button><span>{post.comments} comments</span></div><button type="button" aria-label={`${saved ? "Remove" : "Save"} ${post.title}`} onClick={onSave} className={saved ? "text-[var(--forest)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}><Bookmark size={17} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button></div></div></article>;
}

function ActivityChart({ role, activityDates }: { role: Exclude<Role, "admin">; activityDates: string[] }) {
  const bars = Array.from({ length: 8 }, (_, index) => {
    const end = Date.now() - (7 - index) * 7 * 24 * 60 * 60 * 1000;
    const start = end - 7 * 24 * 60 * 60 * 1000;
    return activityDates.filter((value) => { const timestamp = Date.parse(value); return Number.isFinite(timestamp) && timestamp >= start && timestamp < end; }).length;
  });
  const maxValue = Math.max(1, ...bars);
  const [chartType, setChartType] = useState<ActivityChartType>("line");
  const chartOptions: { value: ActivityChartType; label: string }[] = [{ value: "line", label: "Line" }, { value: "area", label: "Area" }, { value: "bar", label: "Bars" }, { value: "pie", label: "Pie" }];
  const isPie = chartType === "pie";
  const spec: any = {
    type: chartType,
    background: "transparent",
    padding: { top: 8, right: 12, bottom: 4, left: 4 },
    data: [{ id: "momentum", values: bars.map((value, index) => ({ week: `Week ${index + 1}`, value })) }],
    ...(isPie ? { categoryField: "week", valueField: "value", outerRadius: 0.82, innerRadius: 0.52, legends: { visible: false } } : { xField: "week", yField: "value" }),
    color: ["#e8ff3f"],
    ...(chartType === "line" || chartType === "area" ? { line: { style: { lineWidth: 3, curveType: "monotone" } }, point: { visible: true, style: { size: 7, fill: "#17231f", stroke: "#e8ff3f", lineWidth: 2 } } } : {}),
    ...(!isPie ? { axes: [{ orient: "bottom", label: { style: { fill: "rgba(255,255,255,.42)", fontSize: 10 } }, tick: { visible: false }, domainLine: { visible: false }, grid: { visible: false } }, { orient: "left", max: maxValue, min: 0, label: { style: { fill: "rgba(255,255,255,.35)", fontSize: 10 } }, tick: { visible: false }, domainLine: { visible: false }, grid: { style: { stroke: "rgba(255,255,255,.1)", lineDash: [2, 4] } } }] } : {}),
    tooltip: { visible: true, renderMode: "canvas", confine: true, style: { panel: { backgroundColor: "rgba(23,35,31,.94)", border: { color: "rgba(232,255,63,.35)", width: 1, radius: 14 }, shadow: { x: 0, y: 8, blur: 20, spread: 0, color: "rgba(0,0,0,.25)" } }, titleLabel: { fill: "rgba(255,255,255,.65)", fontWeight: "700" }, keyLabel: { fill: "rgba(255,255,255,.65)" }, valueLabel: { fill: "#e8ff3f", fontWeight: "800" } }, mark: { content: [{ key: "Activity", value: (data: any) => String(data?.[0]?.datum?.value ?? data?.[0]?.value ?? 0) }] } },
    crosshair: { xField: { visible: false }, yField: { visible: false } },
  };
  return <Card className="overflow-hidden bg-[var(--dark-panel)] text-white"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-white/50">Momentum</p><h2 className="mt-2 text-xl font-black">Your last 8 weeks</h2><p className="mt-1 text-xs text-white/45">Bookings, messages, and invoices</p></div><div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end"><TrendingUp size={20} className="text-[var(--accent)]" aria-hidden="true" /><div className="flex rounded-full border border-white/10 bg-white/5 p-1" role="radiogroup" aria-label="Chart type">{chartOptions.map((option) => <label key={option.value} className={`cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-bold transition ${chartType === option.value ? "bg-[var(--accent)] text-[var(--on-bright)]" : "text-white/55 hover:bg-white/10 hover:text-white"}`}><input type="radio" name={`activity-chart-${role}`} value={option.value} checked={chartType === option.value} onChange={() => setChartType(option.value)} className="sr-only" />{option.label}</label>)}</div></div></div><div className={`mt-5 ${isPie ? "h-56" : "h-48"}`} aria-label={`Your activity over the last eight weeks: ${bars.join(", ")}`}><VChart spec={spec} /></div></Card>;
}

export function RoleDashboard({ role }: { role: Exclude<Role, "admin"> }) {
  const view = roleCopy[role];
  const [tab, setTab] = useState<ViewTab>("Overview");
  const [filter, setFilter] = useState<FeedFilter>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestsPath = role === "creator" ? "/creator/editor-requests" : role === "editor" ? "/editor/requests" : null;
    const gigPath = role === "editor" ? "/editor/gigs" : role === "creator" ? "/creator/packages" : null;
    const tasks: Promise<unknown>[] = [api<Booking[]>("/bookings"), api<MessageThread[]>("/messages"), api<Invoice[]>("/invoices")];
    if (requestsPath) tasks.push(api<EditRequest[]>(requestsPath));
    if (gigPath) tasks.push(api<Gig[]>(gigPath));
    Promise.all(tasks).then(result => { setBookings(result[0] as Booking[]); setThreads(result[1] as MessageThread[]); setInvoices(result[2] as Invoice[]); if (requestsPath) setRequests(result[3] as EditRequest[]); if (gigPath) setGigs(result[requestsPath ? 4 : 3] as Gig[]); }).catch(() => undefined).finally(() => setLoading(false));
  }, [role]);

  const activeBookings = bookings.filter(booking => booking.status !== "PAID").length;
  const paidInvoices = invoices.filter(invoice => invoice.status === "PAID");
  const paidValue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.netPayable ?? invoice.amount ?? 0), 0);
  const activityDates = [...bookings.map((booking) => booking.createdAt), ...threads.map((thread) => thread.latestAt), ...invoices.map((invoice) => invoice.createdAt)].filter((value): value is string => Boolean(value));
  const feed = useMemo(() => filter === "All" ? pexelsPosts : pexelsPosts.filter(post => post.kind === filter), [filter]);
  const toggle = (items: string[], setItems: (value: string[]) => void, id: string) => setItems(items.includes(id) ? items.filter(item => item !== id) : [...items, id]);

  return <AppShell role={role} title={view.title} eyebrow={view.eyebrow}>
    <div className="relative overflow-hidden rounded-[32px] bg-[var(--dark-panel)] p-6 text-white shadow-[8px_10px_0_var(--accent)] sm:p-8 lg:p-10"><div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--accent)]/20 blur-3xl" /><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div className="max-w-2xl"><div className="flex flex-wrap items-center gap-2"><Pill tone="lime">Live workspace</Pill><span className="text-xs font-bold text-white/50">Updated just now</span></div><h2 className="mt-5 max-w-xl text-4xl font-black leading-[.96] tracking-[-.075em] sm:text-6xl">{view.title}</h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/65 sm:text-base">{view.subhead}</p></div><div className="flex flex-wrap gap-3"><ButtonLink href={view.primaryHref} variant="accent">{view.primary} <ArrowUpRight size={16} className="ml-2" aria-hidden="true" /></ButtonLink><Link href={role === "creator" ? "/creator/bookings" : role === "brand" ? "/brand/bookings" : "/editor/requests"} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Open queue</Link></div></div></div>
    <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-[var(--line)] pb-3" role="tablist" aria-label="Dashboard views">{(["Overview", "Feed", "Analytics"] as ViewTab[]).map(item => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-black transition ${tab === item ? "bg-[var(--forest)] text-white" : "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"}`}>{item}</button>)}</div>

    {tab === "Overview" ? <>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label={role === "editor" ? "Incoming requests" : "Active bookings"} value={loading ? "-" : String(role === "editor" ? requests.length : activeBookings)} detail={role === "brand" ? "Campaigns in flight" : role === "editor" ? "Keep the queue moving" : "Collabs in motion"} icon={Clock3} /><MetricCard label={role === "brand" ? "Open conversations" : "Community reach"} value={loading ? "-" : String(role === "brand" ? threads.length : 1280)} detail={role === "brand" ? "Replies worth making" : "People seeing your work"} icon={Users} tone="dark" /><MetricCard label={role === "editor" ? "Published gigs" : "Completed work"} value={loading ? "-" : String(role === "editor" ? gigs.length : bookings.filter(booking => ["ACCEPTED", "CONTENT_DELIVERED", "PAID"].includes(booking.status)).length)} detail={role === "creator" ? "Proof that travels" : "A clear next milestone"} icon={CheckCircle2} /><MetricCard label="Settled value" value={loading ? "-" : money(paidValue)} detail={paidInvoices.length ? `${paidInvoices.length} settled invoice${paidInvoices.length === 1 ? "" : "s"}` : "Nothing settled yet"} icon={TrendingUp} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><ActivityChart role={role} activityDates={activityDates} /><Card className="relative overflow-hidden bg-[var(--accent)] text-[var(--on-bright)]"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[18px] border-black/10" /><Sparkles size={23} aria-hidden="true" /><p className="mt-6 text-[11px] font-black uppercase tracking-[.16em]">{view.accent}</p><h2 className="mt-3 max-w-sm text-3xl font-black leading-none tracking-[-.06em]">{view.spotlight}</h2><p className="mt-4 max-w-sm text-sm font-semibold leading-6 opacity-75">{view.spotlightDetail}</p><Link href={view.spotlightHref} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-black text-white">Take the next step <ArrowUpRight size={15} aria-hidden="true" /></Link></Card></div>
      <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">The community pulse</p><h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Fresh from the feed</h2></div><button type="button" onClick={() => setTab("Feed")} className="text-sm font-black text-[var(--forest)] underline underline-offset-4">See all</button></div><div className="mt-5 grid gap-5 lg:grid-cols-3">{pexelsPosts.map(post => <FeedCard key={post.id} post={post} saved={saved.includes(post.id)} liked={liked.includes(post.id)} onSave={() => toggle(saved, setSaved, post.id)} onLike={() => toggle(liked, setLiked, post.id)} />)}</div></section>
    </> : null}

    {tab === "Feed" ? <section className="mt-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Community pulse</p><h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Ideas worth saving</h2></div><div className="flex gap-2">{(["All", "Video", "Photo"] as FeedFilter[]).map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 rounded-full px-4 text-sm font-black ${filter === item ? "bg-[var(--ink)] text-white" : "bg-[var(--wash)] text-[var(--muted)]"}`}>{item}</button>)}</div></div><div className="mt-6 grid gap-5 lg:grid-cols-3">{feed.map(post => <FeedCard key={post.id} post={post} saved={saved.includes(post.id)} liked={liked.includes(post.id)} onSave={() => toggle(saved, setSaved, post.id)} onLike={() => toggle(liked, setLiked, post.id)} />)}</div><p className="mt-5 text-xs text-[var(--muted)]">Dummy media for local development. Video and photo credits link to Pexels.</p></section> : null}

    {tab === "Analytics" ? <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><ActivityChart role={role} activityDates={activityDates} /><Card><div className="flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Next actions</p><h2 className="mt-2 text-2xl font-black">Small moves, real momentum</h2></div><WandSparkles size={20} className="text-[var(--orange)]" aria-hidden="true" /></div><div className="mt-6 space-y-3">{["Reply to one open conversation", "Refresh one portfolio thumbnail", "Check tomorrow's delivery window"].map((item, index) => { const href = index === 0 ? `/${role}/messages` : index === 1 ? role === "creator" ? "/creator/profile/edit" : `/${role}/settings` : role === "editor" ? "/editor/requests" : `/${role}/bookings`; return <Link key={item} href={href} className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-4 text-sm font-bold transition hover:border-[var(--forest)]"><span>{item}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>; })}</div></Card></section> : null}
  </AppShell>;
}
