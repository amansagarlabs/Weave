import Link from "next/link";
import { ButtonLink } from "./ui";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
] as const;

const exploreGroups = [
  {
    label: "Creators",
    links: [
      { label: "Creator dashboard", href: "/creator/dashboard", description: "Manage bookings, earnings, and next steps." },
      { label: "Creator profile", href: "/creator/aarav-creates", description: "See the public storefront a brand sees." },
    ],
  },
  {
    label: "Brands",
    links: [
      { label: "Discover creators", href: "/brand/discover", description: "Browse the marketplace by category." },
      { label: "Brand dashboard", href: "/brand/dashboard", description: "Track campaigns, bookings, and messages." },
    ],
  },
  {
    label: "Editors",
    links: [
      { label: "Editor dashboard", href: "/editor/dashboard", description: "See the active request queue and work state." },
      { label: "Editor gigs", href: "/editor/gigs", description: "Manage services, pricing, and revisions." },
    ],
  },
  {
    label: "Get started",
    links: [
      { label: "Role selection", href: "/onboarding/role", description: "Choose the workspace that fits you." },
      { label: "Sign up", href: "/signup", description: "Create a new Weave account." },
    ],
  },
] as const;

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="text-2xl font-black tracking-[-0.08em]">
          weave<span className="text-[var(--orange)]">.</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-bold md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--forest)]">
              {link.label}
            </Link>
          ))}

          <details className="group relative">
            <summary className="flex list-none items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-white focus-visible:bg-white">
              <span>Explore</span>
              <span aria-hidden="true" className="text-xs transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="absolute left-1/2 top-[calc(100%+0.8rem)] w-[34rem] -translate-x-1/2 rounded-[24px] border border-[var(--line)] bg-white p-4 shadow-[0_16px_40px_rgba(23,34,31,.12)]">
              <div className="mb-4 flex items-center justify-between px-2">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Explore Weave</p>
                <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[var(--ink)]">
                  Flyout
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {exploreGroups.map((group) => (
                  <div key={group.label} className="rounded-2xl bg-[var(--paper)]/70 p-3">
                    <p className="px-1 text-[11px] font-black uppercase tracking-[.18em] text-[var(--muted)]">{group.label}</p>
                    <div className="mt-2 grid gap-2">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-xl bg-white px-4 py-3 transition-colors hover:bg-[var(--paper)]"
                        >
                          <span className="block text-sm font-black text-[var(--ink)]">{link.label}</span>
                          <span className="mt-1 block text-sm font-normal leading-6 text-[var(--muted)]">
                            {link.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-full px-5 py-3 text-sm font-bold">
            Log in
          </Link>
          <ButtonLink href="/onboarding/role" variant="accent">
            Join Weave
          </ButtonLink>
        </div>

        <details className="relative md:hidden">
          <summary className="flex min-h-12 min-w-12 list-none items-center justify-center rounded-full border border-[var(--line)] bg-white px-4 text-sm font-bold shadow-[0_8px_24px_rgba(23,34,31,.06)]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-3rem))] rounded-[24px] border border-[var(--line)] bg-white p-3 shadow-[0_16px_40px_rgba(23,34,31,.12)]">
            <nav aria-label="Mobile navigation" className="grid gap-1 text-sm font-bold">
              <Link href="/brand/discover" className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                Explore creators
              </Link>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                Log in
              </Link>
              <ButtonLink href="/onboarding/role" variant="accent">
                Join Weave
              </ButtonLink>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
