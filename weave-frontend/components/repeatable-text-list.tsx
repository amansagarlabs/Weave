"use client";

import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";

export function parseRepeatableTextList(value: string | null) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item ?? ""));
  } catch {
    return [];
  }
}

export function sanitizeRepeatableTextList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

export function RepeatableTextListField({
  label,
  hint,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const id = useId();
  const rows = items.length ? items : [""];

  function update(index: number, value: string) {
    onChange(rows.map((item, current) => (current === index ? value : item)));
  }

  function addRow() {
    onChange([...rows, ""]);
  }

  function removeRow(index: number) {
    const next = rows.filter((_, current) => current !== index);
    onChange(next.length ? next : [""]);
  }

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold">{label}</legend>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{hint}</p>
      <div className="mt-4 space-y-3">
        {rows.map((item, index) => {
          const inputId = `${id}-item-${index}`;
          return (
            <div key={inputId} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 md:flex-row md:items-center">
              <label htmlFor={inputId} className="flex-1 text-sm font-bold">
                Link {index + 1}
                <input
                  id={inputId}
                  type="url"
                  inputMode="url"
                  value={item}
                  onChange={(event) => update(index, event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 font-normal text-[var(--ink)] outline-none focus:border-[var(--forest)]"
                  placeholder={placeholder}
                />
              </label>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--muted)] transition-transform active:scale-[.97]"
                aria-label={`Remove link ${index + 1}`}
              >
                <Trash2 size={16} aria-hidden="true" />
                Remove
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-[var(--on-bright)] transition-transform active:scale-[.97]"
      >
        <Plus size={16} aria-hidden="true" />
        Add another link
      </button>
    </fieldset>
  );
}
