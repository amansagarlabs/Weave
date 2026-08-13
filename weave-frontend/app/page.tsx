import Link from "next/link";
import { ButtonLink, Pill } from "../components/ui";
import { PublicNav } from "../components/public-nav";
import { Footer } from "../components/footer";

const categories = ["All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty"] as const;

const audienceCards = [
  {
    label: "For creators",
    title: "Own your storefront.",
    copy:
      "Publish your profile, packages, and credibility in one place. Keep your work visible without turning it into a generic profile directory.",
    href: "/signup?role=creator",
    action: "Create a creator profile",
    tone: "lime",
  },
  {
    label: "For brands",
    title: "Discover with context.",
    copy:
      "Browse creators by category, compare fit, and move into a booking flow with fewer assumptions and less back-and-forth.",
    href: "/signup?role=brand",
    action: "Find your next creator",
    tone: "paper",
  },
  {
    label: "For editors",
    title: "Package your craft.",
    copy:
      "Offer editing services with clear pricing, revision limits, and delivery expectations so the work starts from a shared brief.",
    href: "/signup?role=editor",
    action: "Offer editing services",
    tone: "coral",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Show the work",
    copy: "Build a profile with categories, packages, and portfolio details that feel credible on first glance.",
  },
  {
    number: "02",
    title: "Find the fit",
    copy: "Use category discovery and simple filters to connect the right creator, brand, or editor faster.",
  },
  {
    number: "03",
    title: "Track the handoff",
    copy: "Move from brief to booking to payment status with a clear trail, not a black box.",
  },
] as const;

const pricingPlans = [
  {
    title: "Join",
    price: "Rs 0",
    suffix: "to start",
    copy: "Create a profile, explore the network, and publish your public surface.",
    items: ["Role-based onboarding", "Discovery surfaces", "Public profiles", "Private messaging"],
    action: "Join for free",
    href: "/onboarding/role",
    featured: false,
  },
  {
    title: "Collaborate",
    price: "Rs 0",
    suffix: "monthly",
    copy: "For active work across bookings, briefs, and delivery status.",
    items: ["Booking tracking", "Package management", "Status timelines", "Brief context"],
    action: "Start collaborating",
    href: "/onboarding/role",
    featured: true,
  },
  {
    title: "Payments",
    price: "Pass-through",
    suffix: "at checkout",
    copy: "Status tracking for Razorpay payment links without fund holding or escrow.",
    items: ["Payment-link tracking", "Invoice status", "INR-first details", "No escrow"],
    action: "Understand payments",
    href: "/help",
    featured: false,
  },
] as const;

