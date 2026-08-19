"use client";

import { LogOut, Search } from "lucide-react";
import { ActiveNavLink } from "./active-nav-link";
import { clearAuthSessionCache, LogoutButton } from "./auth-gate";
import { SidebarExpandHandle, SidebarTrigger, useSidebar } from "./sidebar";
import { Logo, nav, navIcons, roleMeta, WeaveMark, type Role } from "./workspace-nav";
import { csrfHeaders } from "../lib/api";
import { OrganizationSwitcher } from "./organization-switcher";

export function AppSidebar({ role }: { role: Role }) {
  const { collapsed } = useSidebar();
  const items = nav[role];
  return (
    <aside
      className={`group fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--line)] bg-[var(--forest)] text-white shadow-[8px_0_32px_rgba(23,34,31,.12)] transition-[width] duration-300 lg:flex ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex h-full w-full flex-col gap-5 p-4">
        <div className={`relative flex w-full items-center ${collapsed ? "justify-center" : "justify-between"} gap-3`}>
          {!collapsed ? (
            <div className="flex w-full items-center justify-between gap-5">
              <Logo />
              <SidebarTrigger className="border-white/10 bg-white/10 text-white shadow-none hover:bg-white/15" />
            </div>
          ) : (
            <div className="group/logo relative flex items-center justify-center">
              <WeaveMark className="h-10 w-10 rounded-xl" />
              <div className="absolute inset-0 opacity-0 transition-all duration-200 group-hover/logo:opacity-100 group-focus-within/logo:opacity-100">
                <SidebarExpandHandle className="!h-10 !w-10 rounded-xl" />
              </div>
            </div>
          )}
        </div>

        <OrganizationSwitcher collapsed={collapsed} />

        <nav className="space-y-2" aria-label="Workspace navigation">
          {items.map(([label, href]) => {
            const Icon = navIcons[label as keyof typeof navIcons] ?? Search;

            return (
              <ActiveNavLink
                key={href}
                href={href}
                title={label}
                aria-label={label}
                className={`group flex min-h-11 items-center rounded-2xl px-3 text-sm font-bold transition-colors hover:bg-white/10 ${
                  collapsed ? "justify-center" : "gap-3"
                }`}
                activeClassName="bg-white/15 text-[var(--accent)]"
              >
                <Icon size={17} className="shrink-0" aria-hidden="true" />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </ActiveNavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {!collapsed ? (
            <div className="rounded-2xl bg-[var(--accent)] p-4 text-[var(--on-bright)] shadow-[4px_4px_0_var(--orange)]">
              <p className="text-xs font-bold uppercase tracking-widest">Weave note</p>
              <p className="mt-2 text-sm font-bold leading-5">{roleMeta[role].accent}</p>
            </div>
          ) : null}

          <div className={`flex ${collapsed ? "justify-center" : "justify-between"} items-center gap-2`}>
            {!collapsed ? (
              <LogoutButton />
            ) : (
              <button
                type="button"
                aria-label="Log out"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/15"
                onClick={() => {
                  clearAuthSessionCache();
                  void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/logout`, { method: "POST", credentials: "include", headers: csrfHeaders() });
                  window.location.assign("/login");
                }}
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
