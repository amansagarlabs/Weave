import { ButtonLink, Card } from "./ui";
import { AppleLoader } from "./apple-loader";

export function LoadingState({ label = "Loading your workspace…" }: { label?: string }) {
  return <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-16 lg:px-10" aria-busy="true" aria-live="polite"><Card className="w-full max-w-md text-center"><AppleLoader label={label} /><p className="mt-5 text-sm font-bold text-[var(--muted)]">{label}</p></Card></main>;
}

export function NotFoundState() {
  return <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-6 py-16 lg:px-10"><Card className="w-full max-w-xl text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--muted)]">404 · Not found</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em]">This page went off the weave.</h1><p className="mx-auto mt-4 max-w-md leading-7 text-[var(--muted)]">The link may be outdated, or this workspace item is no longer available.</p><div className="mt-7"><ButtonLink href="/" variant="accent">Back to home ↗</ButtonLink></div></Card></main>;
}
