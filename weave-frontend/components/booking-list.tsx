"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, StatusBadge } from "./ui";
import { StandardEmpty, Tabs } from "./surface";

type Booking = { id: number; brandId: number; creatorId: number; packageId: number | null; status: string; amount: number | string; createdAt: string };

export function BookingList({ role }: { role: "creator" | "brand" }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Booking[]>("/bookings").then(setBookings).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load bookings.")).finally(() => setLoading(false));
  }, []);

  return <div><Tabs labels={["All", "Pending", "Accepted", "Delivered", "Paid"]} /><div className="mt-6 space-y-3">{loading ? <Card><p className="text-sm font-bold text-[var(--muted)]">Loading bookings…</p></Card> : error ? <Card><p role="alert" className="text-sm font-bold text-[var(--danger)]">{error}. Sign in again if your session has expired.</p></Card> : bookings.length ? bookings.map((booking) => <Card key={booking.id} className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Booking #{booking.id}</p><h3 className="mt-2 font-black">{role === "brand" ? `Creator ${booking.creatorId}` : `Brand ${booking.brandId}`}</h3><p className="mt-1 text-sm text-[var(--muted)]">Created {new Date(booking.createdAt).toLocaleDateString("en-IN")}</p></div><div className="flex items-center gap-4"><p className="font-black tabular-nums">₹{Number(booking.amount ?? 0).toLocaleString("en-IN")}</p><StatusBadge status={booking.status} /></div></Card>) : <StandardEmpty title={role === "brand" ? "No campaign bookings yet." : "No bookings yet."} copy="Once a collaboration begins, its status, amount, and next action will appear here." href={role === "brand" ? "/brand/discover" : "/brand/discover"} action={role === "brand" ? "Find a creator" : "Explore brands"} />}</div></div>;
}
