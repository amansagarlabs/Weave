"use client";

import { useMemo, useState } from "react";
import { ButtonLink, Card, Logo } from "../../components/ui";
import { Footer } from "../../components/footer";

const topics = [
  ["Account", "Login, signup, roles, and profile access", "Choose a role at signup, then complete the profile steps for that workspace."],
  ["Profiles", "Packages, portfolio, categories, and public pages", "Keep your public profile clear: show what you make, your availability, and the work you want next."],
  ["Bookings", "Briefs, statuses, revisions, and next actions", "Use the booking detail page to agree on amount, accept the invite, create the invoice, and track payment status in one place."],
  ["Payments", "Payment links, invoices, and payment status", "Weave uses payment links and status updates. Weave does not hold funds in escrow."],
  ["Safety", "Watermarking, privacy, and clear expectations", "Watermarked previews are best-effort. No web platform can technically prevent screenshots or screen recordings."],
];

const bookingSteps = [
  ["1. Brand sends the invite", "A brand starts a booking from discovery or a package page with an initial amount."],
  ["2. Amount gets agreed", "While the booking is Pending or Negotiating, either side can propose a new amount before acceptance."],
  ["3. Creator accepts", "The creator accepts the invite once the amount and brief are aligned."],
  ["4. Invoice appears", "After acceptance or delivery, the creator opens Earnings and creates a draft invoice."],
  ["5. Brand pays", "The payment button appears on the booking only after the invoice is sent."],
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const filtered = useMemo(
    () => topics.filter(([title, copy]) => `${title} ${copy}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <>
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <Logo />
          <section className="py-20 text-center">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--forest)]">We&apos;re here to help</p>
            <h1 className="mt-5 text-5xl font-black tracking-[-.07em] sm:text-7xl">What can we untangle?</h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--muted)]">
              Find a clear answer about profiles, bookings, payments, and the expectations that keep collaborations healthy.
            </p>
            <label className="mx-auto mt-8 block w-full max-w-xl text-left">
              <span className="sr-only">Search help</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search help"
                className="min-h-14 w-full rounded-full border border-[var(--line)] bg-[var(--card)] px-6 text-[var(--ink)] outline-none focus:border-[var(--forest)]"
                placeholder="Search account, booking, payment..."
              />
            </label>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Booking flow</p>
              <h2 className="mt-3 text-2xl font-black">How a booking works in simple steps</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                This is the order we use so everyone sees the same state: agree on the amount first, accept the booking second, then create the invoice and show the payment button to the brand.
              </p>
              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                {bookingSteps.map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
                    <p className="font-black">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                  </div>
                ))}
              </div>
            </Card>

            {filtered.map(([title, copy, answer]) => (
              <Card key={title}>
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between text-left"
                  aria-expanded={open === title}
                  onClick={() => setOpen(open === title ? null : title)}
                >
                  <span>
                    <span className="block text-xl font-black">{title}</span>
                    <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{copy}</span>
                  </span>
                  <span className="ml-4 text-2xl" aria-hidden="true">{open === title ? "−" : "+"}</span>
                </button>
                {open === title ? <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm leading-6 text-[var(--muted)]" aria-live="polite">{answer}</p> : null}
              </Card>
            ))}
            {filtered.length === 0 ? (
              <Card className="text-center md:col-span-2">
                <h2 className="text-xl font-black">No help topic matches that search.</h2>
                <button type="button" onClick={() => setQuery("")} className="mt-4 font-bold text-[var(--forest)] underline">Clear search</button>
              </Card>
            ) : null}
            <Card className="bg-[var(--accent)] text-[var(--on-bright)] md:col-span-2">
              <h2 className="text-xl font-black">Still stuck?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6">Tell us what happened and we&apos;ll help you find the next step.</p>
              <div className="mt-5"><ButtonLink href="/login" variant="outline">Contact support</ButtonLink></div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
