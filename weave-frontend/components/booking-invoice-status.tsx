"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PaymentStateBadge } from "./form-controls";
import { Card } from "./ui";

type Invoice = {
  id: number;
  bookingId: number;
  amount: number | string;
  status: string;
  paymentLink: string | null;
  dueAt: string | null;
};

export function BookingInvoiceStatus({ bookingId, role }: { bookingId: number; role: "brand" | "creator" }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api<Invoice[]>("/invoices")
      .then((items) => setInvoice(items.find((item) => item.bookingId === bookingId) ?? null))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [bookingId]);

  if (!loaded) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">Checking payment status...</p>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Payment</p>
        <h2 className="mt-3 text-xl font-black">No invoice yet</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {role === "creator"
            ? "Create a draft invoice after the booking is accepted or content is delivered."
            : "The creator has not created an invoice for this booking yet."}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Invoice #{invoice.id}</p>
          <p className="mt-2 text-2xl font-black">₹{Number(invoice.amount).toLocaleString("en-IN")}</p>
          {invoice.dueAt ? <p className="mt-1 text-sm text-[var(--muted)]">Due {new Date(invoice.dueAt).toLocaleDateString("en-IN")}</p> : null}
        </div>
        <PaymentStateBadge status={invoice.status} />
      </div>

      {role === "brand" && invoice.paymentLink ? (
        <a
          href={invoice.paymentLink}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold shadow-[3px_3px_0_var(--ink)]"
        >
          Pay via payment link
        </a>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Weave uses payment links and does not hold funds in escrow.</p>
    </Card>
  );
}
