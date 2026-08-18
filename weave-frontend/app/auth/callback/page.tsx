"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("error")) { router.replace("/login?error=google-login-failed"); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/session`, { credentials: "include" })
      .then(async response => { if (!response.ok) throw new Error("session unavailable"); return response.json(); })
      .then(payload => router.replace(`/${String(payload.user.role).toLowerCase()}/dashboard`))
      .catch(() => router.replace("/login?error=google-login-failed"));
  }, [params, router]);
  return <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] text-[var(--ink)]">Signing you in...</main>;
}
