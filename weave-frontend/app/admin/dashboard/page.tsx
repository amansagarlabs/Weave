"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Building2, CheckCircle2, CircleAlert, FileKey2, RefreshCw, ShieldCheck, UserRound, Users } from "lucide-react";
import { Card, Pill } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";
import { api } from "../../../lib/api";

type User = { id?: number; email?: string; role?: string; suspended: boolean };
type Organization = { disabled: boolean; personal: boolean };
type Tool = { label: string; href: string; description: string; icon: typeof Users; tone: "lime" | "forest" | "coral" | "dark" | "paper" };

const tools: Tool[] = [
  { label: "Users", href: "/admin/users", description: "Manage accounts, roles, suspension, and impersonation.", icon: Users, tone: "lime" },
  { label: "Organizations", href: "/admin/organizations", description: "Review team accounts and membership health.", icon: Building2, tone: "forest" },
  { label: "Disputes and flags", href: "/admin/disputes", description: "Handle escalations and moderation decisions.", icon: CircleAlert, tone: "coral" },
  { label: "Operations", href: "/admin/operations", description: "Inspect outbox and webhook delivery health.", icon: Activity, tone: "dark" },
  { label: "Content and taxonomy", href: "/admin/content", description: "Keep public copy and discovery categories aligned.", icon: FileKey2, tone: "paper" },
  { label: "RBAC policies", href: "/admin/rbac", description: "Control CRUD permissions for platform roles.", icon: ShieldCheck, tone: "paper" },
];

const roleLabels = ["CREATOR", "BRAND", "EDITOR", "ADMIN"] as const;

function MetricCard({ label, value, detail, icon: Icon, dark = false }: { label: string; value: string; detail: string; icon: typeof Users; dark?: boolean }) {
  return <Card className={dark ? "bg-[var(--dark-panel)] text-white" : ""}><div className="flex items-start justify-between gap-3"><p className={dark ? "text-[11px] font-black uppercase tracking-[.16em] text-white/55" : "text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]"}>{label}</p><Icon size={18} className={dark ? "text-[var(--accent)]" : "text-[var(--forest)]"} aria-hidden="true" /></div><p className="mt-5 text-4xl font-black tracking-[-.07em] tabular-nums">{value}</p><p className={dark ? "mt-2 text-xs font-bold text-white/55" : "mt-2 text-xs font-bold text-[var(--muted)]"}>{detail}</p></Card>;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [userList, organizationList] = await Promise.all([api<User[]>("/admin/users"), api<Organization[]>("/admin/organizations")]);
      setUsers(userList);
      setOrganizations(organizationList);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin overview.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const suspended = users.filter((user) => user.suspended).length;
  const disabledOrganizations = organizations.filter((organization) => organization.disabled).length;
  const teamOrganizations = organizations.filter((organization) => !organization.personal).length;
  const roleCounts = useMemo(() => roleLabels.map((role) => ({ role, count: users.filter((user) => user.role?.toUpperCase() === role).length })), [users]);
  const maxRoleCount = Math.max(1, ...roleCounts.map((item) => item.count));

  return <SurfacePage role="admin" title="Admin command center." eyebrow="Super Admin" description="Keep Weave healthy, safe, and moving from one operational view.">
    {error ? <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[var(--danger)]/30 bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--danger)]"><span role="alert">{error}</span><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-[var(--danger)]/30 px-3 py-2 text-xs"><RefreshCw size={13} aria-hidden="true" />Retry</button></div> : null}
    <section className="relative mt-6 overflow-hidden rounded-[30px] bg-[var(--dark-panel)] p-6 text-white shadow-[8px_10px_0_var(--accent)] sm:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" /><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="lime">Live control plane</Pill><span className="text-xs font-bold text-white/50">{loading ? "Syncing data..." : "Updated just now"}</span></div><h2 className="mt-5 max-w-2xl text-4xl font-black leading-[.95] tracking-[-.075em] sm:text-6xl">See the whole platform clearly.</h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/65 sm:text-base">Accounts, access, organizations, and operational signals in one focused workspace.</p></div><Link href="/admin/users" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-black text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)]">Review users <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total users" value={loading ? "-" : String(users.length)} detail={suspended + " suspended"} icon={Users} /><MetricCard label="Team organizations" value={loading ? "-" : String(teamOrganizations)} detail={organizations.length + " total organizations"} icon={Building2} dark /><MetricCard label="Access blocked" value={loading ? "-" : String(disabledOrganizations + suspended)} detail={disabledOrganizations + " orgs, " + suspended + " users"} icon={CircleAlert} /><MetricCard label="Control plane" value={loading ? "-" : "Healthy"} detail="Admin API responding" icon={CheckCircle2} /></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><Card><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Account mix</p><h2 className="mt-2 text-2xl font-black">Who is on Weave?</h2></div><UserRound size={21} className="text-[var(--forest)]" aria-hidden="true" /></div><div className="mt-7 space-y-5">{roleCounts.map(({ role, count }) => <div key={role}><div className="mb-2 flex items-center justify-between text-xs font-black"><span>{role}</span><span className="text-[var(--muted)]">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--wash)]"><div className="h-full rounded-full bg-[var(--forest)] transition-all duration-500" style={{ width: (count / maxRoleCount) * 100 + "%" }} /></div></div>)}</div><Link href="/admin/users" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--forest)] underline underline-offset-4">Open user management <ArrowUpRight size={14} aria-hidden="true" /></Link></Card><Card className="bg-[var(--accent)] text-[var(--on-bright)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.16em]">Start here</p><h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Keep the queue clean.</h2></div><ShieldCheck size={24} aria-hidden="true" /></div><p className="mt-4 max-w-lg text-sm font-semibold leading-6 opacity-75">Review blocked access first, then inspect delivery health and moderation escalations before changing policy.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><Link href="/admin/users" className="rounded-2xl bg-[var(--ink)] px-4 py-4 text-sm font-black text-white transition hover:-translate-y-0.5">Users <ArrowUpRight size={14} className="mt-2" aria-hidden="true" /></Link><Link href="/admin/operations" className="rounded-2xl bg-[var(--ink)] px-4 py-4 text-sm font-black text-white transition hover:-translate-y-0.5">Operations <ArrowUpRight size={14} className="mt-2" aria-hidden="true" /></Link><Link href="/admin/disputes" className="rounded-2xl bg-[var(--ink)] px-4 py-4 text-sm font-black text-white transition hover:-translate-y-0.5">Moderation <ArrowUpRight size={14} className="mt-2" aria-hidden="true" /></Link></div></Card></div>
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">Platform tools</p><h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Move with intent.</h2></div><Link href="/admin/audit" className="text-sm font-black text-[var(--forest)] underline underline-offset-4">View audit log</Link></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(({ label, href, description, icon: Icon, tone }) => <Link key={href} href={href} className={"group rounded-[24px] border border-[var(--line)] p-5 transition hover:-translate-y-1 hover:border-[var(--forest)] hover:shadow-[4px_5px_0_var(--line)] " + (tone === "dark" ? "bg-[var(--dark-panel)] text-white" : tone === "lime" ? "bg-[var(--accent)] text-[var(--on-bright)]" : "bg-[var(--card)]")}><div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/10"><Icon size={20} aria-hidden="true" /></span><ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" /></div><h3 className="mt-6 text-xl font-black">{label}</h3><p className={tone === "dark" ? "mt-2 text-sm leading-6 text-white/60" : "mt-2 text-sm leading-6 text-[var(--muted)]"}>{description}</p></Link>)}</div></section>
  </SurfacePage>;
}
