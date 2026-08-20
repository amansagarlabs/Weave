"use client";

import { VChart } from "@visactor/react-vchart";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Building2, CheckCircle2, CircleAlert, FileKey2, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { api } from "../../../lib/api";
import { AppShell, Card } from "../../../components/ui";

type User = { id: number; email: string; role: string; suspended: boolean; emailVerified?: boolean; mfaEnabled?: boolean };
type Organization = { id: number; name: string; disabled: boolean; personal: boolean; memberCount: number; createdAt: string };
type DeliveryEvent = { id: string; status: string; attempts: number; createdAt?: string; receivedAt?: string };
type ModerationItem = { id: number; type: string; subject: string; status: string };
type AuditEvent = { id: number; adminUserId: number; action: string; targetType: string; targetId: number | null; details: string | null; createdAt: string };
type Tool = { label: string; href: string; description: string; icon: typeof Users; emphasis?: "lime" | "dark" };

const tools: Tool[] = [
  { label: "Users", href: "/admin/users", description: "Roles, suspension, and impersonation.", icon: Users, emphasis: "lime" },
  { label: "Organizations", href: "/admin/organizations", description: "Membership and organization access.", icon: Building2 },
  { label: "Operations", href: "/admin/operations", description: "Outbox and webhook delivery health.", icon: Activity, emphasis: "dark" },
  { label: "Disputes", href: "/admin/disputes", description: "Moderation and escalation queues.", icon: CircleAlert },
  { label: "RBAC policies", href: "/admin/rbac", description: "CRUD permissions for platform roles.", icon: ShieldCheck },
  { label: "Content", href: "/admin/content", description: "Public copy and discovery taxonomy.", icon: FileKey2 },
];

const roleColors = ["#c9f646", "#43d79a", "#31c6b0", "#ffb547"];
const failedStatuses = new Set(["FAILED", "DEAD_LETTER", "REJECTED"]);

