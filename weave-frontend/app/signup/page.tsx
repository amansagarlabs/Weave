import Link from "next/link";
import { AuthForm } from "../../components/auth-form";
import { PublicNav } from "../../components/public-nav";
import { authCopy } from "../../lib/copy";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const initialRole = params.role === "brand" || params.role === "editor" ? params.role : "creator";

  return (
    <main className="min-h-screen bg-[var(--paper)] px-6 py-8">
      <PublicNav />
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center rounded-[32px] bg-white p-8 shadow-[0_18px_60px_rgba(23,34,31,.08)]">
        <Link href="/" className="text-xl font-black tracking-[-.08em]">
          weave<span className="text-[var(--orange)]">.</span>
        </Link>
        <h1 className="mt-12 text-4xl font-black tracking-[-.06em]">{authCopy.signup.title}</h1>
        <p className="mt-3 text-[var(--muted)]">{authCopy.signup.body}</p>
        <AuthForm mode="signup" role={initialRole} />
      </section>
    </main>
  );
}
