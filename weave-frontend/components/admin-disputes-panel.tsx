"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Card, Pill } from "./ui";

type ModerationItem = {
  id: number;
  type: string;
  subject: string;
  status: string;
  detail: string;
};

type TabKey = "Open" | "Reviewing" | "Resolved";

function tabForStatus(status: string): TabKey {
  const normalized = status.toUpperCase();
  if (normalized.includes("RESOLVED") || normalized.includes("RESTORED") || normalized.includes("CLEARED")) return "Resolved";
  if (normalized.includes("REVISION")) return "Reviewing";
  return "Open";
}

export function AdminDisputesPanel() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [flags, setFlags] = useState<ModerationItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("Open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([api<ModerationItem[]>("/admin/disputes"), api<ModerationItem[]>("/admin/flags")])
      .then(([disputes, flagged]) => {
        if (!mounted) return;
        setItems(disputes);
        setFlags(flagged);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Unable to load moderation queues right now.");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const openItems = useMemo(() => [...items, ...flags].filter((item) => tabForStatus(item.status) === "Open"), [items, flags]);
  const reviewingItems = useMemo(() => [...items, ...flags].filter((item) => tabForStatus(item.status) === "Reviewing"), [items, flags]);
  const resolvedItems = useMemo(() => [...items, ...flags].filter((item) => tabForStatus(item.status) === "Resolved"), [items, flags]);

  const visibleItems = activeTab === "Open" ? openItems : activeTab === "Reviewing" ? reviewingItems : resolvedItems;

  const tabs = [
    { label: "Open" as const, count: openItems.length },
    { label: "Reviewing" as const, count: reviewingItems.length },
    { label: "Resolved" as const, count: resolvedItems.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
              activeTab === tab.label ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)]"
            }`}
          >
            {tab.label}
            <Pill>{tab.count}</Pill>
          </button>
        ))}
      </div>

      {loading ? <Card className="text-sm text-[var(--muted)]">Loading moderation queue...</Card> : null}
      {error ? <Card className="border border-[var(--line)] text-sm font-bold text-[var(--danger)]">{error}</Card> : null}

      {!loading && !error && visibleItems.length ? (
        <div className="grid gap-3">
          {visibleItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black tracking-[-.03em]">{item.subject}</h3>
                    <Pill tone={item.status === "SUSPENDED" ? "coral" : "lime"}>{item.status}</Pill>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.detail}</p>
                </div>
                <Pill tone="forest">{item.type}</Pill>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && !visibleItems.length ? (
        <Card className="border border-dashed border-[var(--line)] text-center">
          <h3 className="text-lg font-black tracking-[-.04em]">No items in this queue.</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Suspended users and flagged edit requests will appear here when moderation work arrives.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
