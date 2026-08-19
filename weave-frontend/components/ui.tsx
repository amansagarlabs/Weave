import Link from "next/link";
import { Bell } from "lucide-react";
import { ActiveNavLink } from "./active-nav-link";
import { AuthGate } from "./auth-gate";
import { AppSidebar } from "./app-sidebar";
import { ProfileMenu } from "./profile-menu";
import { NotificationMenu } from "./notification-menu";
import { CommandSearch } from "./command-search";
import { SidebarInset, SidebarProvider } from "./sidebar";
import { Logo, nav, navIcons, roleMeta, type Role } from "./workspace-nav";
import { cn } from "../lib/utils";

export type { Role };
export { Logo, roleMeta, nav, navIcons };

export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "lime" | "forest" | "coral";
}) {
  const styles = {
    default: "border-[var(--line)] bg-[var(--card)] text-[var(--ink)]",
    lime: "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-bright)]",
    forest: "border-[var(--forest)] bg-[var(--forest)] text-white",
    coral: "border-[var(--orange)] bg-[var(--orange)] text-[var(--on-bright)]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const tone = lower.includes("paid") || lower.includes("complete") || lower.includes("accepted") || lower.includes("delivered")
    ? "forest"
    : lower.includes("overdue") || lower.includes("failed") || lower.includes("rejected")
      ? "coral"
      : "lime";

  return <Pill tone={tone}>{status}</Pill>;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "accent" | "outline";
}) {
  const styles = {
    primary: "bg-[var(--forest)] text-white shadow-[4px_4px_0_var(--orange)]",
    accent: "bg-[var(--accent)] text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)]",
    outline: "border-2 border-[var(--ink)] bg-transparent",
  };

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-transform active:scale-[.97] ${styles[variant]}`}
      style={variant === "accent" ? { color: "var(--on-bright)" } : undefined}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const resolvedClassName = className.includes("bg-[var(--ink)] text-white")
    ? className.replace("bg-[var(--ink)] text-white", "bg-[var(--dark-panel)] text-[var(--on-dark)]")
    : className;

  return <div className={cn("rounded-2xl bg-[var(--card)] p-5 text-[var(--ink)] shadow-[0_8px_24px_rgba(23,34,31,.06)]", resolvedClassName)}>{children}</div>;
}

export function EmptyState({
  title,
  copy,
  href,
  action,
}: {
  title: string;
  copy: string;
  href: string;
  action: string;
}) {
  return (
    <Card className="border border-dashed border-[var(--line)] text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl text-[var(--on-bright)]" aria-hidden="true">
        ✦
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-[-.05em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{copy}</p>
      <div className="mt-5">
        <ButtonLink href={href}>{action} →</ButtonLink>
      </div>
    </Card>
  );
}

export function MobileBottomNav({ role }: { role: Role }) {
  const items = nav[role].slice(0, 5);

  return (
    <nav
      aria-label="Workspace navigation"
      className="fixed inset-x-0 bottom-0 z-20 grid border-t border-[var(--line)] bg-[var(--card)]/95 px-2 py-2 backdrop-blur lg:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(([label, href]) => {
        const Icon = navIcons[label as keyof typeof navIcons] ?? Bell;

        return (
          <ActiveNavLink
            key={href}
            href={href}
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold text-[var(--muted)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)]"
            activeClassName="bg-[var(--accent)] text-[var(--on-bright)]"
          >
            <Icon size={17} strokeWidth={2} aria-hidden="true" />
            <span className="max-w-full truncate">{label}</span>
          </ActiveNavLink>
        );
      })}
    </nav>
  );
}

export function AppShell({
  role,
  children,
  title,
  eyebrow,
}: {
  role: Role;
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
}) {
  return (
    <AuthGate role={role}>
      <SidebarProvider>
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-full focus-visible:bg-[var(--accent)] focus-visible:px-4 focus-visible:py-3 focus-visible:font-bold focus-visible:text-[var(--on-bright)]"
        >
          Skip to content
        </a>

        <div className="min-h-screen bg-[var(--paper)] pb-20 lg:pb-0">
          <AppSidebar role={role} />

          <SidebarInset>
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]/95 px-5 py-4 backdrop-blur lg:px-10 lg:py-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">{eyebrow ?? roleMeta[role].label}</p>
                  <h1 className="mt-1 text-xl font-black tracking-[-.05em] sm:text-2xl">{title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <CommandSearch role={role} />
                <NotificationMenu role={role} />
                <ProfileMenu role={role} />
              </div>
            </header>

            <main id="main-content" className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-10 lg:py-10">
              {children}
            </main>
          </SidebarInset>

          <MobileBottomNav role={role} />
        </div>
      </SidebarProvider>
    </AuthGate>
  );
}

export function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[-.07em] tabular-nums">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
    </Card>
  );
}

export function SectionHeading({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-black tracking-[-.04em]">{title}</h2>
      {action && href ? (
        <Link href={href} className="min-h-11 rounded-full px-3 py-2 text-sm font-bold text-[var(--forest)] underline">
          {action} →
        </Link>
      ) : null}
    </div>
  );
}
