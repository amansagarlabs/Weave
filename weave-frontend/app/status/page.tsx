"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Clock3, RefreshCw, Server } from "lucide-react";
import { PublicNav } from "../../components/public-nav";
import { Footer } from "../../components/footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const refreshInterval = 30_000;

type Service = { status: "operational" | "degraded"; label: string };
type HealthResponse = { status: "operational" | "degraded"; checkedAt: string; services: Record<string, Service> };

const fallbackServices: Record<string, Service> = {
  app: { status: "degraded", label: "Weave application" },
  database: { status: "degraded", label: "Database" },
  storage: { status: "degraded", label: "Asset storage" },
  email: { status: "degraded", label: "Email delivery" },
};

export default function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checking, setChecking] = useState(true);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch(`${API_URL}/public/health`, { cache: "no-store" });
      if (!response.ok) throw new Error("Health check failed");
      setHealth(await response.json());
    } catch {
      setHealth({ status: "degraded", checkedAt: new Date().toISOString(), services: fallbackServices });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const timer = window.setInterval(checkHealth, refreshInterval);
    return () => window.clearInterval(timer);
  }, [checkHealth]);

  const services = health ? Object.entries(health.services) : Object.entries(fallbackServices);
  const isHealthy = health?.status === "operational";
  const checkedAt = health ? new Date(health.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Waiting";

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <PublicNav />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 lg:px-10 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--forest)]">System status</p>
            <h1 className="mt-5 max-w-3xl text-6xl font-black leading-[.9] tracking-[-.08em] sm:text-8xl">The work stays moving.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">Live service checks for the parts of Weave that keep profiles, bookings, assets, and messages available.</p>
          </div>
          <div className={`rounded-[28px] p-7 text-white shadow-[7px_7px_0_var(--orange)] ${isHealthy ? "bg-[var(--forest)]" : "bg-[var(--orange)]"}`}>
            <div className="flex items-center justify-between gap-4"><span className="text-xs font-black uppercase tracking-[.16em]">Current status</span>{isHealthy ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}</div>
            <p className="mt-8 text-4xl font-black tracking-[-.06em]">{isHealthy ? "All systems operational" : "Some systems need attention"}</p>
            <p className="mt-3 text-sm text-white/75">Checks refresh automatically every 30 seconds.</p>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--card)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 sm:px-8">
            <div><p className="font-black">Service health</p><p className="mt-1 text-sm text-[var(--muted)]">Last checked {checkedAt}</p></div>
            <button type="button" onClick={checkHealth} disabled={checking} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)] transition-colors hover:bg-[var(--paper)] disabled:opacity-60"><RefreshCw size={15} className={checking ? "animate-spin" : ""} aria-hidden="true" /> Refresh</button>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {services.map(([key, service]) => <div key={key} className="flex items-center justify-between gap-5 px-6 py-6 sm:px-8"><div className="flex items-center gap-4"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${service.status === "operational" ? "bg-[var(--accent)]/20 text-[var(--forest)]" : "bg-[var(--orange)]/15 text-[var(--orange)]"}`}>{service.status === "operational" ? <Server size={18} aria-hidden="true" /> : <CircleAlert size={18} aria-hidden="true" />}</span><div><p className="font-black">{service.label}</p><p className="mt-1 text-sm text-[var(--muted)]">{key === "app" ? "Requests and public pages" : key === "database" ? "Accounts and workspace data" : key === "storage" ? "Uploads and portfolio assets" : "Verification and notifications"}</p></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[.12em] ${service.status === "operational" ? "bg-[var(--accent)] text-[var(--on-bright)]" : "bg-[var(--orange)] text-white"}`}>{service.status === "operational" ? "Operational" : "Degraded"}</span></div>)}
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-[var(--muted)]"><Clock3 size={15} aria-hidden="true" /> Automated checks are informational and do not expose internal infrastructure details.</p>
      </section>
      <Footer />
    </main>
  );
}
