"use client";

import { useEffect } from "react";
import { ButtonLink, Card } from "../components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-6 py-16 lg:px-10"><Card className="w-full max-w-xl text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--danger)]">Something interrupted the weave</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em]">That did not load.</h1><p className="mx-auto mt-4 max-w-md leading-7 text-[var(--muted)]">Try the page again. If the problem continues, return home and check the service connection.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => reset()} className="min-h-11 rounded-full bg-[var(--ink)] px-5 font-bold text-white">Try again</button><ButtonLink href="/" variant="outline">Back to home</ButtonLink></div></Card></main>;
}
