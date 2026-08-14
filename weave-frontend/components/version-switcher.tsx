"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { roleMeta, type Role } from "./workspace-nav";

export function VersionSwitcher({ role, collapsed = false }: { role: Role; collapsed?: boolean }) {
  return (
    <Link
      href={roleMeta[role].dashboard}
      className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 py-3 text-left transition-colors hover:bg-white"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--forest)] text-sm font-black text-white">
        {role[0].toUpperCase()}
      </span>
      {!collapsed ? (
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Workspace</span>
          <span className="block truncate text-sm font-black text-[var(--ink)]">{roleMeta[role].label}</span>
          <span className="block truncate text-xs text-[var(--muted)]">{roleMeta[role].accent}</span>
        </span>
      ) : null}
      <ChevronRight size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
    </Link>
  );
}
