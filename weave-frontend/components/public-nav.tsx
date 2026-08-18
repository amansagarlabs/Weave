"use client";

import Link from "next/link";
import { ChevronDown, LogOut, PanelLeftClose } from "lucide-react";
import { ButtonLink } from "./ui";
import { publicNavCopy } from "../lib/copy";
import { Logo } from "./workspace-nav";
import { clearPublicSession, dashboardHrefForRole, usePublicSession } from "./public-session";

export function PublicNav() {
  const session = usePublicSession();
  const isLoggedIn = session.ready && session.authenticated;
  const dashboardHref = dashboardHrefForRole(session.role);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/92 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 md:grid-cols-[1fr_auto_1fr] lg:px-10">
        <div className="justify-self-start">
          <Logo />
        </div>

        <nav aria-label="Main navigation" className="hidden h-11 items-center gap-5 text-sm font-bold md:flex lg:gap-7">
          {publicNavCopy.links.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center rounded-full px-2 leading-none transition-colors hover:text-[var(--forest)]">
              {link.label}
            </Link>
          ))}

          <details className="group relative flex h-11 items-center">
            <summary className="inline-flex min-h-11 list-none items-center gap-1.5 rounded-full px-3 leading-none text-[var(--ink)] transition-colors hover:bg-[var(--card)] focus-visible:bg-[var(--card)]">
              <span>Explore</span>
              <ChevronDown size={14} aria-hidden="true" className="mt-0.5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-1/2 top-[calc(100%+0.8rem)] w-[34rem] -translate-x-1/2 rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-4 text-[var(--ink)] shadow-[0_16px_40px_rgba(23,34,31,.12)]">
              <div className="mb-4 flex items-center justify-between px-2">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">{publicNavCopy.exploreLabel}</p>
                <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[var(--on-bright)]">
                  {publicNavCopy.flyoutTag}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {publicNavCopy.exploreGroups.map((group) => (
                  <div key={group.label} className="rounded-2xl bg-[var(--paper)]/70 p-3">
                    <p className="px-1 text-[11px] font-black uppercase tracking-[.18em] text-[var(--muted)]">{group.label}</p>
                    <div className="mt-2 grid gap-2">
                      {group.links.map((link) => (
                        <Link key={link.href} href={link.href} className="rounded-xl bg-[var(--card)] px-4 py-3 text-[var(--ink)] transition-colors hover:bg-[var(--paper)]">
                          <span className="block text-sm font-black text-[var(--ink)]">{link.label}</span>
                          <span className="mt-1 block text-sm font-normal leading-6 text-[var(--muted)]">{link.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </nav>

        <div className="hidden items-center gap-2 justify-self-end md:flex lg:gap-3">
          {isLoggedIn ? (
            <>
              <Link href={dashboardHref} className="rounded-full px-5 py-3 text-sm font-bold text-[var(--forest)]">
                Workspace
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearPublicSession();
                  window.location.assign("/login");
                }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[var(--ink)] transition-colors hover:bg-[var(--card)]"
              >
                <LogOut size={16} aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full px-5 py-3 text-sm font-bold text-[var(--ink)]">
              {publicNavCopy.login}
            </Link>
          )}
          <ButtonLink href={isLoggedIn ? dashboardHref : "/onboarding/role"} variant="accent">
            {isLoggedIn ? "Open workspace" : publicNavCopy.join}
          </ButtonLink>
        </div>

        <details className="relative justify-self-end md:hidden">
          <summary className="flex min-h-12 min-w-12 list-none items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--ink)] shadow-[0_8px_24px_rgba(23,34,31,.06)]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-3rem))] rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-3 text-[var(--ink)] shadow-[0_16px_40px_rgba(23,34,31,.12)]">
            <nav aria-label="Mobile navigation" className="grid gap-1 text-sm font-bold">
              <Link href={publicNavCopy.mobileDiscover.href} className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                {publicNavCopy.mobileDiscover.label}
              </Link>
              {publicNavCopy.links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link href={dashboardHref} className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                    Workspace
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clearPublicSession();
                      window.location.assign("/login");
                    }}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--paper)]"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                  </button>
                </>
              ) : (
                <Link href="/login" className="rounded-xl px-4 py-3 transition-colors hover:bg-[var(--paper)]">
                  {publicNavCopy.login}
                </Link>
              )}
              <ButtonLink href={isLoggedIn ? dashboardHref : "/onboarding/role"} variant="accent">
                {isLoggedIn ? "Open workspace" : publicNavCopy.join}
              </ButtonLink>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
