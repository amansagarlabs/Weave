"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { nav, navIcons, roleMeta, type Role } from "./workspace-nav";

type CommandSearchProps = { role: Role };

export function CommandSearch({ role }: CommandSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const items = useMemo(() => {
    const routes = nav[role].map(([label, href]) => ({ label, href, detail: roleMeta[role].label }));
    return [
      ...routes,
      { label: "Notifications", href: "/notifications", detail: "Updates and activity" },
      { label: "Account settings", href: `/${role}/settings`, detail: "Preferences and account" },
      ...(role === "admin" ? [{ label: "Admin command center", href: "/admin/dashboard", detail: "Platform operations" }] : []),
    ];
  }, [role]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(value));
  }, [items, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }

  function choose(index = selected) {
    const item = filtered[index];
    if (!item) return;
    close();
    router.push(item.href);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape" && open) close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelected(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setSelected((current) => Math.min(current, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  return (
    <>
      <button
        type="button"
        aria-label="Search routes"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[0_8px_24px_rgba(23,34,31,.06)] transition-colors hover:bg-[var(--paper)]"
      >
        <Search size={18} aria-hidden="true" />
      </button>

      {open ? createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--forest)]/18 px-4 pt-[12vh]" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="command-search-title" className="w-full max-w-xl overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[0_24px_70px_rgba(23,34,31,.25)]">
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
              <Search size={18} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
              <h2 id="command-search-title" className="sr-only">Search routes</h2>
              <input
                ref={inputRef}
                data-command-search-input="true"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") { event.preventDefault(); setSelected((current) => Math.min(current + 1, filtered.length - 1)); }
                  if (event.key === "ArrowUp") { event.preventDefault(); setSelected((current) => Math.max(current - 1, 0)); }
                  if (event.key === "Enter") { event.preventDefault(); choose(); }
                }}
                placeholder="Search routes"
                className="min-h-14 min-w-0 flex-1 appearance-none border-0 bg-transparent text-base font-bold outline-none ring-0 placeholder:text-[var(--muted)] focus:border-0 focus:outline-none focus:ring-0"
              />
              <kbd className="hidden rounded-md border border-[var(--line)] px-2 py-1 text-[10px] font-black text-[var(--muted)] sm:inline">ESC</kbd>
              <button type="button" aria-label="Close search" onClick={close} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"><X size={17} /></button>
            </div>

            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-[var(--muted)]">{roleMeta[role].label}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]"><Command size={12} /> Navigate</span>
            </div>

            <div className="max-h-[min(26rem,55vh)] overflow-y-auto px-2 pb-3" role="listbox" aria-label="Search results">
              {filtered.length ? filtered.map((item, index) => {
                const Icon = navIcons[item.label as keyof typeof navIcons] ?? ArrowRight;
                return <button key={`${item.href}-${item.label}`} type="button" role="option" aria-selected={selected === index} onMouseEnter={() => setSelected(index)} onClick={() => choose(index)} className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left transition-colors ${selected === index ? "bg-[var(--accent)] text-[var(--on-bright)]" : "hover:bg-[var(--paper)]"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected === index ? "bg-white/60" : "bg-[var(--paper)]"}`}><Icon size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.label}</strong><span className={`mt-0.5 block truncate text-xs ${selected === index ? "text-[var(--on-bright)]/70" : "text-[var(--muted)]"}`}>{item.detail}</span></span><ArrowRight size={16} aria-hidden="true" /></button>;
              }) : <p className="px-3 py-10 text-center text-sm font-bold text-[var(--muted)]">No routes match “{query}”.</p>}
            </div>
            <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[11px] font-bold text-[var(--muted)]"><span>↑↓ Move</span><span>Enter Open</span><span>Esc Close</span></div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
