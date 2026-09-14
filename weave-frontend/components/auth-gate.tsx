"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "./ui";
import { api } from "../lib/api";
import { clearPublicSession } from "./public-session";
import { AppleLoader } from "./apple-loader";

type SessionUser = { role: string };
let cachedSessionUser: SessionUser | null = null;

export function clearAuthSessionCache() { cachedSessionUser = null; }

export function AuthGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(Boolean(cachedSessionUser));

  useEffect(() => {
    if (cachedSessionUser) {
      const actualRole = cachedSessionUser.role.toLowerCase() as Role;
      if (actualRole !== role) router.replace(`/${actualRole}/dashboard`);
      return;
    }
    api<{ user: SessionUser }>("/auth/session")
      .then(({ user }) => { cachedSessionUser = user; const actualRole = user.role.toLowerCase() as Role; if (actualRole !== role) router.replace(`/${actualRole}/dashboard`); else setReady(true); })
      .catch(() => router.replace(`/login?next=${encodeURIComponent(pathname)}`));
  }, [pathname, role, router]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6"><div className="text-center"><AppleLoader label="Checking your workspace" /><p className="mt-4 text-sm font-bold text-[var(--muted)]">Checking your workspace...</p></div></div>;
  return <>{children}</>;
}

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  async function logout() {
    clearAuthSessionCache();
    await clearPublicSession();
    router.replace("/login");
  }
  return (
    <button
      type="button"
      onClick={logout}
      className={`min-h-11 rounded-full border-2 border-white/30 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10 ${className}`}
    >
      Log out
    </button>
  );
}