const faqItems = [
  {
    question: "Is Weave a marketplace?",
    answer:
      "Yes. It is a discovery and connector marketplace for creators, brands, and editors, with a simple booking flow.",
  },
  {
    question: "Does Weave hold money?",
    answer:
      "No. Razorpay payment links are tracked inside the product, but there is no escrow or fund holding.",
  },
  {
    question: "Can Weave block screenshots?",
    answer:
      "No. The UI should rely on watermarking and best-effort detection, not promises that cannot be enforced.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <PublicNav />

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-24">
        <div>
          <Pill tone="lime">The connector platform</Pill>
          <h1 className="mt-7 max-w-3xl text-6xl font-black leading-[.91] tracking-[-.08em] sm:text-7xl lg:text-[7.2rem]">
            Good work finds its people.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Weave brings creators, brands, and editors into the same room so the right brief, the right talent, and the next
            collaboration can meet without friction.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/onboarding/role">Start weaving</ButtonLink>
            <ButtonLink href="/brand/discover" variant="outline">
              Explore creators
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[var(--muted)]">
            <span>Creator-first</span>
            <span>Clear briefs</span>
            <span>No escrow</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="aspect-square rotate-3 rounded-[32px] bg-[var(--forest)] p-5 shadow-[14px_14px_0_var(--accent)]">
            <div className="flex h-full flex-col justify-between rounded-[22px] bg-[var(--accent)] p-7 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="text-5xl" aria-hidden="true">
                  *
                </span>
                <span className="rounded-full bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-widest">01 / 03</span>
              </div>

              <div>
                <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--forest)]">Creator x Brand</p>
                <h2 className="max-w-md text-5xl font-black leading-[.92] tracking-[-.07em] sm:text-6xl">
                  Make room for better collabs.
                </h2>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--forest)]/20 pt-4 text-sm font-bold">
                <span>Discover. Connect. Create.</span>
                <span aria-hidden="true">-&gt;</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-5 -rotate-6 rounded-2xl bg-[var(--orange)] px-5 py-4 text-sm font-black shadow-[5px_5px_0_var(--ink)]">
            No gatekeeping. Just good fits.
          </div>

          <div className="absolute -right-2 -top-6 hidden rounded-full border-2 border-[var(--ink)] bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest lg:block">
            Built for India -&gt;
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <span className="mr-3 text-sm font-bold text-[var(--muted)]">Explore by category</span>
          {categories.map((category) => (
            <Link
              key={category}
              href={category === "All" ? "/brand/discover" : `/brand/discover?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--ink)] hover:bg-[var(--accent)]"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--orange)]">Marketplace preview</p>
            <h2 className="mt-5 text-5xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
              The discovery layer should feel useful before sign-up.
            </h2>
            <p className="mt-6 max-w-xl leading-7 text-[var(--muted)]">
              Show enough of the marketplace to make the product legible: category fit, availability, and clear next actions.
            </p>
          </div>
          <Link href="/brand/discover" className="font-bold text-[var(--forest)] underline">
            Open discovery -&gt;
          </Link>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <MarketplacePreviewCard name="Aarav creates" category="Tech" price="Rs 3,500" />
          <MarketplacePreviewCard name="Nia in motion" category="Fashion" price="Rs 4,000" />
          <MarketplacePreviewCard name="The daily edit" category="Lifestyle" price="Rs 2,800" />
        </div>
      </section>

      <section id="for-you" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--orange)]">One platform, three perspectives</p>
          <h2 className="mt-5 text-5xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
            Bring the right people to the same table.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {audienceCards.map((card) => (
            <AudienceCard
              key={card.title}
              label={card.label}
              title={card.title}
              copy={card.copy}
              href={card.href}
              action={card.action}
              tone={card.tone}
            />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-[var(--ink)] px-6 py-24 text-white lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">How it works</p>
              <h2 className="mt-5 text-5xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
                Less chasing.
                <br />
                More making.
              </h2>
              <p className="mt-6 max-w-sm leading-7 text-white/65">
                A simple path from "this could work" to "let's make it happen."
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
              {steps.map((step) => (
                <StepCard key={step.number} number={step.number} title={step.title} copy={step.copy} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--forest)]">Built around the work</p>
            <h2 className="mt-5 text-5xl font-black tracking-[-.07em] sm:text-6xl">The useful stuff, in one place.</h2>
          </div>
          <Link href="/onboarding/role" className="font-bold text-[var(--forest)] underline">
            See your workspace -&gt;
          </Link>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard number="01" title="Profiles that feel real" copy="Portfolio, categories, packages, availability, and visible proof instead of inflated claims." />
          <FeatureCard number="02" title="Clear discovery" copy="Filters and category chips that help people find a fit without pretending an algorithm knows best." />
          <FeatureCard number="03" title="Bookings with context" copy="Briefs, status, deliverables, conversations, and next actions together in one workspace." />
          <FeatureCard number="04" title="Payment visibility" copy="Razorpay payment-link status and invoice tracking without fund holding or escrow." />
        </div>
      </section>

      <section id="pricing" className="border-y border-[var(--line)] bg-[var(--card)] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--forest)]">Pricing</p>
            <h2 className="mt-5 text-5xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
              Start with the work.
              <br />
              Pay for what moves.
            </h2>
            <p className="mt-6 max-w-xl leading-7 text-[var(--muted)]">
              Weave removes the subscription barrier while the marketplace grows. Launch access stays open and payment costs
              stay visible where they belong.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.title}
                title={plan.title}
                price={plan.price}
                suffix={plan.suffix}
                copy={plan.copy}
                items={plan.items}
                href={plan.href}
                action={plan.action}
                featured={plan.featured}
              />
            ))}
          </div>

          <p className="mt-8 text-sm font-bold text-[var(--forest)]/70">
            Payment-provider and transaction charges, if applicable, are shown before payment. Weave does not hold funds in escrow.
          </p>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--orange)]">FAQ</p>
            <h2 className="mt-5 text-5xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
              Clear answers before anyone signs up.
            </h2>
            <p className="mt-6 max-w-lg leading-7 text-[var(--muted)]">
              The home page should explain the product honestly: what it does, what it costs, and what it does not promise.
            </p>
          </div>

          <div className="grid gap-4">
            {faqItems.map((item) => (
              <FaqCard key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-6 rounded-[32px] bg-[var(--forest)] px-6 py-20 text-center text-white shadow-[8px_8px_0_var(--orange)] lg:mx-auto lg:max-w-7xl lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Your next chapter starts here</p>
        <h2 className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[.92] tracking-[-.07em] sm:text-7xl">
          Ready to find your people?
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-7 text-white/70">
          Create your free profile and make room for the collaboration you have been waiting for.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/onboarding/role" variant="accent">
            Start weaving
          </ButtonLink>
          <ButtonLink href="/login" variant="outline">
            Log in
          </ButtonLink>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function AudienceCard({
  tone,
  label,
  title,
  copy,
  href,
  action,
}: {
  tone: "lime" | "paper" | "coral";
  label: string;
  title: string;
  copy: string;
  href: string;
  action: string;
}) {
  const background =
    tone === "lime" ? "bg-[var(--accent)]" : tone === "paper" ? "bg-white border border-[var(--line)]" : "bg-[var(--orange)]";
  const shadow = tone === "paper" ? "" : "shadow-[6px_6px_0_var(--ink)]";

  return (
    <article className={`flex min-h-[360px] flex-col rounded-[24px] p-7 ${background} ${shadow}`}>
      <p className="text-xs font-bold uppercase tracking-[.15em]">{label}</p>
      <h3 className="mt-12 text-3xl font-black leading-[.95] tracking-[-.06em]">{title}</h3>
      <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--ink)]/70">{copy}</p>
      <Link href={href} className="mt-auto pt-8 text-sm font-bold underline underline-offset-4">
        {action} -&gt;
      </Link>
    </article>
  );
}

function StepCard({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <article className="border-t border-white/25 pt-5">
      <p className="font-mono text-sm font-bold text-[var(--orange)]">{number}</p>
      <h3 className="mt-8 text-2xl font-black leading-tight tracking-[-.04em]">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-white/60">{copy}</p>
    </article>
  );
}

function FeatureCard({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <article className="border-t-2 border-[var(--ink)] pt-5">
      <p className="font-mono text-sm font-bold text-[var(--orange)]">{number}</p>
      <h3 className="mt-8 text-2xl font-black leading-tight tracking-[-.04em]">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{copy}</p>
    </article>
  );
}

function PricingCard({
  title,
  price,
  suffix,
  copy,
  items,
  href,
  action,
  featured = false,
}: {
  title: string;
  price: string;
  suffix: string;
  copy: string;
  items: readonly string[];
  href: string;
  action: string;
  featured?: boolean;
}) {
  return (
    <article className={`rounded-[24px] p-7 ${featured ? "bg-[var(--ink)] text-white shadow-[7px_7px_0_var(--orange)]" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-bold uppercase tracking-[.15em] ${featured ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{title}</p>
        {featured ? <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-[var(--ink)]">Most useful</span> : null}
      </div>
      <p className="mt-10 text-4xl font-black tracking-[-.07em]">{price}</p>
      <p className={`mt-1 text-sm ${featured ? "text-white/60" : "text-[var(--muted)]"}`}>{suffix}</p>
      <p className={`mt-6 min-h-14 text-sm leading-6 ${featured ? "text-white/70" : "text-[var(--muted)]"}`}>{copy}</p>
      <ul className="mt-7 space-y-3 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={featured ? "text-[var(--accent)]" : "text-[var(--orange)]"}>*</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold ${
          featured ? "bg-[var(--accent)] text-[var(--ink)]" : "border-2 border-[var(--ink)]"
        }`}
      >
        {action} -&gt;
      </Link>
    </article>
  );
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-2xl bg-white p-5">
      <h3 className="font-black">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{answer}</p>
    </article>
  );
}

function MarketplacePreviewCard({ name, category, price }: { name: string; category: string; price: string }) {
  return (
    <article className="group overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(23,34,31,.06)]">
      <div className="flex aspect-[4/3] items-center justify-center bg-[var(--accent)] text-5xl transition-transform group-hover:scale-[1.02]">
        ✦
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black">{name}</h3>
          <Pill>{category}</Pill>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">Available for work · 18k followers</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-bold">From {price}</span>
          <Link href="/brand/discover" className="rounded-full border-2 border-[var(--ink)] px-4 py-2 text-sm font-bold">
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
