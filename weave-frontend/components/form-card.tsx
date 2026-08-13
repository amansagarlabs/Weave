"use client";

import { FormEvent, useState } from "react";
import { Card } from "./ui";

type Field = string | { label: string; type?: "text" | "email" | "number" | "textarea"; hint?: string };

function normalizeField(field: Field) {
  return typeof field === "string" ? { label: field, type: "text" as const } : field;
}

export function FormCard({ title, fields, description = "Changes are saved to this workspace when you continue." }: { title: string; fields: Field[]; description?: string }) {
  const [saved, setSaved] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(true); }
  return <Card>
    <h2 className="text-xl font-black tracking-[-.04em]">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      {fields.map((field) => { const item = normalizeField(field); const id = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"); return <label key={item.label} htmlFor={id} className={`text-sm font-bold ${item.type === "textarea" ? "md:col-span-2" : ""}`}>
        {item.label}
        {item.type === "textarea" ? <textarea id={id} className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 font-normal outline-none transition-colors focus:border-[var(--forest)]" placeholder={`Enter ${item.label.toLowerCase()}`} /> : <input id={id} type={item.type} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none transition-colors focus:border-[var(--forest)]" placeholder={`Enter ${item.label.toLowerCase()}`} />}
        {item.hint ? <span className="mt-1 block text-xs font-normal leading-5 text-[var(--muted)]">{item.hint}</span> : null}
      </label>; })}
      <div className="flex flex-wrap items-center gap-4 md:col-span-2"><button className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white transition-transform active:scale-[.97]" type="submit">Save and continue ↗</button><p className="text-sm text-[var(--muted)]" aria-live="polite">{saved ? "Saved for this session." : "No changes saved yet."}</p></div>
    </form>
  </Card>;
}
