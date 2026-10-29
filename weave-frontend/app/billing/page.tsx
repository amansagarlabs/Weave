"use client";

import { usePublicSession, dashboardHrefForRole } from "../../components/public-session";
import { BillingSettingsCard } from "../../components/billing-settings-card";
import { AppShell, ButtonLink, Card } from "../../components/ui";

export default function BillingPage() {
  const session = usePublicSession();

  if (!session.ready) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6"><p className="text-sm font-bold text-[var(--muted)]">Loading billing...</p></main>;
  }

  if (!session.authenticated || !session.role) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6"><Card className="max-w-md text-center"><h1 className="text-3xl font-black tracking-[-.06em]">Billing and subscriptions</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Sign in to view your plan and manage billing settings.</p><div className="mt-6"><ButtonLink href="/login?next=%2Fbilling" variant="accent">Sign in</ButtonLink></div></Card></main>;
  }

  return <AppShell role={session.role} title="Billing and subscriptions." eyebrow="Account billing"><div className="max-w-4xl"><p className="max-w-2xl leading-7 text-[var(--muted)]">Manage your Weave plan in one place. The free plan is active without a payment gateway or payment method.</p><div className="mt-8"><BillingSettingsCard /></div><div className="mt-5"><ButtonLink href={dashboardHrefForRole(session.role)} variant="outline">Back to workspace</ButtonLink></div></div></AppShell>;
}
