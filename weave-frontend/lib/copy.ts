export const categories = ["All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty"] as const;

export const homeCopy = {
  hero: {
    eyebrow: "The connector platform",
    title: "Good work finds its people.",
    body:
      "Weave brings creators, brands, and editors into the same room so the right brief, the right talent, and the next collaboration can meet without friction.",
    primaryAction: "Start weaving",
    secondaryAction: "Explore creators",
    chips: ["Creator-first", "Clear briefs", "No escrow"],
    badge: "Built for India →",
    sticker: "No gatekeeping. Just good fits.",
    card: {
      eyebrow: "Creator x Brand",
      title: "Make room for better collabs.",
      footer: "Discover. Connect. Create.",
    },
  },
  marketplace: {
    eyebrow: "Marketplace preview",
    title: "The discovery layer should feel useful before sign-up.",
    body: "Show enough of the marketplace to make the product legible: category fit, availability, and clear next actions.",
    action: "Open discovery →",
  },
  perspectives: {
    eyebrow: "One platform, three perspectives",
    title: "Bring the right people to the same table.",
  },
  featureCards: [
    {
      number: "01",
      title: "Profiles that feel real",
      copy: "Portfolio, categories, packages, availability, and visible proof instead of inflated claims.",
    },
    {
      number: "02",
      title: "Clear discovery",
      copy: "Filters and category chips that help people find a fit without pretending an algorithm knows best.",
    },
    {
      number: "03",
      title: "Bookings with context",
      copy: "Briefs, status, deliverables, conversations, and next actions together in one workspace.",
    },
    {
      number: "04",
      title: "Payment visibility",
      copy: "Payment-link status and invoice tracking without fund holding or escrow.",
    },
  ] as const,
  steps: [
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
  ],
  audienceCards: [
    {
      label: "For creators",
      title: "Own your storefront.",
      copy: "Publish your profile, packages, and credibility in one place. Keep your work visible without turning it into a generic profile directory.",
      href: "/signup?role=creator",
      action: "Create a creator profile",
      tone: "lime",
    },
    {
      label: "For brands",
      title: "Discover with context.",
      copy: "Browse creators by category, compare fit, and move into a booking flow with fewer assumptions and less back-and-forth.",
      href: "/signup?role=brand",
      action: "Find your next creator",
      tone: "paper",
    },
    {
      label: "For editors",
      title: "Package your craft.",
      copy: "Offer editing services with clear pricing, revision limits, and delivery expectations so the work starts from a shared brief.",
      href: "/signup?role=editor",
      action: "Offer editing services",
      tone: "coral",
    },
  ] as const,
  pricingPlans: [
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
      copy: "Status tracking for payment links without fund holding or escrow.",
      items: ["Payment-link tracking", "Invoice status", "INR-first details", "No escrow"],
      action: "Understand payments",
      href: "/help",
      featured: false,
    },
  ] as const,
  faqItems: [
    {
      question: "Is Weave a marketplace?",
      answer: "Yes. It is a discovery and connector marketplace for creators, brands, and editors, with a simple booking flow.",
    },
    {
      question: "Does Weave hold money?",
      answer: "No. Payment links are tracked inside the product, but there is no escrow or fund holding.",
    },
    {
      question: "Can Weave block screenshots?",
      answer: "No. The UI should rely on watermarking and best-effort detection, not promises that cannot be enforced.",
    },
  ] as const,
} as const;

export const publicNavCopy = {
  links: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ] as const,
  exploreGroups: [
    {
      label: "Creators",
      links: [
        { label: "Creator dashboard", href: "/creator/dashboard", description: "Manage bookings, earnings, and next steps." },
        { label: "Creator profile", href: "/creator/aarav-creates", description: "See the public storefront a brand sees." },
      ],
    },
    {
      label: "Brands",
      links: [
        { label: "Discover creators", href: "/brand/discover", description: "Browse the marketplace by category." },
        { label: "Brand dashboard", href: "/brand/dashboard", description: "Track campaigns, bookings, and messages." },
      ],
    },
    {
      label: "Editors",
      links: [
        { label: "Editor dashboard", href: "/editor/dashboard", description: "See the active request queue and work state." },
        { label: "Editor gigs", href: "/editor/gigs", description: "Manage services, pricing, and revisions." },
      ],
    },
    {
      label: "Get started",
      links: [
        { label: "Role selection", href: "/onboarding/role", description: "Choose the workspace that fits you." },
        { label: "Sign up", href: "/signup", description: "Create a new Weave account." },
      ],
    },
  ] as const,
  mobileDiscover: { label: "Explore creators", href: "/brand/discover" },
  login: "Log in",
  join: "Join Weave",
  exploreLabel: "Explore Weave",
  flyoutTag: "Flyout",
} as const;

export const authCopy = {
  login: {
    title: "Welcome back.",
    body: "Your next collaboration is waiting.",
    submit: "Log in →",
    switchLink: "Create an account",
  },
  signup: {
    title: "Find your people.",
    body: "Create your Weave account and choose your workspace.",
    submit: "Create account →",
    switchLink: "Already have an account?",
  },
  roleOptions: [
    { value: "creator", label: "Creator", copy: "" },
    { value: "brand", label: "Brand", copy: "" },
    { value: "editor", label: "Editor", copy: "" },
  ] as const,
  roleSelection: {
    eyebrow: "Step 01 / 02",
    title: "How will you weave?",
    body: "Choose the workspace that fits you best. You can update your profile later.",
    roles: [
      { title: "I’m a Creator", copy: "Show your work. Find the right brand or editor.", href: "/signup?role=creator", tone: "bg-[var(--accent)]" },
      { title: "I’m a Brand", copy: "Find trusted creative people for your next brief.", href: "/signup?role=brand", tone: "bg-white" },
      { title: "I’m an Editor", copy: "Offer your craft and make good work better.", href: "/signup?role=editor", tone: "bg-[var(--orange)]" },
    ] as const,
  },
} as const;
