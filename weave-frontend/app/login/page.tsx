import Link from "next/link";
import { AuthForm } from "../../components/auth-form";
import { PublicNav } from "../../components/public-nav";
import { PublicSessionGate } from "../../components/public-session-gate";
import { authCopy } from "../../lib/copy";
import { Footer } from "../../components/footer";

export default function LoginPage() {
  return (
    <PublicSessionGate>
      <main className="min-h-screen bg-[var(--paper)] px-6 py-8">
        <PublicNav />
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center rounded-[32px] bg-white p-8 shadow-[0_18px_60px_rgba(23,34,31,.08)]">
          <Link href="/" className="text-xl font-black tracking-[-.08em]">
            weave<span className="text-[var(--orange)]">.</span>
          </Link>
          <h1 className="mt-12 text-4xl font-black tracking-[-.06em]">{authCopy.login.title}</h1>
          <p className="mt-3 text-[var(--muted)]">{authCopy.login.body}</p>
          <AuthForm mode="login" />
        </section>
      </main><Footer compact />
    </PublicSessionGate>
  );
}
