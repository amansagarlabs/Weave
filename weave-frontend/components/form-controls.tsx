"use client";

import { X } from "lucide-react";
import { useId } from "react";
import { Pill } from "./ui";

type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  hint?: string;
}) {
  const id = useId();

  return (
    <label htmlFor={id} className="text-sm font-bold">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="mt-1 block text-xs font-normal leading-5 text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function CurrencyField({
  label,
  value,
  onChange,
  placeholder = "0",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();

  return (
    <label htmlFor={id} className="text-sm font-bold">
      {label}
      <div className="mt-2 flex min-h-12 items-center rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 focus-within:border-[var(--forest)]">
        <span className="pr-2 text-sm font-bold text-[var(--muted)]">₹</span>
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent font-normal outline-none"
        />
      </div>
      {hint ? <span className="mt-1 block text-xs font-normal leading-5 text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function TagInput({
  label,
  value,
  onAdd,
  onRemove,
  suggestions,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  const available = suggestions?.filter((item) => !value.includes(item)) ?? [];

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold">{label}</legend>
      {hint ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{hint}</p> : null}
      <label htmlFor={id} className="sr-only">
        Add a tag
      </label>
      <div className="mt-4 flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5">
        {value.length ? (
          value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onRemove(tag)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--accent)] px-4 text-sm font-bold text-[var(--on-bright)] transition-transform active:scale-[.97]"
              aria-label={`Remove ${tag}`}
            >
              {tag}
              <X size={14} aria-hidden="true" />
            </button>
          ))
        ) : (
          <span className="px-1 text-sm text-[var(--muted)]">No tags yet.</span>
        )}
      </div>
      {available.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {available.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onAdd(tag)}
              className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--ink)] transition-transform active:scale-[.97]"
            >
              {placeholder ? `${placeholder} ${tag}` : `Add ${tag}`}
            </button>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
}

export function PaymentStateBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const tone = lower.includes("paid") ? "forest" : lower.includes("overdue") ? "coral" : lower.includes("sent") ? "lime" : "default";

  return <Pill tone={tone}>{status}</Pill>;
}
