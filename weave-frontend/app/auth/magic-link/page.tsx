"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";

export default function MagicLinkPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setMessage("This sign-in link is missing its token."); return; }
    api<{ user: { role: string }; mfaRequired?: boolean; mfaToken?: string }>("/auth/magic-link/verify", { method: "POST", body: JSON.stringify({ token }) })
      .then(({ user, mfaRequired, mfaToken }) => {
        if (mfaRequired) {
          router.replace(`/auth/mfa?token=${encodeURIComponent(mfaToken ?? "")}&next=${encodeURIComponent(`/${String(user.role).toLowerCase()}/dashboard`)}`);
          return;
        }
        router.replace(`/${String(user.role).toLowerCase()}/dashboard`);
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "This sign-in link is invalid or expired."));
  }, [params, router]);

  return <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6 text-center text-[var(--ink)]"><p role="status" aria-live="polite" className="max-w-md text-lg font-bold">{message}</p></main>;
}
