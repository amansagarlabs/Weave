"use client";

import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";

export type PlatformEntry = { platform: string; handle: string };

export function parsePlatformEntries(value: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      platform: String(entry?.platform ?? ""),
      handle: String(entry?.handle ?? ""),
    }));
  } catch {
    return [];
  }
}

export function sanitizePlatformEntries(entries: PlatformEntry[]) {
  return entries
    .map((entry) => ({ platform: entry.platform.trim(), handle: entry.handle.trim() }))
    .filter((entry) => entry.platform.length > 0 || entry.handle.length > 0);
}

export function PlatformEntriesField({
  label = "Platforms and handles",
  hint = "Add every platform you actively use. You can keep the list manual and update it later.",
  entries,
  onChange,
}: {
  label?: string;
  hint?: string;
  entries: PlatformEntry[];
  onChange: (entries: PlatformEntry[]) => void;
}) {
  const id = useId();
  const rows = entries.length ? entries : [{ platform: "", handle: "" }];

  function update(index: number, key: keyof PlatformEntry, value: string) {
    const next = rows.map((entry, current) => (current === index ? { ...entry, [key]: value } : entry));
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { platform: "", handle: "" }]);
  }

  function removeRow(index: number) {
    const next = rows.filter((_, current) => current !== index);
    onChange(next.length ? next : [{ platform: "", handle: "" }]);
  }

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold">{label}</legend>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{hint}</p>
      <div className="mt-4 space-y-4">
        {rows.map((entry, index) => {
          const platformId = `${id}-platform-${index}`;
          const handleId = `${id}-handle-${index}`;
          return (
            <div key={`${platformId}-${index}`} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label htmlFor={platformId} className="text-sm font-bold">
                  Platform
                  <input
                    id={platformId}
                    value={entry.platform}
                    onChange={(event) => update(index, "platform", event.target.value)}
                    className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 font-normal outline-none focus:border-[var(--forest)]"
                    placeholder="Instagram"
                  />
                </label>
                <label htmlFor={handleId} className="text-sm font-bold">
                  Handle
                  <input
                    id={handleId}
                    value={entry.handle}
                    onChange={(event) => update(index, "handle", event.target.value)}
                    className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 font-normal outline-none focus:border-[var(--forest)]"
                    placeholder="@yourhandle"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-bold text-[var(--muted)] transition-transform active:scale-[.97]"
                    aria-label={`Remove platform row ${index + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-[var(--ink)] transition-transform active:scale-[.97]"
      >
        <Plus size={16} aria-hidden="true" />
        Add another platform
      </button>
    </fieldset>
  );
}
