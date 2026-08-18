"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { PaymentStateBadge } from "./form-controls";
import { Card } from "./ui";

type Invoice = {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  paymentLink: string | null;
  createdAt: string;
  dueAt: string | null;
  gstAmount: number;
  tdsAmount: number;
  netPayable: number;
};

type Booking = {
  id: number;
  status: string;
  amount: number | string;
};

type TaxFields = {
  creatorGstin: string;
  brandGstin: string;
  sacCode: string;
  placeOfSupply: string;
  gstRegistered: boolean;
  tdsApplicable: boolean;
};

const money = (amount: number | string) => `₹${Number(amount).toLocaleString("en-IN")}`;
const initialTax: TaxFields = {
  creatorGstin: "",
  brandGstin: "",
  sacCode: "",
  placeOfSupply: "",
  gstRegistered: false,
  tdsApplicable: false,
};

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [tax, setTax] = useState<TaxFields>(initialTax);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const [loadedInvoices, loadedBookings] = await Promise.all([api<Invoice[]>("/invoices"), api<Booking[]>("/bookings")]);
    setInvoices(loadedInvoices);
    setBookings(loadedBookings);
  }

  useEffect(() => {
    load()
      .catch(() => setMessage("Sign in to view invoices and eligible bookings."))
      .finally(() => setLoading(false));
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!selectedBooking) return;

    setBusy(selectedBooking);
    setMessage("");

    try {
      await api("/invoices", { method: "POST", body: JSON.stringify({ bookingId: selectedBooking, ...tax }) });
      await load();
      setSelectedBooking(null);
      setTax(initialTax);
      setMessage("Draft invoice created with configurable tax breakdown.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not create invoice.");
    } finally {
      setBusy(null);
    }
  }

  const eligible = useMemo(
    () => bookings.filter((booking) => ["ACCEPTED", "CONTENT_DELIVERED"].includes(booking.status) && !invoices.some((invoice) => invoice.bookingId === booking.id)),
    [bookings, invoices],
  );

  if (loading) {
    return (
      <Card>
        <p className="text-sm font-bold text-[var(--muted)]">Loading invoices...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {message ? <p role="status" className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--on-bright)]">{message}</p> : null}

      {selectedBooking ? (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Invoice generator</p>
              <h2 className="mt-2 text-2xl font-black">Booking #{selectedBooking}</h2>
            </div>
            <button type="button" onClick={() => setSelectedBooking(null)} className="min-h-11 rounded-full border-2 border-[var(--ink)] px-4 text-sm font-bold">
              Cancel
            </button>
          </div>

          <form onSubmit={create} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Creator GSTIN
              <input
                value={tax.creatorGstin}
                onChange={(event) => setTax({ ...tax, creatorGstin: event.target.value })}
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3"
                placeholder="Optional"
              />
            </label>
            <label className="text-sm font-bold">
              Brand GSTIN
              <input
                value={tax.brandGstin}
                onChange={(event) => setTax({ ...tax, brandGstin: event.target.value })}
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3"
                placeholder="Optional"
              />
            </label>
            <label className="text-sm font-bold">
              SAC code
              <input
                value={tax.sacCode}
                onChange={(event) => setTax({ ...tax, sacCode: event.target.value })}
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3"
                placeholder="e.g. 998361"
              />
            </label>
            <label className="text-sm font-bold">
              Place of supply
              <input
                value={tax.placeOfSupply}
                onChange={(event) => setTax({ ...tax, placeOfSupply: event.target.value })}
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3"
                placeholder="State"
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[var(--paper)] px-3 text-sm font-bold">
              <input type="checkbox" checked={tax.gstRegistered} onChange={(event) => setTax({ ...tax, gstRegistered: event.target.checked })} />
              Apply configured GST rule
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[var(--paper)] px-3 text-sm font-bold">
              <input type="checkbox" checked={tax.tdsApplicable} onChange={(event) => setTax({ ...tax, tdsApplicable: event.target.checked })} />
              Apply configured TDS rule
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={busy === selectedBooking} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">
                {busy === selectedBooking ? "Creating..." : "Create draft invoice →"}
              </button>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Tax rates come from backend configuration and can be changed without editing frontend code.</p>
            </div>
          </form>
        </Card>
      ) : null}

      {eligible.length ? (
        <section>
          <h2 className="mb-4 text-xl font-black">Ready to invoice</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {eligible.map((booking) => (
              <Card key={booking.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Booking #{booking.id}</p>
                  <p className="mt-2 font-black">{money(booking.amount)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{booking.status.replaceAll("_", " ")}</p>
                </div>
                <button type="button" onClick={() => setSelectedBooking(booking.id)} className="min-h-11 rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-bold text-white">
                  Prepare invoice
                </button>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {invoices.length ? (
        <section>
          <h2 className="mb-4 text-xl font-black">Your invoices</h2>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    Invoice #{invoice.id} · Booking #{invoice.bookingId}
                  </p>
                  <p className="mt-2 text-xl font-black">Net {money(invoice.netPayable ?? invoice.amount)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Gross {money(invoice.amount)} · GST {money(invoice.gstAmount ?? 0)} · TDS {money(invoice.tdsAmount ?? 0)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PaymentStateBadge status={invoice.status} />
                  {invoice.paymentLink ? (
                    <a href={invoice.paymentLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-[var(--forest)] underline">
                      Open payment link
                    </a>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <Card>
          <h2 className="text-xl font-black">No invoices yet.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Invoices created from accepted bookings will appear here. Weave uses payment links and never holds funds in escrow.</p>
        </Card>
      )}
    </div>
  );
}
