import { AppShell, ButtonLink, Card, EmptyState, Pill, Role, StatusBadge } from "./ui";
export { FormCard } from "./form-card";

export function SurfacePage({ role, title, eyebrow, description, action, actionHref, children }: { role: Role; title: string; eyebrow?: string; description?: string; action?: string; actionHref?: string; children?: React.ReactNode }) {
  return <AppShell role={role} title={title} eyebrow={eyebrow}><div className="flex flex-wrap items-end justify-between gap-5"><div><Pill>{eyebrow ?? "Workspace"}</Pill>{description ? <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{description}</p> : null}</div>{action && actionHref ? <ButtonLink href={actionHref} variant="accent">{action} ↗</ButtonLink> : null}</div><div className="mt-8">{children}</div></AppShell>;
}

export function ListCard({ title, subtitle, status, amount = "₹0" }: { title: string; subtitle: string; status: string; amount?: string }) {
  return <Card className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p></div><div className="flex items-center gap-4"><p className="font-black tabular-nums">{amount}</p><StatusBadge status={status} /></div></Card>;
}

export function StandardEmpty({ title = "Nothing here yet.", copy = "Your next step will appear here when there is something to act on.", href = "/", action = "Go home" }: { title?: string; copy?: string; href?: string; action?: string }) {
  return <EmptyState title={title} copy={copy} href={href} action={action} />;
}

export function Tabs({ labels }: { labels: string[] }) { return <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] pb-3" role="tablist">{labels.map((label, index) => <button key={label} type="button" role="tab" aria-selected={index === 0} className={`min-h-11 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)]"}`}>{label}</button>)}</div>; }

export function Timeline({ items }: { items: string[] }) { return <ol className="space-y-5">{items.map((item, index) => <li key={item} className="flex gap-4"><div className={`mt-1 h-4 w-4 shrink-0 rounded-full border-4 ${index === 0 ? "border-[var(--forest)] bg-[var(--accent)]" : "border-[var(--line)] bg-white"}`} aria-hidden="true" /><div><p className="font-bold">{item}</p><p className="mt-1 text-sm text-[var(--muted)]">Status update will appear here.</p></div></li>)}</ol>; }

export function DiscoveryCard({ name, category, price }: { name: string; category: string; price: string }) { return <Card className="group overflow-hidden p-0"><div className="flex aspect-[4/3] items-center justify-center bg-[var(--accent)] text-5xl text-[var(--on-bright)] transition-transform group-hover:scale-[1.02]" aria-hidden="true">✦</div><div className="p-5"><div className="flex items-center justify-between"><h3 className="font-black">{name}</h3><Pill>{category}</Pill></div><p className="mt-3 text-sm text-[var(--muted)]">Available for work · 18k followers</p><div className="mt-5 flex items-center justify-between"><span className="text-sm font-bold">From {price}</span><ButtonLink href="/brand/creator/sample" variant="outline">View profile</ButtonLink></div></div></Card>; }
