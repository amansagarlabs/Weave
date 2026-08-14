"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardHrefForRole, usePublicSession } from "./public-session";

export function PublicSessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = usePublicSession();

  useEffect(() => {
    if (!session.ready || !session.token) return;
    router.replace(dashboardHrefForRole(session.role));
  }, [router, session.ready, session.role, session.token]);

  if (!session.ready || session.token) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6"><p className="text-sm font-bold text-[var(--muted)]">Checking your session...</p></div>;
  }

  return <>{children}</>;
}
