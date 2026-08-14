import Link from "next/link";
import { Logo, Pill } from "../../../components/ui";
import { authCopy } from "../../../lib/copy";

export default function RoleSelectionPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <Logo />
        <div className="mx-auto max-w-2xl py-20 text-center">
          <Pill tone="lime">{authCopy.roleSelection.eyebrow}</Pill>
          <h1 className="mt-7 text-5xl font-black tracking-[-.07em] sm:text-7xl">{authCopy.roleSelection.title}</h1>
          <p className="mx-auto mt-5 max-w-lg leading-7 text-[var(--muted)]">{authCopy.roleSelection.body}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {authCopy.roleSelection.roles.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              className={`group rounded-3xl border-2 border-[var(--ink)] p-6 shadow-[5px_5px_0_var(--ink)] transition-transform hover:-translate-y-1 ${role.tone}`}
            >
              <span className="text-4xl">✦</span>
              <h2 className="mt-16 text-3xl font-black tracking-[-.06em]">{role.title}</h2>
              <p className="mt-3 min-h-14 text-sm leading-6">{role.copy}</p>
              <span className="mt-8 block text-right text-2xl transition-transform group-hover:translate-x-1" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
