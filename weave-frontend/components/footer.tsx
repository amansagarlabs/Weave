"use client";

import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { Logo } from "./workspace-nav";
import { clearPublicSession, dashboardHrefForRole, usePublicSession } from "./public-session";
import { CrowdCanvas } from "./ui/skiper-ui/skiper39";

type FooterProps = {
  compact?: boolean;
};

const audienceLinks = [
  { label: "Creators", copy: "Show your work", href: "/signup?role=creator" },
  { label: "Brands", copy: "Find the right voice", href: "/signup?role=brand" },
  { label: "Editors", copy: "Meet your next client", href: "/signup?role=editor" },
] as const;

export function Footer({ compact = false }: FooterProps) {
  const session = usePublicSession();
  const isLoggedIn = session.ready && Boolean(session.token);
  const dashboardHref = dashboardHrefForRole(session.role);

  return (
    <footer
      className={`relative w-full overflow-hidden bg-[var(--forest)] text-white ${
        compact ? "mt-8" : "mt-16"
      }`}
    >
      <div className="relative z-30 px-6 pb-12 pt-10 sm:px-10 sm:pb-16 lg:px-16 lg:pt-14">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-8">
            <Logo />
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
              <Link href="/#how-it-works" className="rounded-full px-2 py-2 text-white/75 transition-colors hover:text-white">
                How it works
              </Link>
              <Link href="/#pricing" className="rounded-full px-2 py-2 text-white/75 transition-colors hover:text-white">
                Pricing
              </Link>
              <Link href="/help" className="rounded-full px-2 py-2 text-white/75 transition-colors hover:text-white">
                Help
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href={dashboardHref} className="rounded-full bg-white px-5 py-2.5 text-[var(--ink)] transition-transform active:scale-[.97]">
                    Workspace
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clearPublicSession();
                      window.location.assign("/login");
                    }}
                    className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-white/75 transition-colors hover:text-white"
                  >
                    <LogOut size={15} aria-hidden="true" />
                    Log out
                  </button>
                </>
              ) : (
                <Link href="/signup" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[var(--ink)] transition-transform active:scale-[.97]">
                  Join Weave
                </Link>
              )}
            </nav>
          </div>

          {!compact ? (
            <div className="grid gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:py-16">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">
                  The connector platform
                </p>
                <h2 className="mt-5 max-w-4xl text-5xl font-black leading-[.9] tracking-[-.07em] sm:text-7xl lg:text-[6.4rem]">
                  Find your people.
                  <br />
                  Make good work.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {audienceLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex min-h-28 flex-col justify-between rounded-[20px] bg-white/8 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] backdrop-blur-sm transition-[transform,background-color] duration-150 hover:-translate-y-1 hover:bg-white/13 focus-visible:outline-offset-4 active:translate-y-0"
                  >
                    <ArrowUpRight className="ml-auto text-[var(--accent)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={20} aria-hidden="true" />
                    <span>
                      <strong className="block text-base">{item.label}</strong>
                      <span className="mt-1 block text-xs text-white/60">{item.copy}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={`relative w-full overflow-hidden bg-[var(--paper)] text-[var(--ink)] ${
          compact ? "h-56" : "h-[30rem] sm:h-[36rem] lg:h-[42rem]"
        }`}
      >
        {!compact ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center px-6 pt-10 text-center sm:pt-14">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[.2em] text-[var(--muted)]">
              Creators · Brands · Editors
            </span>
            <span className="mt-3 max-w-[14ch] text-3xl font-black leading-[.95] tracking-[-.06em] sm:text-5xl">
              Good work finds its people.
            </span>
            <span className="mt-5 h-14 w-px bg-gradient-to-b from-[var(--ink)]/35 to-transparent" aria-hidden="true" />
          </div>
        ) : null}

        <CrowdCanvas
          src="https://media.adxy.dev/website/images/open-peeps-sheet.avif"
          rows={7}
          cols={15}
        />
      </div>

      {!compact ? (
        <div className="relative z-30 w-full border-t border-white/10 bg-[var(--ink)] px-6 py-6 text-xs text-white/60 sm:px-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-[1600px] items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <span className="justify-self-start whitespace-nowrap">© {new Date().getFullYear()} Weave</span>

            <nav
              aria-label="Footer utility navigation"
              className="flex flex-wrap items-center gap-x-1 gap-y-1 md:justify-center"
            >
              <Link href="/brand/discover" className="inline-flex min-h-11 items-center rounded-full px-3 leading-none transition-colors hover:text-white">
                Explore
              </Link>
              <Link href="/signup?role=creator" className="inline-flex min-h-11 items-center rounded-full px-3 leading-none transition-colors hover:text-white">
                Creators
              </Link>
              <Link href="/signup?role=brand" className="inline-flex min-h-11 items-center rounded-full px-3 leading-none transition-colors hover:text-white">
                Brands
              </Link>
              <Link href="/signup?role=editor" className="inline-flex min-h-11 items-center rounded-full px-3 leading-none transition-colors hover:text-white">
                Editors
              </Link>
              <Link href="/help" className="inline-flex min-h-11 items-center rounded-full px-3 leading-none transition-colors hover:text-white">
                Help
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-self-end">
              {isLoggedIn ? (
                <Link href={dashboardHref} className="rounded-full py-2 font-bold text-white transition-colors hover:text-[var(--accent)]">
                  Open workspace
                </Link>
              ) : (
                <Link href="/login" className="rounded-full py-2 font-bold text-white transition-colors hover:text-[var(--accent)]">
                  Log in
                </Link>
              )}
              <span className="hidden text-white/35 xl:inline" aria-hidden="true">·</span>
              <span className="hidden whitespace-nowrap xl:inline">Good work finds its people.</span>
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
