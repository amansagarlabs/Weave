import Link from "next/link";

type FooterProps = {
  compact?: boolean;
};

export function Footer({ compact = false }: FooterProps) {
  return <footer className={`mx-auto w-full max-w-7xl px-6 text-sm lg:px-10 ${compact ? "py-8" : "py-12"}`}>
    <div className="flex flex-wrap items-center justify-between gap-6">
      <Link href="/" aria-label="Weave home" className="text-xl font-black tracking-[-.08em]">weave<span className="text-[var(--orange)]">.</span></Link>
      <p className="text-[var(--muted)]">Good work finds its people.</p>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
        <Link href="/help" className="rounded-full px-1 py-2 hover:text-[var(--forest)]">Help</Link>
        <Link href="/login" className="rounded-full px-1 py-2 hover:text-[var(--forest)]">Log in</Link>
        <Link href="/signup" className="rounded-full px-1 py-2 hover:text-[var(--forest)]">Join</Link>
      </nav>
    </div>
    {!compact ? <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted)]"><span>© {new Date().getFullYear()} Weave</span><span>Creators · Brands · Editors</span></div> : null}
  </footer>;
}
