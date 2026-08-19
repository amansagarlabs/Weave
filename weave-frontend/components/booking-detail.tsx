"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { BookingInvoiceStatus } from "./booking-invoice-status";
import { ButtonLink, Card, StatusBadge } from "./ui";

type Booking = {
  id: number;
  brandId: number;
  creatorId: number;
  packageId: number | null;
  status: string;
  amount: number | string;
  statusHistoryJson: string | null;
  createdAt: string;
};

function label(status: string) {
  return status.replaceAll("_", " ");
}

function history(value: string | null, current: string) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed.map((item) => label(String(item.status ?? current)));
  } catch {
    // Fall back to the current status.
  }

  return [label(current)];
}

export function BookingDetail({ id, role }: { id: string; role: "brand" | "creator" }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [amountDraft, setAmountDraft] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Booking>(`/bookings/${encodeURIComponent(id)}`)
      .then(setBooking)
      .catch((caught) => setMessage(caught instanceof Error ? `${caught.message}. Sign in with the participant account to view this booking.` : "Could not load booking."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (booking) setAmountDraft(String(booking.amount ?? ""));
  }, [booking]);

  const next = useMemo(() => {
    if (!booking) return null;
    if (role === "brand" && booking.status === "PENDING") return { status: "NEGOTIATING", label: "Start negotiating" };
    if (role === "brand" && booking.status === "NEGOTIATING") return { status: "ACCEPTED", label: "Accept booking" };
    if (role === "creator" && ["PENDING", "NEGOTIATING"].includes(booking.status)) return { status: "ACCEPTED", label: "Accept invite" };
    if (role === "creator" && booking.status === "ACCEPTED") return { status: "CONTENT_DELIVERED", label: "Mark content delivered" };
    return null;
  }, [booking, role]);

  const canReviseAmount = !!booking && ["PENDING", "NEGOTIATING"].includes(booking.status);
  const canCreateInvoice = !!booking && ["ACCEPTED", "CONTENT_DELIVERED"].includes(booking.status);

  async function updateAmount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking || !canReviseAmount) return;
    setBusy(true);
    setMessage("");

    try {
      const updated = await api<Booking>(`/bookings/${booking.id}/amount`, {
        method: "PATCH",
        body: JSON.stringify({ amount: Number(amountDraft) }),
      });
      setBooking(updated);
      setMessage("Booking amount updated.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update booking amount.");
    } finally {
      setBusy(false);
    }
  }

  async function move() {
    if (!booking || !next) return;
    setBusy(true);
    setMessage("");

    try {
      const updated = await api<Booking>(`/bookings/${booking.id}/status`, { method: "PATCH", body: JSON.stringify({ status: next.status }) });
      setBooking(updated);
      setMessage("Booking status updated.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update booking status.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <p className="text-sm font-bold text-[var(--muted)]">Loading booking...</p>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <p role="alert" className="text-sm font-bold text-[var(--danger)]">
          {message || "Booking not found."}
        </p>
      </Card>
    );
  }

  const steps = history(booking.statusHistoryJson, booking.status);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Booking #{booking.id}</p>
                <h2 className="mt-2 text-3xl font-black">{role === "brand" ? `Creator ${booking.creatorId}` : `Brand ${booking.brandId}`}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Created {new Date(booking.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <StatusBadge status={label(booking.status)} />
            </div>

            <div className="mt-8">
              <ol className="space-y-5">
                {steps.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-4">
                    <div
                      className={`mt-1 h-4 w-4 shrink-0 rounded-full border-4 ${index === steps.length - 1 ? "border-[var(--forest)] bg-[var(--accent)]" : "border-[var(--line)] bg-white"}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-bold">{step}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">Recorded in the booking history.</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Agreement</p>
            <h2 className="mt-3 text-xl font-black">Set the amount before acceptance</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              During Pending or Negotiating, either side can propose a new amount. Once both sides agree, the creator accepts the invite and the invoice stage opens.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--paper)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Current amount</p>
                <p className="mt-1 text-2xl font-black">₹{Number(booking.amount).toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl bg-[var(--paper)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Can revise</p>
                <p className="mt-1 font-black">{canReviseAmount ? "Yes" : "Locked"}</p>
              </div>
              <div className="rounded-2xl bg-[var(--paper)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Payment button</p>
                <p className="mt-1 font-black">{canCreateInvoice ? "After invoice is sent" : "Not yet"}</p>
              </div>
            </div>

            {canReviseAmount ? (
              <form onSubmit={updateAmount} className="mt-5 flex flex-wrap items-end gap-3">
                <label className="min-w-[220px] flex-1 text-sm font-bold">
                  Propose amount
                  <input
                    value={amountDraft}
                    onChange={(event) => setAmountDraft(event.target.value)}
                    inputMode="decimal"
                    type="number"
                    min="1"
                    step="0.01"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-[var(--ink)]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-12 rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy ? "Saving..." : "Update amount"}
                </button>
              </form>
            ) : null}
          </Card>

          <Card>
            <h2 className="text-xl font-black">Work context</h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Package and brief details will appear here as the collaboration is agreed. Payment status uses payment links; Weave does not hold funds in escrow. The payment button appears only after the creator sends an invoice.
            </p>
            {role === "creator" && canCreateInvoice ? (
              <div className="mt-5">
                <ButtonLink href="/creator/earnings" variant="accent">
                  Create invoice from earnings
                </ButtonLink>
              </div>
            ) : null}
          </Card>
        </div>

        <Card className="h-fit">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Next action</p>
          <h2 className="mt-3 text-2xl font-black">{next?.label ?? "Keep the work moving"}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {next ? "This updates the shared status for both participants." : "The next status will appear when the other participant takes action."}
          </p>
          {message ? (
            <p role="status" className="mt-4 text-sm font-bold text-[var(--forest)]">
              {message}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {next ? (
              <button
                type="button"
                onClick={move}
                disabled={busy}
                className="min-h-12 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)] disabled:opacity-60"
              >
                {busy ? "Updating..." : `${next.label} ->`}
              </button>
            ) : null}
            <ButtonLink href={`/${role}/messages/booking-${booking.id}`} variant="outline">
              Open messages
            </ButtonLink>
          </div>
        </Card>
      </div>

      <BookingInvoiceStatus bookingId={booking.id} role={role} bookingStatus={booking.status} />
    </div>
  );
}
