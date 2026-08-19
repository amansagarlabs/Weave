"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PaymentStateBadge } from "./form-controls";
import { ButtonLink, Card } from "./ui";

type Invoice = {
  id: number;
  bookingId: number;
  amount: number | string;
  status: string;
  paymentLink: string | null;
  dueAt: string | null;
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

export function BookingInvoiceStatus({ bookingId, role, bookingStatus }: { bookingId: number; role: "brand" | "creator"; bookingStatus?: string }) {
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
          {bookingStatus && ["PENDING", "NEGOTIATING"].includes(bookingStatus)
            ? "The amount is still being agreed. Once both sides agree and the creator accepts, the creator can create a draft invoice."
            : role === "creator"
              ? "Create a draft invoice after the booking is accepted or content is delivered."
              : "The creator has not created an invoice for this booking yet. The pay button appears here after the invoice is sent."}
        </p>
        {role === "creator" && bookingStatus && ["ACCEPTED", "CONTENT_DELIVERED"].includes(bookingStatus) ? (
          <div className="mt-5">
            <ButtonLink href="/creator/earnings" variant="outline">
              Open earnings
            </ButtonLink>
          </div>
        ) : null}
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

      {role === "brand" && ["SENT", "OVERDUE"].includes(invoice.status) && isHostedPaymentLink(invoice.paymentLink) ? (
        <a
          href={invoice.paymentLink!}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--on-bright)] shadow-[3px_3px_0_var(--ink)]"
        >
          Pay securely with UniBee
        </a>
      ) : null}

      {role === "brand" && invoice.status === "DRAFT" ? (
        <p className="mt-5 rounded-2xl bg-[var(--paper)] p-4 text-sm font-bold leading-6 text-[var(--muted)]">The invoice is still a draft. The payment button appears after the creator confirms the booking agreement and sends the invoice.</p>
      ) : null}

      {role === "brand" && ["SENT", "OVERDUE"].includes(invoice.status) && !isHostedPaymentLink(invoice.paymentLink) ? (
        <p className="mt-5 rounded-2xl bg-[var(--paper)] p-4 text-sm font-bold leading-6 text-[var(--muted)]">The checkout link is not ready yet. Ask the creator to configure UniBee and refresh the invoice.</p>
      ) : null}

      {isHostedPaymentLink(invoice.paymentLink) ? <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Payment opens in UniBee hosted checkout. Weave does not hold funds in escrow.</p> : null}
    </Card>
  );
}
