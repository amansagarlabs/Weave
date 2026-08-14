"use client";

import { LogOut, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ActiveNavLink } from "./active-nav-link";
import { LogoutButton } from "./auth-gate";
import { SearchForm } from "./search-form";
import { SidebarExpandHandle, SidebarTrigger, useSidebar } from "./sidebar";
import { VersionSwitcher } from "./version-switcher";
import { Logo, nav, navIcons, roleMeta, WeaveMark, type Role } from "./workspace-nav";

export function AppSidebar({ role }: { role: Role }) {
  const { collapsed } = useSidebar();
  const items = nav[role];
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter(([label]) => label.toLowerCase().includes(trimmed));
  }, [items, query]);

  return (
    <aside
      className={`group fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--line)] bg-[var(--forest)] text-white shadow-[8px_0_32px_rgba(23,34,31,.12)] transition-[width] duration-300 lg:flex ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex h-full w-full flex-col gap-5 p-4">
        <div className={`relative flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-3`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Logo />
              <SidebarTrigger className="border-white/10 bg-white/10 text-white shadow-none hover:bg-white/15" />
            </div>
          ) : (
            <div className="group/logo relative flex item-rs-center justify-center">
              <WeaveMark className="h-10 w-10 rounded-xl" />
              <div className="absolute inset-0 opacity-0 transition-all duration-200 group-hover/logo:opacity-100 group-focus-within/logo:opacity-100">
                <SidebarExpandHandle className="!h-10 !w-10 rounded-xl" />
              </div>
            </div>
          )}
        </div>

        {!collapsed ? <VersionSwitcher role={role} /> : null}

        {!collapsed ? (
          <div className="space-y-2">
            <p className="px-1 text-[11px] font-bold uppercase tracking-[.16em] text-white/55">Search</p>
            <SearchForm value={query} onChange={setQuery} placeholder="Search routes" />
          </div>
        ) : null}

        <nav className="space-y-2" aria-label="Workspace navigation">
          {visibleItems.map(([label, href]) => {
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
          {!visibleItems.length ? <p className="px-3 py-2 text-sm text-white/60">No routes match.</p> : null}
        </nav>

        <div className="mt-auto space-y-3">
          {!collapsed ? (
            <div className="rounded-2xl bg-[var(--accent)] p-4 text-[var(--ink)] shadow-[4px_4px_0_var(--orange)]">
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
                  window.localStorage.removeItem("weave_access_token");
                  window.localStorage.removeItem("weave_role");
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
