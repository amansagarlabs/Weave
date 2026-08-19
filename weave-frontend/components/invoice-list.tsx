"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  gstAmount: number;
  tdsAmount: number;
  netPayable: number;
  dueAt: string | null;
  creatorGstin: string | null;
  brandGstin: string | null;
  sacCode: string | null;
  placeOfSupply: string | null;
  gstRate: number;
  tdsRate: number;
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

function isHostedPaymentLink(link: string | null) {
  if (!link) return false;
  try {
    const url = new URL(link);
    return ["http:", "https:"].includes(url.protocol) && !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [agreementInvoiceId, setAgreementInvoiceId] = useState<number | null>(null);
  const [draftDueAt, setDraftDueAt] = useState("");
  const invoiceEditorRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (selectedBooking || editingInvoice) invoiceEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedBooking, editingInvoice]);

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

  function startEditing(invoice: Invoice) {
    setEditingInvoice(invoice);
    setDraftDueAt(invoice.dueAt ? invoice.dueAt.slice(0, 10) : "");
    setTax({
      creatorGstin: invoice.creatorGstin ?? "",
      brandGstin: invoice.brandGstin ?? "",
      sacCode: invoice.sacCode ?? "",
      placeOfSupply: invoice.placeOfSupply ?? "",
      gstRegistered: Number(invoice.gstRate ?? 0) > 0,
      tdsApplicable: Number(invoice.tdsRate ?? 0) > 0,
    });
  }

  async function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!editingInvoice) return;
    setBusy(editingInvoice.id);
    setMessage("");
    try {
      const updated = await api<Invoice>(`/invoices/${editingInvoice.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...tax, dueAt: draftDueAt ? `${draftDueAt}T23:59:59Z` : null }),
      });
      setInvoices((items) => items.map((item) => item.id === updated.id ? updated : item));
      setEditingInvoice(null);
      setMessage("Draft invoice updated. Review the agreement before sending it.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update draft invoice.");
    } finally {
      setBusy(null);
    }
  }

  async function sendDraft(invoice: Invoice) {
    if (invoice.status === "DRAFT" && agreementInvoiceId !== invoice.id) return;
    setBusy(invoice.id);
    setMessage("");
    try {
      const updated = await api<Invoice>(`/invoices/${invoice.id}/send`, {
        method: "POST",
        body: JSON.stringify({ agreementAccepted: true }),
      });
      setInvoices((items) => items.map((item) => item.id === updated.id ? updated : item));
      setAgreementInvoiceId(null);
      setMessage("Invoice sent. The UniBee checkout link is now available to the brand.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not send invoice.");
    } finally {
      setBusy(null);
    }
  }

  function printInvoice(invoice: Invoice) {
    setSelectedInvoice(invoice);
    window.setTimeout(() => window.print(), 0);
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

      {selectedInvoice ? (
        <Card className="invoice-print-surface print:block">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Digital invoice</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Weave invoice #{selectedInvoice.id}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Booking #{selectedInvoice.bookingId} · Created {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <PaymentStateBadge status={selectedInvoice.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Total invoice</p>
              <p className="mt-2 text-3xl font-black">{money(selectedInvoice.amount)}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Net payable is shown below after tax calculations.</p>
            </div>
            <div className="rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Status</p>
              <p className="mt-2 text-3xl font-black">{selectedInvoice.status}</p>
              {selectedInvoice.dueAt ? <p className="mt-2 text-sm text-[var(--muted)]">Due {new Date(selectedInvoice.dueAt).toLocaleDateString("en-IN")}</p> : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Gross amount</p>
              <p className="mt-2 text-xl font-black">{money(selectedInvoice.amount)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">GST</p>
              <p className="mt-2 text-xl font-black">{money(selectedInvoice.gstAmount ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">TDS</p>
              <p className="mt-2 text-xl font-black">{money(selectedInvoice.tdsAmount ?? 0)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--ink)] p-5 text-[var(--on-dark)]">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]">Net payable</p>
            <p className="mt-2 text-4xl font-black">{money(selectedInvoice.netPayable ?? selectedInvoice.amount)}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              This is a digital invoice preview. The brand pays through UniBee checkout after the creator sends the invoice.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 print:hidden">
            {isHostedPaymentLink(selectedInvoice.paymentLink) ? (
                <a href={selectedInvoice.paymentLink!} target="_blank" rel="noreferrer" className="min-h-12 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--on-bright)]">
                Open payment link
              </a>
            ) : null}
            <button type="button" onClick={() => window.print()} className="min-h-12 rounded-full border-2 border-[var(--ink)] px-5 py-3 text-sm font-bold">
              Print invoice
            </button>
            <button type="button" onClick={() => setSelectedInvoice(null)} className="min-h-12 rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold">
              Close
            </button>
          </div>
        </Card>
      ) : null}

      {selectedBooking ? (
        <div ref={invoiceEditorRef}>
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
        </div>
      ) : null}

      {editingInvoice ? (
        <div ref={invoiceEditorRef}>
          <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Edit draft invoice</p>
              <h2 className="mt-2 text-2xl font-black">Invoice #{editingInvoice.id} · Booking #{editingInvoice.bookingId}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Agreement amount is locked to {money(editingInvoice.amount)} from the accepted booking.</p>
            </div>
            <button type="button" onClick={() => setEditingInvoice(null)} className="min-h-11 rounded-full border-2 border-[var(--ink)] px-4 text-sm font-bold">Cancel</button>
          </div>
          <form onSubmit={saveDraft} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">Due date<input type="date" value={draftDueAt} onChange={(event) => setDraftDueAt(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3" /></label>
            <label className="text-sm font-bold">Creator GSTIN<input value={tax.creatorGstin} onChange={(event) => setTax({ ...tax, creatorGstin: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3" /></label>
            <label className="text-sm font-bold">Brand GSTIN<input value={tax.brandGstin} onChange={(event) => setTax({ ...tax, brandGstin: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3" /></label>
            <label className="text-sm font-bold">SAC code<input value={tax.sacCode} onChange={(event) => setTax({ ...tax, sacCode: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3" /></label>
            <label className="text-sm font-bold">Place of supply<input value={tax.placeOfSupply} onChange={(event) => setTax({ ...tax, placeOfSupply: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3" /></label>
            <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[var(--paper)] px-3 text-sm font-bold"><input type="checkbox" checked={tax.gstRegistered} onChange={(event) => setTax({ ...tax, gstRegistered: event.target.checked })} /> Apply GST rule</label>
            <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[var(--paper)] px-3 text-sm font-bold"><input type="checkbox" checked={tax.tdsApplicable} onChange={(event) => setTax({ ...tax, tdsApplicable: event.target.checked })} /> Apply TDS rule</label>
            <div className="sm:col-span-2"><button type="submit" disabled={busy === editingInvoice.id} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy === editingInvoice.id ? "Saving..." : "Save draft changes"}</button></div>
          </form>
          </Card>
        </div>
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
                  {invoice.status === "DRAFT" ? <button type="button" onClick={() => startEditing(invoice)} className="text-sm font-bold text-[var(--forest)] underline">Edit draft</button> : null}
                  <button type="button" onClick={() => printInvoice(invoice)} className="text-sm font-bold text-[var(--forest)] underline">
                    Print invoice
                  </button>
                  {invoice.status === "DRAFT" ? (
                    <div className="w-full rounded-2xl bg-[var(--paper)] p-4 sm:w-auto sm:min-w-[280px]">
                      <label className="flex items-start gap-2 text-xs font-bold leading-5">
                        <input type="checkbox" checked={agreementInvoiceId === invoice.id} onChange={(event) => setAgreementInvoiceId(event.target.checked ? invoice.id : null)} />
                        I confirm the booking amount and scope are agreed before creating the UniBee checkout.
                      </label>
                      <button type="button" disabled={agreementInvoiceId !== invoice.id || busy === invoice.id} onClick={() => sendDraft(invoice)} className="mt-3 min-h-10 w-full rounded-full bg-[var(--forest)] px-4 text-sm font-bold text-white disabled:opacity-50">{busy === invoice.id ? "Sending..." : "Send invoice and create UniBee checkout"}</button>
                    </div>
                  ) : null}
                  {invoice.status === "SENT" ? (
                    <button type="button" disabled={busy === invoice.id} onClick={() => sendDraft(invoice)} className="text-sm font-bold text-[var(--forest)] underline disabled:opacity-50">
                      {busy === invoice.id ? "Refreshing..." : "Refresh UniBee checkout"}
                    </button>
                  ) : null}
                  {isHostedPaymentLink(invoice.paymentLink) ? (
                    <a href={invoice.paymentLink!} target="_blank" rel="noreferrer" className="text-sm font-bold text-[var(--forest)] underline">
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
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Invoices created from accepted bookings will appear here. Open an invoice to print the digital copy, then share the payment link with the brand. Weave uses payment links and never holds funds in escrow.</p>
        </Card>
      )}
    </div>
  );
}
