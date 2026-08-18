"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Mail, Moon, Settings2, User } from "lucide-react";
import { api, csrfHeaders } from "../lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { roleMeta, type Role } from "./workspace-nav";

type CurrentUser = {
  email: string;
  locale: string;
  role: string;
  avatarUrl?: string | null;
};

type ThemeMode = "light" | "dark";

function initialFrom(email: string, role: Role) {
  return (email.trim()[0] || role[0] || "W").toUpperCase();
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = mode;
}

export function ProfileMenu({ role }: { role: Role }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    api<CurrentUser>("/users/me")
      .then(setUser)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("weave_theme");
    const nextTheme: ThemeMode = stored === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("weave_theme", nextTheme);
    applyTheme(nextTheme);
  }

  function logout() {
    void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/logout`, { method: "POST", credentials: "include", headers: csrfHeaders() });
    setOpen(false);
    router.replace("/login");
  }

  const email = user?.email ?? roleMeta[role].label;
  const initials = user?.email ? initialFrom(user.email, role) : role[0].toUpperCase();
  const avatarUrl = user?.avatarUrl ?? null;
  const profileHref = role === "creator" ? "/creator/profile/edit" : `/${role}/settings`;
  const settingsHref = `/${role}/settings`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-2 pr-2.5 text-left shadow-[0_8px_24px_rgba(23,34,31,.06)] transition-colors hover:bg-[var(--paper)]"
      >
        <Avatar className="h-10 w-10 border-none bg-[var(--forest)]">
          {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
          <AvatarFallback className="bg-[var(--forest)] text-[13px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 md:block">
          <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Account</span>
          <span className="block max-w-32 truncate text-sm font-black text-[var(--ink)]">{email}</span>
        </span>
        <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+0.4rem)] z-40 w-[min(17.5rem,calc(100vw-1rem))] overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--card)] shadow-[0_18px_32px_rgba(23,34,31,.14)]"
        >
          <div className="p-2.5">
            <div className="rounded-[18px] border border-[var(--line)] bg-[var(--paper)] px-3.5 py-3.5 text-center">
              <Avatar className="mx-auto h-11 w-11 border-none bg-[var(--forest)]">
                {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
                <AvatarFallback className="bg-[var(--forest)] text-[13px]">{initials}</AvatarFallback>
              </Avatar>
              <p className="mt-2.5 truncate text-sm font-black text-[var(--ink)]">{email}</p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--muted)]">{roleMeta[role].label}</p>
            </div>
          </div>

          <div className="px-2 pb-2">
            <Link
              href={profileHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm font-bold transition-colors hover:bg-[var(--paper)]"
            >
              <User size={17} aria-hidden="true" />
              My Profile
            </Link>
            <Link
              href={settingsHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm font-bold transition-colors hover:bg-[var(--paper)]"
            >
              <Settings2 size={17} aria-hidden="true" />
              Email Settings
            </Link>
            <Link
              href="/notifications"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm font-bold transition-colors hover:bg-[var(--paper)]"
            >
              <Mail size={17} aria-hidden="true" />
              Notifications
            </Link>
          </div>

          <div className="border-t border-[var(--line)] px-2.5 py-2.5">
            <button
              type="button"
              role="menuitem"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-bold transition-colors hover:bg-[var(--paper)]"
            >
              <span className="inline-flex items-center gap-2.5">
                <Moon size={17} aria-hidden="true" />
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </span>
              <span
                aria-hidden="true"
                className={`relative inline-flex h-6 w-11 items-center rounded-full border px-1 transition-colors ${
                  theme === "dark" ? "border-[var(--forest)] bg-[var(--forest)]" : "border-[var(--line)] bg-[var(--paper)]"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`}
                />
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="mt-2 inline-flex min-h-10 w-full items-center justify-between rounded-full border border-[var(--line)] bg-[var(--card)] px-3.5 text-sm font-bold text-[var(--ink)] transition-colors hover:bg-[var(--paper)]"
            >
              <span className="inline-flex items-center gap-2.5">
                <LogOut size={17} aria-hidden="true" />
                <span>Log Out</span>
              </span>
              <span className="text-[var(--muted)]">Exit</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
