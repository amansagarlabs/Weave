"use client";

import { Search } from "lucide-react";

export function SearchForm({
  value,
  onChange,
  placeholder = "Search workspace",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] focus-within:border-[var(--forest)] focus-within:ring-1 focus-within:ring-[var(--forest)]">
      <Search size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
      />
    </label>
  );
}
