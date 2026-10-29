"use client";

import { Search } from "lucide-react";
import { ActiveNavLink } from "./active-nav-link";
import { SidebarExpandHandle, SidebarTrigger, useSidebar } from "./sidebar";
import { Logo, nav, navIcons, roleMeta, WeaveMark, type Role } from "./workspace-nav";
import { ProfileMenu } from "./profile-menu";

export function AppSidebar({ role }: { role: Role }) {
  const { collapsed } = useSidebar();
  const items = nav[role];
  return (
    <aside
      className={`group fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--line)] bg-[var(--card)] text-[var(--ink)] transition-[width] duration-300 lg:flex ${
        collapsed ? "w-[76px]" : "w-60"
      }`}
    >
      <div className="flex h-full w-full flex-col gap-5 p-3.5">
        <div className={`relative flex w-full items-center ${collapsed ? "justify-center" : "justify-between"} gap-3`}>
          {!collapsed ? (
            <div className="flex w-full items-center justify-between gap-5">
              <Logo />
              <SidebarTrigger className="border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] shadow-none hover:bg-[var(--wash)]" />
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

        {!collapsed ? <div className="px-2"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--muted)]">{roleMeta[role].label}</p><p className="mt-1 text-sm font-black">Overview</p></div> : null}

        <nav className="space-y-2" aria-label="Workspace navigation">
          {items.map(([label, href]) => {
            const Icon = navIcons[label as keyof typeof navIcons] ?? Search;

            return (
              <ActiveNavLink
                key={href}
                href={href}
                title={label}
                aria-label={label}
                className={`group flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-[var(--muted)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)] ${
                  collapsed ? "justify-center" : "gap-3"
                }`}
                activeClassName="bg-[var(--forest)] text-white shadow-[0_8px_18px_rgba(23,70,55,.15)]"
              >
                <Icon size={17} className="shrink-0" aria-hidden="true" />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </ActiveNavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <ProfileMenu role={role} placement="sidebar" compact={collapsed} />
        </div>
      </div>
    </aside>
  );
}
