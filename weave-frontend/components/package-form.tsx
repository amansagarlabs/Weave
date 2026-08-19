"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { CurrencyField } from "./form-controls";
import { Card } from "./ui";
import { useAppToast } from "./hooks/use-app-toast";

type CreatorPackage = {
  id: number;
  contentType: string;
  price: number | string;
  deliveryDays: number;
  revisionsIncluded: number;
};

export function PackageForm({
  mode,
  packageId,
  role = "creator",
}: {
  mode: "create" | "edit";
  packageId?: string;
  role?: "creator" | "editor";
}) {
  const router = useRouter();
  const id = packageId;
  const base = role === "editor" ? "/editor/gigs" : "/creator/packages";
  const [values, setValues] = useState({ contentType: "", price: "", deliveryDays: "", revisionsIncluded: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const { success, error: notifyError } = useAppToast();

  useEffect(() => {
    if (mode !== "edit" || !id) return;

    api<CreatorPackage[]>(base)
      .then((items) => {
        const item = items.find((candidate) => String(candidate.id) === id);
        if (item) {
          setValues({
            contentType: item.contentType,
            price: String(item.price),
            deliveryDays: String(item.deliveryDays),
            revisionsIncluded: String(item.revisionsIncluded),
          });
        }
      })
      .catch(() => setMessage("Could not load this package."));
  }, [base, id, mode]);

  function update(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const payload = {
        contentType: values.contentType,
        price: Number(values.price),
        deliveryDays: Number(values.deliveryDays),
        revisionsIncluded: Number(values.revisionsIncluded),
      };

      await api(mode === "edit" && id ? `${base}/${id}` : base, {
        method: mode === "edit" ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      success(mode === "edit" ? "Package updated" : "Package added", "Your package is now available in your workspace.");
      router.push(base);
    } catch (caught) {
      const error = caught instanceof Error ? `${caught.message}. Check your values and sign in again if needed.` : "Could not save package.";
      notifyError("Could not save package", error);
      setMessage(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-black tracking-[-.04em]">{mode === "edit" ? "Update package details" : "Package details"}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Keep the promise specific: what is included, how long it takes, and how many revisions are covered.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Content type" value={values.contentType} onChange={(value) => update("contentType", value)} placeholder="Instagram Reel" />
        <CurrencyField label="Price in INR" value={values.price} onChange={(value) => update("price", value)} placeholder="3500" hint="Enter the package price in rupees." />
        <Field label="Delivery days" type="number" value={values.deliveryDays} onChange={(value) => update("deliveryDays", value)} placeholder="5" />
        <Field label="Revisions included" type="number" value={values.revisionsIncluded} onChange={(value) => update("revisionsIncluded", value)} placeholder="2" />

        <div className="flex flex-wrap items-center gap-4 md:col-span-2">
          <button disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">
            {busy ? "Saving…" : mode === "edit" ? "Save changes ↗" : "Add package ↗"}
          </button>
          {message ? <p role="alert" className="text-sm font-bold text-[var(--danger)]">{message}</p> : null}
        </div>
      </form>
    </Card>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <label htmlFor={id} className="text-sm font-bold">
      {label}
      <input
        id={id}
        required
        min={type === "number" ? "1" : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-normal outline-none focus:border-[var(--forest)]"
      />
    </label>
  );
}
