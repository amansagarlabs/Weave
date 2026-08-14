"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "./ui";

function storedRole(): Role | null {
  const value = window.localStorage.getItem("weave_role");
  return value === "creator" || value === "brand" || value === "editor" || value === "admin" ? value : null;
}

export function AuthGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("weave_access_token");
    const actualRole = storedRole();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (actualRole && actualRole !== role) {
      router.replace(`/${actualRole}/dashboard`);
      return;
    }
    setReady(true);
  }, [pathname, role, router]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6"><p className="text-sm font-bold text-[var(--muted)]">Checking your workspace...</p></div>;
  return <>{children}</>;
}

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  function logout() {
    window.localStorage.removeItem("weave_access_token");
    window.localStorage.removeItem("weave_role");
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
