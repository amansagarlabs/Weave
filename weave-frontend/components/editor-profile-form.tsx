"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../lib/api";
import { RepeatableTextListField, parseRepeatableTextList, sanitizeRepeatableTextList } from "./repeatable-text-list";
import { Card } from "./ui";

type EditorProfile = { portfolioLinksJson: string | null; rating: number | null };

export function EditorProfileForm({ mode = "onboarding" }: { mode?: "onboarding" | "settings" }) {
  const [links, setLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(mode === "settings");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode !== "settings") return;
    api<EditorProfile>("/editor/profile/me")
      .then((profile) => {
        const parsed = parseRepeatableTextList(profile.portfolioLinksJson);
        setLinks(parsed.length ? parsed : [""]);
      })
      .catch((caught) => setMessage(caught instanceof Error ? `${caught.message}. Complete editor onboarding first.` : "Could not load editor profile."))
      .finally(() => setLoading(false));
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const portfolioLinksJson = JSON.stringify(sanitizeRepeatableTextList(links));
      await api("/editor/profile", { method: "POST", body: JSON.stringify({ portfolioLinksJson }) });
      setMessage("Editor profile saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not save editor profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="rounded-2xl bg-[var(--card)] p-6 text-sm font-bold text-[var(--muted)]">Loading your editor profile…</div>;

  const visibleLinks = links.filter((link) => link.trim());

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <form onSubmit={submit} className="rounded-2xl bg-[var(--card)] p-5 shadow-[0_8px_24px_rgba(23,34,31,.06)]">
        <h2 className="text-xl font-black tracking-[-.04em]">{mode === "settings" ? "Profile and portfolio" : "Your editing practice"}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Add one portfolio URL per row. Ratings are earned from completed work and are not manually entered.</p>
        <RepeatableTextListField
          label="Portfolio links"
          hint="Paste a link to each portfolio sample, case study, or live work example you want to show."
          items={links}
          onChange={setLinks}
          placeholder="https://example.com/your-work"
        />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : mode === "settings" ? "Save changes ↗" : "Save profile and continue ↗"}</button>
          {message ? <p role={message === "Editor profile saved." ? "status" : "alert"} className={`text-sm font-bold ${message === "Editor profile saved." ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>{message}</p> : null}
        </div>
      </form>
      <aside className="lg:sticky lg:top-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-[var(--forest)] px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Live preview</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">This is the portfolio context editors can share.</h2>
          </div>
          <div className="p-5">
            <div className="rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Public portfolio</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-.06em]">{mode === "settings" ? "Editing practice" : "Portfolio setup"}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Add links to your best work so brands can review your style, pace, and fit before they start a request.</p>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--muted)]">Links visible on save</p>
              <div className="mt-3 space-y-3">
                {visibleLinks.length ? visibleLinks.map((link, index) => (
                  <div key={`${link}-${index}`} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3">
                    <p className="text-sm font-bold">Sample {index + 1}</p>
                    <p className="mt-1 break-all text-sm text-[var(--muted)]">{link}</p>
                  </div>
                )) : <p className="text-sm text-[var(--muted)]">Add a portfolio link to see it appear here.</p>}
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4">
              <p className="text-sm font-bold">Rating note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ratings are earned from completed work and are not manually entered here.</p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}