function MetricCard({ label, value, detail, icon: Icon, dark = false }: { label: string; value: string; detail: string; icon: typeof Users; dark?: boolean }) {
  return <Card className={dark ? "border border-white/5 bg-[var(--dark-panel)] text-white shadow-none" : "border border-[var(--line)] shadow-none"}><div className="flex items-center justify-between gap-3"><p className={`text-[10px] font-black uppercase tracking-[.16em] ${dark ? "text-white/45" : "text-[var(--muted)]"}`}>{label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "bg-white/10 text-[var(--accent)]" : "bg-[var(--paper)] text-[var(--forest)]"}`}><Icon size={15} aria-hidden="true" /></span></div><p className="mt-4 text-3xl font-black tracking-[-.065em] tabular-nums">{value}</p><p className={`mt-1.5 truncate text-xs font-bold ${dark ? "text-white/50" : "text-[var(--muted)]"}`}>{detail}</p></Card>;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [outbox, setOutbox] = useState<DeliveryEvent[]>([]);
  const [webhooks, setWebhooks] = useState<DeliveryEvent[]>([]);
  const [moderation, setModeration] = useState<ModerationItem[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setWarning("");
    const results = await Promise.allSettled([
      api<User[]>("/admin/users"),
      api<Organization[]>("/admin/organizations"),
      api<DeliveryEvent[]>("/admin/operations/outbox"),
      api<DeliveryEvent[]>("/admin/operations/webhooks"),
      api<ModerationItem[]>("/admin/disputes"),
      api<ModerationItem[]>("/admin/flags"),
      api<AuditEvent[]>("/admin/audit"),
    ]);
    const value = <T,>(index: number): T[] => results[index].status === "fulfilled" ? results[index].value as T[] : [];
    setUsers(value<User>(0));
    setOrganizations(value<Organization>(1));
    setOutbox(value<DeliveryEvent>(2));
    setWebhooks(value<DeliveryEvent>(3));
    setModeration([...value<ModerationItem>(4), ...value<ModerationItem>(5)]);
    setAudit(value<AuditEvent>(6));
    const unavailable = results.filter((result) => result.status === "rejected").length;
    if (unavailable) setWarning(`${unavailable} admin data source${unavailable === 1 ? " is" : "s are"} temporarily unavailable.`);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const suspended = users.filter((user) => user.suspended).length;
  const activeTeams = organizations.filter((organization) => !organization.personal && !organization.disabled).length;
  const openModeration = moderation.filter((item) => !/(RESOLVED|RESTORED|CLEARED)/i.test(item.status)).length;
  const deliveryEvents = [...outbox, ...webhooks];
  const deliveryIssues = deliveryEvents.filter((event) => failedStatuses.has(event.status.toUpperCase())).length;
  const roleCounts = useMemo(() => ["CREATOR", "BRAND", "EDITOR", "ADMIN"].map((role) => ({ role, count: users.filter((user) => user.role?.toUpperCase() === role).length })), [users]);
  const roleValues = roleCounts.some((item) => item.count) ? roleCounts : [{ role: "No accounts", count: 1 }];

  const activityValues = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = dayKey(date);
      return { day: date.toLocaleDateString("en-IN", { weekday: "short" }), actions: audit.filter((event) => dayKey(new Date(event.createdAt)) === key).length };
    });
  }, [audit]);

  const roleSpec: any = {
    type: "pie", background: "transparent", padding: 8,
    data: [{ id: "roles", values: roleValues }], categoryField: "role", valueField: "count",
    outerRadius: 0.88, innerRadius: 0.64, color: roleColors,
    pie: { style: { cornerRadius: 7, stroke: "#0e1612", lineWidth: 3 } }, legends: { visible: false },
    tooltip: { visible: true, renderMode: "canvas", confine: true },
  };

  const activitySpec: any = {
    type: "area", background: "transparent", padding: { top: 14, right: 12, bottom: 4, left: 4 },
    data: [{ id: "audit", values: activityValues }], xField: "day", yField: "actions", color: ["#c9f646"],
    line: { style: { stroke: "#c9f646", lineWidth: 3, curveType: "monotone" } },
    area: { style: { fill: "rgba(201,246,70,.16)", curveType: "monotone" } },
    point: { visible: true, style: { size: 7, fill: "#0e1612", stroke: "#e8ff8f", lineWidth: 2 } },
    axes: [
      { orient: "bottom", label: { style: { fill: "rgba(255,255,255,.42)", fontSize: 10 } }, tick: { visible: false }, domainLine: { visible: false }, grid: { visible: false } },
      { orient: "left", label: { style: { fill: "rgba(255,255,255,.35)", fontSize: 10 } }, tick: { visible: false }, domainLine: { visible: false }, grid: { style: { stroke: "rgba(255,255,255,.08)", lineDash: [3, 5] } } },
    ],
    tooltip: { visible: true, renderMode: "canvas", confine: true }, crosshair: { xField: { visible: false }, yField: { visible: false } },
  };

  const queueItems = [
    { label: "Suspended users", value: suspended, href: "/admin/users" },
    { label: "Disabled organizations", value: organizations.filter((item) => item.disabled).length, href: "/admin/organizations" },
    { label: "Moderation review", value: openModeration, href: "/admin/disputes" },
    { label: "Delivery failures", value: deliveryIssues, href: "/admin/operations" },
  ];

  return <AppShell role="admin" title="Control plane" eyebrow="Super admin" skin="analytics">
    {warning ? <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--orange)]/30 bg-[var(--card)] px-4 py-3 text-sm font-bold"><span role="alert">{warning}</span><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 text-xs text-[var(--forest)]"><RefreshCw size={13} aria-hidden="true" /> Retry</button></div> : null}

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="relative overflow-hidden rounded-[24px] border border-white/5 bg-[var(--dark-panel)] p-6 text-white shadow-[0_24px_60px_rgba(4,15,10,.2)] sm:p-7"><div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--accent)]/12 blur-3xl" /><div className="relative flex h-full flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" /><p className="text-[10px] font-black uppercase tracking-[.17em] text-white/45">Live platform overview</p></div><h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-.065em] sm:text-5xl">Operate Weave with signal, not noise.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Accounts, access, moderation, and delivery health from current platform records.</p></div><Link href="/admin/users" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-black text-[var(--on-bright)]">Review users <ArrowUpRight size={15} aria-hidden="true" /></Link></div></section>
      <Card className="border border-[var(--line)] p-6 shadow-none"><div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">System posture</p>{deliveryIssues || openModeration ? <CircleAlert size={18} className="text-[var(--orange)]" aria-hidden="true" /> : <CheckCircle2 size={18} className="text-[var(--forest)]" aria-hidden="true" />}</div><p className="mt-5 text-3xl font-black tracking-[-.06em]">{loading ? "Checking" : deliveryIssues || openModeration ? "Needs attention" : "Healthy"}</p><div className="mt-6 space-y-3 text-xs font-bold text-[var(--muted)]"><div className="flex justify-between"><span>Delivery failures</span><strong className="text-[var(--ink)]">{deliveryIssues}</strong></div><div className="flex justify-between"><span>Open moderation</span><strong className="text-[var(--ink)]">{openModeration}</strong></div><div className="flex justify-between"><span>Admin actions</span><strong className="text-[var(--ink)]">{audit.length}</strong></div></div></Card>
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total users" value={loading ? "-" : String(users.length)} detail={`${suspended} suspended`} icon={Users} /><MetricCard label="Active teams" value={loading ? "-" : String(activeTeams)} detail={`${organizations.length} organizations total`} icon={Building2} dark /><MetricCard label="Review queue" value={loading ? "-" : String(openModeration)} detail="Disputes and flags" icon={CircleAlert} /><MetricCard label="Delivery health" value={loading ? "-" : deliveryIssues ? `${deliveryIssues} issues` : "Healthy"} detail={`${deliveryEvents.length} recorded events`} icon={Activity} /></div>

    <section className="mt-6 grid gap-5 lg:grid-cols-[.72fr_1.38fr_.72fr]">
      <Card className="overflow-hidden border border-[var(--line)] bg-[var(--dark-panel)] p-5 text-white shadow-none"><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/45">Account mix</p><h2 className="mt-2 text-xl font-black">Platform roles</h2><div className="mt-3 h-52" aria-label={roleCounts.map((item) => `${item.role}: ${item.count}`).join(", ")}><VChart spec={roleSpec} /></div><div className="flex flex-wrap gap-x-3 gap-y-2">{roleCounts.map((item, index) => <span key={item.role} className="inline-flex items-center gap-1.5 text-[9px] font-black text-white/50"><span className="h-2 w-2 rounded-full" style={{ background: roleColors[index] }} />{item.role} {item.count}</span>)}</div></Card>
      <Card className="overflow-hidden border border-white/5 bg-[var(--dark-panel)] p-5 text-white shadow-none"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/45">Privileged activity</p><h2 className="mt-2 text-xl font-black">Last seven days</h2></div><Link href="/admin/audit" className="text-xs font-black text-[var(--accent)]">Audit log</Link></div><div className="mt-3 h-[250px]" aria-label={activityValues.map((item) => `${item.day}: ${item.actions}`).join(", ")}><VChart spec={activitySpec} /></div></Card>
      <Card className="border border-[var(--line)] p-5 shadow-none"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Action queue</p><h2 className="mt-2 text-xl font-black">Review next</h2><div className="mt-5 divide-y divide-[var(--line)]">{queueItems.map((item) => <Link key={item.label} href={item.href} className="flex min-h-14 items-center justify-between gap-3 py-3"><span className="text-xs font-bold text-[var(--muted)]">{item.label}</span><span className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-black ${item.value ? "bg-[var(--accent)] text-[var(--on-bright)]" : "bg-[var(--paper)] text-[var(--muted)]"}`}>{item.value}</span></Link>)}</div></Card>
    </section>

    <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
      <Card className="overflow-hidden border border-[var(--line)] p-0 shadow-none"><div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Audit stream</p><h2 className="mt-1 text-xl font-black">Recent privileged actions</h2></div><Link href="/admin/audit" className="text-xs font-black text-[var(--forest)]">View all</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="text-[10px] uppercase tracking-[.12em] text-[var(--muted)]"><th className="px-5 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Admin</th><th className="px-5 py-3 text-right">Time</th></tr></thead><tbody>{audit.slice(0, 5).map((event) => <tr key={event.id} className="border-t border-[var(--line)]"><td className="px-5 py-4 font-black">{event.action.replaceAll("_", " ")}</td><td className="px-4 py-4 text-[var(--muted)]">{event.targetType}{event.targetId ? ` #${event.targetId}` : ""}</td><td className="px-4 py-4">#{event.adminUserId}</td><td className="px-5 py-4 text-right text-xs text-[var(--muted)]">{new Date(event.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td></tr>)}{!audit.length ? <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--muted)]">No privileged actions recorded.</td></tr> : null}</tbody></table></div></Card>
      <Card className="bg-[var(--accent)] text-[var(--on-bright)] shadow-none"><ShieldCheck size={22} aria-hidden="true" /><p className="mt-8 text-[10px] font-black uppercase tracking-[.16em]">Policy control</p><h2 className="mt-2 text-2xl font-black tracking-[-.05em]">Keep access intentional.</h2><p className="mt-3 text-sm font-semibold leading-6 opacity-70">Review role permissions after resolving active access incidents.</p><Link href="/admin/rbac" className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--dark-panel)] px-4 text-sm font-black text-white">Open RBAC policies <ArrowUpRight size={15} aria-hidden="true" /></Link></Card>
    </section>

    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Platform tools</p><h2 className="mt-2 text-2xl font-black tracking-[-.05em]">Operational workspace</h2></div><Link href="/admin/audit" className="text-xs font-black text-[var(--forest)]">View audit</Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{tools.map(({ label, href, description, icon: Icon, emphasis }) => <Link key={href} href={href} className={`group rounded-[20px] border p-5 transition hover:-translate-y-1 ${emphasis === "lime" ? "border-transparent bg-[var(--accent)] text-[var(--on-bright)]" : emphasis === "dark" ? "border-white/5 bg-[var(--dark-panel)] text-white" : "border-[var(--line)] bg-[var(--card)] hover:border-[var(--forest)]"}`}><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10"><Icon size={18} aria-hidden="true" /></span><ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" /></div><h3 className="mt-5 font-black">{label}</h3><p className={`mt-1.5 text-xs leading-5 ${emphasis === "dark" ? "text-white/50" : "text-[var(--muted)]"}`}>{description}</p></Link>)}</div></section>
  </AppShell>;
}
