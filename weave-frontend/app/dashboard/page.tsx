"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

type Role = "creator" | "brand" | "editor" | "admin";

export default function DashboardEntry() {
  const router = useRouter();

  useEffect(() => {
    api<{ user: { role: string } }>("/auth/session").then(({ user }) => router.replace(`/${user.role.toLowerCase()}/dashboard`)).catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6">
      <p className="text-sm font-bold text-[var(--muted)]">Opening your workspace…</p>
    </div>
  );
}
