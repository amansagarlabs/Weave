"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { AppShell, ButtonLink, Card, EmptyState, Metric, Pill, Role, SectionHeading, StatusBadge } from "./ui";

type Booking = {
  id: number;
  status: string;
  amount: number | string;
};

type MessageThread = {
  threadId: string;
  latestAt: string;
};

type EditRequest = {
  id: number;
  status: string;
};

type Gig = {
  id: number;
};

type Invoice = {
  id: number;
  status: string;
  netPayable: number | null;
  amount: number;
};

type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

type DashboardView = {
  title: string;
  eyebrow: string;
  emptyTitle: string;
  emptyCopy: string;
  emptyHref: string;
  emptyAction: string;
  actionHref: string;
  actionLabel: string;
  quickLinks: Array<[string, string]>;
};

const views: Record<Exclude<Role, "admin">, DashboardView> = {
  creator: {
    title: "Your creative desk.",
    eyebrow: "Creator workspace",
    emptyTitle: "Your next collab starts here.",
    emptyCopy: "Build your profile, add a package, and let the right brands discover your work.",
    emptyHref: "/creator/onboarding",
    emptyAction: "Complete your profile",
    actionHref: "/creator/packages",
    actionLabel: "Add a package",
    quickLinks: [
      ["Edit your profile", "/creator/profile/edit"],
      ["Upload portfolio", "/creator/portfolio"],
      ["Hire an editor", "/creator/hire-editor"],
    ],
  },
  brand: {
    title: "Make room for good work.",
    eyebrow: "Brand workspace",
    emptyTitle: "Find your next great fit.",
    emptyCopy: "Explore creators by category and start a conversation around a clear brief.",
    emptyHref: "/brand/discover",
    emptyAction: "Discover creators",
    actionHref: "/brand/discover",
    actionLabel: "Find creators",
    quickLinks: [
      ["Discover creators", "/brand/discover"],
      ["Open messages", "/brand/messages"],
      ["View bookings", "/brand/bookings"],
    ],
  },
  editor: {
    title: "Your work queue.",
    eyebrow: "Editor workspace",
    emptyTitle: "Ready when the work arrives.",
    emptyCopy: "Set up your editing services so creators can find the right help for their next piece.",
    emptyHref: "/editor/gigs",
    emptyAction: "Set up your gigs",
    actionHref: "/editor/gigs",
    actionLabel: "Manage gigs",
    quickLinks: [
      ["Set up your gigs", "/editor/gigs"],
      ["View requests", "/editor/requests"],
      ["See earnings", "/editor/earnings"],
    ],
  },
};

export function RoleDashboard({ role }: { role: Exclude<Role, "admin"> }) {
  const view = views[role];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const requestsPath = role === "creator" ? "/creator/editor-requests" : role === "editor" ? "/editor/requests" : null;
      const gigPath = role === "editor" ? "/editor/gigs" : role === "creator" ? "/creator/packages" : null;

      const tasks: Promise<unknown>[] = [api<Booking[]>("/bookings"), api<MessageThread[]>("/messages"), api<Invoice[]>("/invoices")];
      if (requestsPath) tasks.push(api<EditRequest[]>(requestsPath));
      if (gigPath) tasks.push(api<Gig[]>(gigPath));

      const result = await Promise.all(tasks);
      setBookings(result[0] as Booking[]);
      setThreads(result[1] as MessageThread[]);
      setInvoices(result[2] as Invoice[]);
      if (requestsPath) setRequests(result[3] as EditRequest[]);
      if (gigPath) setGigs(result[(requestsPath ? 4 : 3)] as Gig[]);
    }

    load()
      .catch(() => setError("Could not load your dashboard right now."))
      .finally(() => setLoading(false));
  }, [role]);

  const metrics = useMemo<DashboardMetric[]>(() => {
    const activeBookings = bookings.filter((booking) => booking.status !== "PAID").length;
    const completedBookings = bookings.filter((booking) => ["ACCEPTED", "CONTENT_DELIVERED", "PAID"].includes(booking.status)).length;
    const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
    const paidValue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.netPayable ?? invoice.amount ?? 0), 0);

    if (role === "creator") {
      return [
        { label: "Active bookings", value: String(activeBookings), detail: activeBookings ? "Collabs in motion" : "Ready when you are" },
        { label: "Editor requests", value: String(requests.length), detail: requests.length ? "Waiting on a response" : "No open requests" },
        { label: "Paid invoices", value: `₹${paidValue.toLocaleString("en-IN")}`, detail: paidInvoices.length ? `${paidInvoices.length} settled invoice${paidInvoices.length === 1 ? "" : "s"}` : "Nothing settled yet" },
      ];
    }

    if (role === "brand") {
      return [
        { label: "Active bookings", value: String(activeBookings), detail: activeBookings ? "Campaigns in flight" : "No campaigns yet" },
        { label: "Message threads", value: String(threads.length), detail: threads.length ? "Open conversations" : "Start a conversation" },
        { label: "Completed briefs", value: String(completedBookings), detail: completedBookings ? "Work delivered or paid" : "Nothing completed yet" },
      ];
    }

    return [
      { label: "Incoming requests", value: String(requests.length), detail: requests.length ? "Your queue is active" : "Your queue is clear" },
      { label: "Published gigs", value: String(gigs.length), detail: gigs.length ? "Services available" : "Add your first gig" },
      { label: "Paid invoices", value: `₹${paidValue.toLocaleString("en-IN")}`, detail: paidInvoices.length ? `${paidInvoices.length} settled invoice${paidInvoices.length === 1 ? "" : "s"}` : "Nothing settled yet" },
    ];
  }, [bookings, gigs.length, invoices, requests.length, role, threads.length]);

  return (
    <AppShell role={role} title={view.title} eyebrow={view.eyebrow}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="lime">Live workspace</Pill>
          <p className="mt-4 max-w-xl text-[var(--muted)]">A quick view of what needs your attention and where to go next.</p>
        </div>
        <ButtonLink href={view.actionHref} variant="accent">
          {view.actionLabel} ↗
        </ButtonLink>
      </div>

      {loading ? (
        <Card className="mt-8">
          <p className="text-sm font-bold text-[var(--muted)]">Loading your workspace…</p>
        </Card>
      ) : error ? (
        <Card className="mt-8">
          <p role="alert" className="text-sm font-bold text-[var(--danger)]">
            {error}
          </p>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <Metric key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
            <div>
              <SectionHeading
                title={role === "brand" ? "Active campaigns" : role === "editor" ? "Incoming requests" : "Your bookings"}
                action="View all"
                href={`/${role}/${role === "creator" ? "bookings" : role === "editor" ? "requests" : "bookings"}`}
              />
              <EmptyState title={view.emptyTitle} copy={view.emptyCopy} href={view.emptyHref} action={view.emptyAction} />
            </div>

            <div>
              <SectionHeading title="Quick links" />
              <Card className="space-y-2">
                {view.quickLinks.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between rounded-xl bg-[var(--paper)] px-4 py-4 text-sm font-bold transition-colors hover:bg-[var(--accent)]"
                  >
                    <span>{label}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </Card>
            </div>
          </div>

          <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-[var(--ink)] text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Keep it honest</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Weave shows clear status and payment-link information. It does not hold funds in escrow or promise screenshot-proof content.
              </p>
            </div>
            <StatusBadge status="Transparent by design" />
          </Card>
        </>
      )}
    </AppShell>
  );
}
