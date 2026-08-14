"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "creator" | "brand" | "editor" | "admin";

function storedRole(): Role | null {
  const value = window.localStorage.getItem("weave_role");
  return value === "creator" || value === "brand" || value === "editor" || value === "admin" ? value : null;
}

export default function DashboardEntry() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("weave_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const role = storedRole();
    router.replace(role ? `/${role}/dashboard` : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6">
      <p className="text-sm font-bold text-[var(--muted)]">Opening your workspace…</p>
    </div>
  );
}
