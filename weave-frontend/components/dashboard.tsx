"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import { ArrowUpRight, Bookmark, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Heart, Play, Sparkles, TrendingUp, Users, WandSparkles } from "lucide-react";
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
type ActivityRangePreset = "today" | "last-week" | "last-30-days" | "last-8-weeks" | "custom";

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
function localDate(value: string) { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); }
function dateKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; }

function MetricCard({ label, value, detail, icon: Icon, tone = "light" }: { label: string; value: string; detail: string; icon: typeof TrendingUp; tone?: "light" | "dark" }) {
  return <div className={`rounded-[20px] border p-4 sm:p-5 ${tone === "dark" ? "border-white/10 bg-[var(--dark-panel)] text-white" : "border-[var(--line)] bg-[var(--card)]"}`}><div className="flex items-center justify-between gap-3"><span className={`text-[10px] font-black uppercase tracking-[.16em] ${tone === "dark" ? "text-white/55" : "text-[var(--muted)]"}`}>{label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone === "dark" ? "bg-white/10" : "bg-[var(--paper)]"}`}><Icon size={15} className={tone === "dark" ? "text-[var(--accent)]" : "text-[var(--forest)]"} aria-hidden="true" /></span></div><p className="mt-4 text-2xl font-black tracking-[-.055em] tabular-nums">{value}</p><p className={`mt-1.5 truncate text-xs font-bold ${tone === "dark" ? "text-white/55" : "text-[var(--muted)]"}`}>{detail}</p></div>;
}

function FeedCard({ post, saved, liked, onSave, onLike }: { post: FeedPost; saved: boolean; liked: boolean; onSave: () => void; onLike: () => void }) {
  return <article className="group overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--card)]"><div className="relative aspect-[1.42/1] overflow-hidden bg-[var(--forest)]"><img src={post.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />{post.video ? <video className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" src={post.video} poster={post.image} muted loop playsInline autoPlay /> : null}<div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><Pill tone="lime">{post.tag}</Pill><span className="rounded-full bg-black/45 p-2 text-white backdrop-blur"><Play size={14} fill="currentColor" aria-hidden="true" /></span></div><a href={post.href} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 text-[10px] font-bold text-white/75 underline underline-offset-2">Pexels</a></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-xs font-black text-[var(--forest)]">{post.author} <span className="font-medium text-[var(--muted)]">{post.handle}</span></p><h3 className="mt-2 text-lg font-black tracking-[-.035em]">{post.title}</h3></div><span className="shrink-0 rounded-full bg-[var(--wash)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted)]">{post.kind}</span></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{post.caption}</p><div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4"><div className="flex items-center gap-4 text-xs font-bold text-[var(--muted)]"><button type="button" aria-label={`${liked ? "Unlike" : "Like"} ${post.title}`} onClick={onLike} className={`inline-flex items-center gap-1.5 ${liked ? "text-[var(--orange)]" : "hover:text-[var(--ink)]"}`}><Heart size={15} fill={liked ? "currentColor" : "none"} aria-hidden="true" />{post.likes + (liked ? 1 : 0)}</button><span>{post.comments} comments</span></div><button type="button" aria-label={`${saved ? "Remove" : "Save"} ${post.title}`} onClick={onSave} className={saved ? "text-[var(--forest)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}><Bookmark size={17} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button></div></div></article>;
}

function ActivityChart({ role, activityDates }: { role: Exclude<Role, "admin">; activityDates: string[] }) {
  const today = new Date();
  const isoDate = (value: Date) => value.toISOString().slice(0, 10);
  const daysAgo = (days: number) => { const value = new Date(today); value.setDate(value.getDate() - days); return isoDate(value); };
  const [rangePreset, setRangePreset] = useState<ActivityRangePreset>("last-8-weeks");
  const [rangeStart, setRangeStart] = useState(daysAgo(56));
  const [rangeEnd, setRangeEnd] = useState(isoDate(today));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => localDate(daysAgo(56)));
  const [selectingEnd, setSelectingEnd] = useState(false);
  const presets: { value: ActivityRangePreset; label: string; start: string; end: string }[] = [
    { value: "today", label: "Today", start: isoDate(today), end: isoDate(today) },
    { value: "last-week", label: "Last week", start: daysAgo(7), end: isoDate(today) },
    { value: "last-30-days", label: "Last 30 days", start: daysAgo(30), end: isoDate(today) },
    { value: "last-8-weeks", label: "Last 8 weeks", start: daysAgo(56), end: isoDate(today) },
  ];
  const selectPreset = (preset: typeof presets[number]) => { setRangePreset(preset.value); setRangeStart(preset.start); setRangeEnd(preset.end); setCalendarMonth(localDate(preset.start)); setSelectingEnd(false); };
  const selectCalendarDate = (value: Date) => {
    const selected = dateKey(value);
    setRangePreset("custom");
    if (!selectingEnd) {
      setRangeStart(selected);
      setRangeEnd(selected);
      setSelectingEnd(true);
    } else {
      if (selected < rangeStart) { setRangeStart(selected); setRangeEnd(rangeStart); } else setRangeEnd(selected);
      setSelectingEnd(false);
    }
  };
  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const calendarOffset = calendarStart.getDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) => new Date(calendarStart.getFullYear(), calendarStart.getMonth(), index - calendarOffset + 1));
  const rangeDays = Math.max(1, Math.ceil((new Date(`${rangeEnd}T23:59:59`).getTime() - new Date(`${rangeStart}T00:00:00`).getTime()) / (24 * 60 * 60 * 1000)));
  const bucketCount = rangePreset === "today" ? 1 : Math.min(8, Math.max(1, Math.ceil(rangeDays / 7)));
  const bars = Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(`${rangeStart}T00:00:00`).getTime();
    const end = new Date(`${rangeEnd}T23:59:59`).getTime();
    const bucketStart = start + ((end - start) * index) / bucketCount;
    const bucketEnd = index === bucketCount - 1 ? end + 1 : start + ((end - start) * (index + 1)) / bucketCount;
    return activityDates.filter((value) => { const timestamp = Date.parse(value); return Number.isFinite(timestamp) && timestamp >= bucketStart && timestamp < bucketEnd; }).length;
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
  return <Card className="relative overflow-visible bg-[var(--dark-panel)] text-white"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-white/50">Momentum</p><h2 className="mt-2 text-xl font-black">Your activity</h2><p className="mt-1 text-xs text-white/45">Bookings, messages, and invoices</p></div><div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><div className="relative z-40"><button type="button" onClick={() => setPickerOpen((open) => !open)} aria-expanded={pickerOpen} aria-haspopup="dialog" className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"><CalendarDays size={14} aria-hidden="true" />{rangePreset === "custom" ? `${rangeStart} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ ${rangeEnd}` : presets.find((preset) => preset.value === rangePreset)?.label}<span className="text-white/40">ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾</span></button>{pickerOpen ? <div role="dialog" aria-label="Choose activity date range" className="absolute right-0 top-11 z-50 w-[min(19rem,calc(100vw-3rem))] rounded-2xl border border-white/10 bg-[var(--dark-panel)] p-4 shadow-2xl sm:left-full sm:right-auto sm:top-0 sm:ml-3"><p className="text-[10px] font-black uppercase tracking-[.14em] text-white/45">Optional date range</p><div className="mt-3 grid grid-cols-2 gap-2">{presets.map((preset) => <button key={preset.value} type="button" onClick={() => selectPreset(preset)} className={`rounded-xl px-3 py-2 text-left text-xs font-bold transition ${rangePreset === preset.value ? "bg-[var(--accent)] text-[var(--on-bright)]" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}>{preset.label}</button>)}</div><div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-3"><div className="flex items-center justify-between"><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><ChevronLeft size={15} aria-hidden="true" /></button><p className="text-sm font-black">{calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p><button type="button" aria-label="Next month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><ChevronRight size={15} aria-hidden="true" /></button></div><div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase text-white/35">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}</div><div className="mt-2 grid grid-cols-7 gap-1">{calendarDays.map((day) => { const key = dateKey(day); const outside = day.getMonth() !== calendarMonth.getMonth(); const selected = key === rangeStart || key === rangeEnd; const inRange = key > rangeStart && key < rangeEnd; const future = key > isoDate(today); return <button key={key} type="button" disabled={outside || future} onClick={() => selectCalendarDate(day)} aria-label={day.toLocaleDateString("en-IN", { dateStyle: "long" })} className={`h-8 rounded-lg text-xs font-bold transition ${outside ? "text-white/15" : future ? "cursor-not-allowed text-white/20" : selected ? "bg-[var(--accent)] text-[var(--on-bright)]" : inRange ? "bg-[var(--accent)]/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>{day.getDate()}</button>; })}</div></div><div className="mt-3 flex items-center justify-between text-[10px] font-bold text-white/40"><span>{selectingEnd ? "Select end date" : "Select start date"}</span><span>{rangeStart} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ {rangeEnd}</span></div><button type="button" onClick={() => setPickerOpen(false)} className="mt-4 min-h-9 w-full rounded-xl bg-[var(--accent)] px-3 text-xs font-black text-[var(--on-bright)]">Apply range</button></div> : null}</div><div className="flex rounded-full border border-white/10 bg-white/5 p-1" role="radiogroup" aria-label="Chart type">{chartOptions.map((option) => <label key={option.value} className={`cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-bold transition ${chartType === option.value ? "bg-[var(--accent)] text-[var(--on-bright)]" : "text-white/55 hover:bg-white/10 hover:text-white"}`}><input type="radio" name={`activity-chart-${role}`} value={option.value} checked={chartType === option.value} onChange={() => setChartType(option.value)} className="sr-only" />{option.label}</label>)}</div></div></div><div className={`mt-5 ${isPie ? "h-56" : "h-48"}`} aria-label={`Your activity between ${rangeStart} and ${rangeEnd}: ${bars.join(", ")}`}><VChart spec={spec} /></div></Card>;
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
  const completedBookings = bookings.filter(booking => ["CONTENT_DELIVERED", "PAID"].includes(booking.status)).length;
  const paidInvoices = invoices.filter(invoice => invoice.status === "PAID");
  const paidValue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.netPayable ?? invoice.amount ?? 0), 0);
  const activityDates = [...bookings.map((booking) => booking.createdAt), ...threads.map((thread) => thread.latestAt), ...invoices.map((invoice) => invoice.createdAt)].filter((value): value is string => Boolean(value));
  const feed = useMemo(() => filter === "All" ? pexelsPosts : pexelsPosts.filter(post => post.kind === filter), [filter]);
  const toggle = (items: string[], setItems: (value: string[]) => void, id: string) => setItems(items.includes(id) ? items.filter(item => item !== id) : [...items, id]);

  return <AppShell role={role} title="Overview" eyebrow={view.eyebrow}>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6 sm:p-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--accent)]" />
        <div className="flex h-full flex-col justify-between gap-6 pl-2 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--forest)]" /><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Live workspace · Updated now</p></div>
            <h2 className="mt-4 text-3xl font-black tracking-[-.06em] sm:text-4xl">{view.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{view.subhead}</p>
          </div>
          <ButtonLink href={view.primaryHref} variant="accent">{view.primary} <ArrowUpRight size={16} className="ml-2" aria-hidden="true" /></ButtonLink>
        </div>
      </section>
      <Card className="relative overflow-hidden border border-[var(--line)] bg-[var(--dark-panel)] p-6 text-white shadow-none">
        <Sparkles size={18} className="text-[var(--accent)]" aria-hidden="true" />
        <p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-white/45">{view.accent}</p>
        <h2 className="mt-2 text-xl font-black tracking-[-.04em]">{view.spotlight}</h2>
        <Link href={view.spotlightHref} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-black text-[var(--accent)]">Take the next step <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </Card>
    </div>
    <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-[var(--line)] pb-3" role="tablist" aria-label="Dashboard views">{(["Overview", "Feed", "Analytics"] as ViewTab[]).map(item => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-black transition ${tab === item ? "bg-[var(--forest)] text-white" : "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"}`}>{item}</button>)}</div>

    {tab === "Overview" ? <>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><MetricCard label={role === "editor" ? "Incoming requests" : "Active campaigns"} value={loading ? "-" : String(role === "editor" ? requests.length : activeBookings)} detail={role === "editor" ? "Requests awaiting action" : "Campaigns in flight"} icon={Clock3} /><MetricCard label={role === "editor" ? "Active edits" : "Open conversations"} value={loading ? "-" : String(role === "editor" ? activeBookings : threads.length)} detail={role === "editor" ? "Collaborations in motion" : "Replies worth making"} icon={Users} tone="dark" /><MetricCard label={role === "editor" ? "Published gigs" : "Completed campaigns"} value={loading ? "-" : String(role === "editor" ? gigs.length : completedBookings)} detail={role === "editor" ? "Services visible to creators" : "Delivered or settled"} icon={CheckCircle2} /><MetricCard label="Settled value" value={loading ? "-" : money(paidValue)} detail={paidInvoices.length ? `${paidInvoices.length} settled invoice${paidInvoices.length === 1 ? "" : "s"}` : "Nothing settled yet"} icon={TrendingUp} /></div>
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.45fr)]"><ActivityChart role={role} activityDates={activityDates} /><Card className="border border-[var(--line)] p-6 shadow-none"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Today&apos;s focus</p><h2 className="mt-3 text-2xl font-black tracking-[-.05em]">Keep work moving</h2><div className="mt-6 space-y-4"><div className="flex items-center justify-between border-b border-[var(--line)] pb-4"><span className="text-sm font-bold text-[var(--muted)]">Open queue</span><span className="text-xl font-black tabular-nums">{role === "editor" ? requests.length : activeBookings}</span></div><div className="flex items-center justify-between border-b border-[var(--line)] pb-4"><span className="text-sm font-bold text-[var(--muted)]">Conversations</span><span className="text-xl font-black tabular-nums">{threads.length}</span></div><div className="flex items-center justify-between"><span className="text-sm font-bold text-[var(--muted)]">Settled invoices</span><span className="text-xl font-black tabular-nums">{paidInvoices.length}</span></div></div><Link href={role === "editor" ? "/editor/requests" : "/brand/bookings"} className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--forest)] px-4 text-sm font-black text-white">Open work queue <ArrowUpRight size={15} aria-hidden="true" /></Link></Card></div>
      <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">The community pulse</p><h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Fresh from the feed</h2></div><button type="button" onClick={() => setTab("Feed")} className="text-sm font-black text-[var(--forest)] underline underline-offset-4">See all</button></div><div className="mt-5 grid gap-5 lg:grid-cols-3">{pexelsPosts.map(post => <FeedCard key={post.id} post={post} saved={saved.includes(post.id)} liked={liked.includes(post.id)} onSave={() => toggle(saved, setSaved, post.id)} onLike={() => toggle(liked, setLiked, post.id)} />)}</div></section>
    </> : null}

    {tab === "Feed" ? <section className="mt-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Community pulse</p><h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Ideas worth saving</h2></div><div className="flex gap-2">{(["All", "Video", "Photo"] as FeedFilter[]).map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 rounded-full px-4 text-sm font-black ${filter === item ? "bg-[var(--ink)] text-white" : "bg-[var(--wash)] text-[var(--muted)]"}`}>{item}</button>)}</div></div><div className="mt-6 grid gap-5 lg:grid-cols-3">{feed.map(post => <FeedCard key={post.id} post={post} saved={saved.includes(post.id)} liked={liked.includes(post.id)} onSave={() => toggle(saved, setSaved, post.id)} onLike={() => toggle(liked, setLiked, post.id)} />)}</div><p className="mt-5 text-xs text-[var(--muted)]">Dummy media for local development. Video and photo credits link to Pexels.</p></section> : null}

    {tab === "Analytics" ? <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><ActivityChart role={role} activityDates={activityDates} /><Card><div className="flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Next actions</p><h2 className="mt-2 text-2xl font-black">Small moves, real momentum</h2></div><WandSparkles size={20} className="text-[var(--orange)]" aria-hidden="true" /></div><div className="mt-6 space-y-3">{["Reply to one open conversation", "Refresh one portfolio thumbnail", "Check tomorrow's delivery window"].map((item, index) => { const href = index === 0 ? `/${role}/messages` : index === 1 ? role === "creator" ? "/creator/profile/edit" : `/${role}/settings` : role === "editor" ? "/editor/requests" : `/${role}/bookings`; return <Link key={item} href={href} className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-4 text-sm font-bold transition hover:border-[var(--forest)]"><span>{item}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>; })}</div></Card></section> : null}
  </AppShell>;
}
