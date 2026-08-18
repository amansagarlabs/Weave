"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { api } from "../lib/api";
import { Card, Pill } from "./ui";

type ContentSnapshot = {
  heroTitle: string;
  heroBody: string;
  complianceNote: string;
};

type AdminContentResponse = {
  published: ContentSnapshot;
  draft: ContentSnapshot;
  taxonomy: string[];
};

const fallbackSnapshot: ContentSnapshot = {
  heroTitle: "Good work finds its people.",
  heroBody: "Weave brings creators, brands, and editors into one place so the right brief, the right talent, and the next good collaboration can meet.",
  complianceNote: "Screenshots and screen recordings cannot be technically prevented. Weave uses watermarking and best-effort detection instead.",
};

export function AdminContentManager() {
  const [draft, setDraft] = useState<ContentSnapshot>(fallbackSnapshot);
  const [published, setPublished] = useState<ContentSnapshot>(fallbackSnapshot);
  const [taxonomy, setTaxonomy] = useState<string[]>([
    "All",
    "Tech",
    "Fashion",
    "Lifestyle",
    "Gaming",
    "Fitness",
    "Travel",
    "Beauty",
  ]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api<AdminContentResponse>("/admin/content")
      .then((response) => {
        if (!mounted) return;
        setDraft(response.draft);
        setPublished(response.published);
        setTaxonomy(response.taxonomy);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Unable to load admin content right now.");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoryCopy = useMemo(
    () =>
      taxonomy.map((label) => ({
        label,
        description:
          label === "All"
            ? "Default discovery view."
            : `${label} creators are surfaced when brands filter the marketplace.`,
      })),
    [],
  );

  async function publish() {
    setBusy(true);
    try {
      const response = await api<AdminContentResponse>("/admin/content", {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      setDraft(response.draft);
      setPublished(response.published);
      setTaxonomy(response.taxonomy);
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-black tracking-[-.04em]">Draft content</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Edit the public hero copy and compliance note here. Publishing updates the preview panel on the right.
          </p>
        </div>

        {loading ? <p className="text-sm text-[var(--muted)]">Loading admin content…</p> : null}
        {error ? <p className="rounded-2xl bg-[var(--paper)] px-4 py-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

        <label className="block space-y-2">
          <span className="text-sm font-bold">Public hero title</span>
          <input
            value={draft.heroTitle}
            onChange={(event) => setDraft((current) => ({ ...current, heroTitle: event.target.value }))}
            className="min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--forest)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">Public hero body</span>
          <textarea
            value={draft.heroBody}
            onChange={(event) => setDraft((current) => ({ ...current, heroBody: event.target.value }))}
            rows={4}
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--forest)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold">Compliance note</span>
          <textarea
            value={draft.complianceNote}
            onChange={(event) => setDraft((current) => ({ ...current, complianceNote: event.target.value }))}
            rows={3}
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--forest)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {taxonomy.map((label) => (
            <Pill key={label}>{label}</Pill>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setDraft(published)}
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--card)] px-5 py-3 text-sm font-bold transition-transform active:scale-[.97]"
          >
            Reset draft
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--orange)] transition-transform active:scale-[.97]"
          >
            Review and publish
          </button>
        </div>
      </Card>

      <Card className="space-y-4 border border-[var(--line)] bg-[var(--paper)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Preview</p>
          <h2 className="mt-2 text-lg font-black tracking-[-.04em]">Published public copy</h2>
        </div>

        <div className="rounded-[24px] bg-[var(--card)] p-5 shadow-[0_8px_24px_rgba(23,34,31,.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Weave marketplace</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-.06em]">{published.heroTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{published.heroBody}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryCopy.slice(1, 5).map((category) => (
              <Pill key={category.label} tone="lime">
                {category.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Compliance copy</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{published.complianceNote}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {categoryCopy.map((category) => (
            <div key={category.label} className="rounded-2xl bg-[var(--card)] p-4 shadow-[0_8px_24px_rgba(23,34,31,.06)]">
              <p className="text-sm font-black">{category.label}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <AdminConfirmDialog
        open={confirmOpen}
        title="Publish admin content?"
        description="This updates the public copy and category guidance shown across discovery and help surfaces."
        confirmLabel="Publish content"
        busy={busy}
        tone="default"
        onClose={() => setConfirmOpen(false)}
        onConfirm={publish}
      />
    </div>
  );
}
