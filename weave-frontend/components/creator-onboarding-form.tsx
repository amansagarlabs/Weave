"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

const categories = ["Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty"];

export function CreatorOnboardingForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      await api("/creator/profile", {
        method: "POST",
        body: JSON.stringify({
          displayName: form.get("displayName"),
          publicSlug: form.get("publicSlug"),
          city: form.get("city"),
          contentLanguage: form.get("contentLanguage"),
          availabilityStatus: "AVAILABLE",
          categoriesJson: JSON.stringify(selected),
          platformsJson: JSON.stringify([{ platform: form.get("platform"), handle: form.get("handle") }]),
        }),
      });
      router.push("/creator/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="space-y-6" noValidate><div className="grid gap-5 md:grid-cols-2"><label className="text-sm font-bold">Display name<input name="displayName" required className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" placeholder="Your name or creator name" /></label><label className="text-sm font-bold">Public profile slug<input name="publicSlug" required pattern="[a-zA-Z0-9-]+" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" placeholder="your-name" /></label><label className="text-sm font-bold">City<input name="city" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" placeholder="Mumbai" /></label><label className="text-sm font-bold">Content language<input name="contentLanguage" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" placeholder="English, Hindi" /></label><label className="text-sm font-bold">Primary platform<input name="platform" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" placeholder="Instagram" /></label><label className="text-sm font-bold">Handle<input name="handle" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4" placeholder="@yourhandle" /></label></div><fieldset><legend className="text-sm font-bold">Your categories</legend><div className="mt-3 flex flex-wrap gap-2">{categories.map(category => <button type="button" key={category} onClick={() => setSelected(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category])} className={`min-h-11 rounded-full border px-4 text-sm font-bold ${selected.includes(category) ? "border-[var(--ink)] bg-[var(--accent)]" : "border-[var(--line)] bg-white"}`}>{category}</button>)}</div></fieldset>{error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}<button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : "Save profile and continue ↗"}</button></form>;
}
