import { AuthForm } from "../../components/auth-form";
import { PublicNav } from "../../components/public-nav";
import { PublicSessionGate } from "../../components/public-session-gate";
import { authCopy } from "../../lib/copy";
import { Footer } from "../../components/footer";

export default function LoginPage() {
  return (
    <PublicSessionGate>
      <main className="min-h-screen bg-[var(--paper)]">
        <PublicNav />
        <section className="flex min-h-[calc(100svh-77px)] items-center justify-center px-6 py-10 sm:py-14 lg:px-10 lg:py-16">
          <div className="w-full max-w-lg rounded-[32px] border border-[var(--line)] bg-[var(--card)] p-7 text-[var(--ink)] shadow-[0_18px_60px_rgba(23,34,31,.08)] sm:p-9">
            <h1 className="text-4xl font-black tracking-[-.06em]">{authCopy.login.title}</h1>
            <p className="mt-3 text-[var(--muted)]">{authCopy.login.body}</p>
            <AuthForm mode="login" />
          </div>
        </section>
      </main>
      <Footer compact />
    </PublicSessionGate>
  );
}
