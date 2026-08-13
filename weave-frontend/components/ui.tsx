import Link from "next/link";
import { Bell, BriefcaseBusiness, Compass, Home, Inbox, WalletCards } from "lucide-react";

export type Role = "creator" | "brand" | "editor";

export const roleMeta: Record<Role, { label: string; accent: string; dashboard: string }> = {
  creator: { label: "Creator workspace", accent: "Your work, your way.", dashboard: "/creator/dashboard" },
  brand: { label: "Brand workspace", accent: "Find the right fit.", dashboard: "/brand/dashboard" },
  editor: { label: "Editor workspace", accent: "Make good work better.", dashboard: "/editor/dashboard" },
};

export function Logo() {
  return <Link href="/" className="text-2xl font-black tracking-[-0.08em]">weave<span className="text-[var(--orange)]">.</span></Link>;
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "lime" | "forest" | "coral" }) {
  const styles = { default: "border-[var(--line)] bg-white", lime: "border-[var(--accent)] bg-[var(--accent)]", forest: "border-[var(--forest)] bg-[var(--forest)] text-white", coral: "border-[var(--orange)] bg-[var(--orange)]" };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] ${styles[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const tone = lower.includes("paid") || lower.includes("complete") || lower.includes("accepted") || lower.includes("delivered") ? "forest" : lower.includes("overdue") || lower.includes("failed") || lower.includes("rejected") ? "coral" : "lime";
  return <Pill tone={tone}>{status}</Pill>;
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "accent" | "outline" }) {
  const styles = { primary: "bg-[var(--forest)] text-white shadow-[4px_4px_0_var(--orange)]", accent: "bg-[var(--accent)] text-[var(--ink)] shadow-[4px_4px_0_var(--ink)]", outline: "border-2 border-[var(--ink)] bg-transparent" };
  return <Link href={href} className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-transform active:scale-[.97] ${styles[variant]}`}>{children}</Link>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(23,34,31,.06)] ${className}`}>{children}</div>;
}

export function EmptyState({ title, copy, href, action }: { title: string; copy: string; href: string; action: string }) {
  return <Card className="border border-dashed border-[var(--line)] text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl" aria-hidden="true">✦</div><h2 className="mt-5 text-2xl font-black tracking-[-.05em]">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{copy}</p><div className="mt-5"><ButtonLink href={href}>{action} ↗</ButtonLink></div></Card>;
}

const nav: Record<Role, Array<[string, string]>> = {
  creator: [["Home", "/creator/dashboard"], ["Bookings", "/creator/bookings"], ["Messages", "/creator/messages"], ["Hire an editor", "/creator/hire-editor"], ["Earnings", "/creator/earnings"]],
  brand: [["Home", "/brand/dashboard"], ["Discover", "/brand/discover"], ["Messages", "/brand/messages"], ["Bookings", "/brand/bookings"]],
  editor: [["Home", "/editor/dashboard"], ["Requests", "/editor/requests"], ["Gigs", "/editor/gigs"], ["Earnings", "/editor/earnings"]],
};

const navIcons = { Home, Bookings: BriefcaseBusiness, Messages: Inbox, "Hire an editor": Compass, Earnings: WalletCards, Discover: Compass, Requests: Inbox, Gigs: BriefcaseBusiness } as const;

export function MobileBottomNav({ role }: { role: Role }) {
  const items = nav[role].slice(0, 5);
  return <nav aria-label="Workspace navigation" className="fixed inset-x-0 bottom-0 z-20 grid border-t border-[var(--line)] bg-white/95 px-2 py-2 backdrop-blur" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
    {items.map(([label, href]) => { const Icon = navIcons[label as keyof typeof navIcons] ?? Home; return <Link key={href} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold text-[var(--muted)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)]"><Icon size={17} strokeWidth={2} aria-hidden="true" /><span className="max-w-full truncate">{label}</span></Link>; })}
  </nav>;
}

export function AppShell({ role, children, title, eyebrow }: { role: Role; children: React.ReactNode; title: string; eyebrow?: string }) {
  const items = nav[role];
  return <div className="min-h-screen bg-[var(--paper)] pb-20 lg:pb-0"><aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[var(--forest)] p-6 text-white lg:flex"><Logo /><p className="mt-16 text-xs font-bold uppercase tracking-[.16em] text-white/60">{roleMeta[role].label}</p><nav className="mt-5 space-y-2">{items.map(([label, href]) => { const Icon = navIcons[label as keyof typeof navIcons] ?? Home; return <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold transition-colors hover:bg-white/10"><Icon size={17} aria-hidden="true" />{label}</Link>; })}</nav><div className="mt-auto rounded-2xl bg-[var(--accent)] p-4 text-[var(--ink)]"><p className="text-xs font-bold uppercase tracking-widest">Weave note</p><p className="mt-2 text-sm font-bold leading-5">{roleMeta[role].accent}</p></div></aside><div className="lg:pl-64"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]/95 px-5 py-4 backdrop-blur lg:px-10 lg:py-5"><div className="flex items-center gap-4"><Link href="/" className="text-xl font-black tracking-[-.08em] lg:hidden">weave<span className="text-[var(--orange)]">.</span></Link><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">{eyebrow ?? roleMeta[role].label}</p><h1 className="mt-1 text-xl font-black tracking-[-.05em] sm:text-2xl">{title}</h1></div></div><div className="flex items-center gap-2 sm:gap-3"><Link href="/notifications" aria-label="Notifications" className="flex h-11 w-11 items-center justify-center rounded-full bg-white"><Bell size={18} aria-hidden="true" /></Link><Link href={`/${role}/settings`} aria-label="Open settings" className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] font-black">{role[0].toUpperCase()}</Link></div></header><main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</main></div><MobileBottomNav role={role} /></div>;
}

export function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Card><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">{label}</p><p className="mt-3 text-4xl font-black tracking-[-.07em] tabular-nums">{value}</p><p className="mt-2 text-sm text-[var(--muted)]">{detail}</p></Card>;
}

export function SectionHeading({ title, action, href }: { title: string; action?: string; href?: string }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black tracking-[-.04em]">{title}</h2>{action && href ? <Link href={href} className="min-h-11 rounded-full px-3 py-2 text-sm font-bold text-[var(--forest)] underline">{action} ↗</Link> : null}</div>;
}
