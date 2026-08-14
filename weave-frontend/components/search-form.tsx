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
    <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm shadow-[2px_2px_0_var(--ink)]">
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
