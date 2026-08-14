"use client";

import { useMemo, useState } from "react";
import { TagInput } from "./form-controls";

export const weaveCategories = ["Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty"] as const;

export function CategoryPickerField({
  label = "Your categories",
  hint = "Type to filter the fixed Weave taxonomy, then add the categories that best fit your work.",
  selected,
  onChange,
}: {
  label?: string;
  hint?: string;
  selected: string[];
  onChange: (categories: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const lowerQuery = query.trim().toLowerCase();

  const suggestions = useMemo(
    () => weaveCategories.filter((category) => !selected.includes(category) && (!lowerQuery || category.toLowerCase().includes(lowerQuery))),
    [lowerQuery, selected],
  );

  function addCategory(category: string) {
    if (selected.includes(category)) return;
    onChange([...selected, category]);
    setQuery("");
  }

  function removeCategory(category: string) {
    onChange(selected.filter((item) => item !== category));
  }

  return (
    <div className="mt-6">
      <TagInput
        label={label}
        hint={hint}
        value={selected}
        onAdd={addCategory}
        onRemove={removeCategory}
        suggestions={suggestions}
        placeholder="Add"
      />

      <label className="mt-4 block text-sm font-bold">
        Search categories
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const firstMatch = suggestions[0];
            if (firstMatch) addCategory(firstMatch);
          }}
          className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-sm outline-none focus:border-[var(--forest)]"
          placeholder="Search Tech, Fashion, Lifestyle..."
        />
      </label>
    </div>
  );
}
