# DEVELOPMENT_PAPER.md
Weave — Creator↔Brand↔Editor Connector Platform — Full Dev Paper
*Supersedes old "ops-tool, not marketplace" direction in PRD.md/SCOPE.md — those files not yet updated. This paper reflects current pivot.*

---

## 1. What this is
A 3-sided platform connecting Indian micro-influencers (1K–100K followers) directly with brands for paid collabs, plus on-demand editors for reel/photo editing. India-first, global after.

**This is now a discovery/booking marketplace** (reverses earlier "not a marketplace" positioning). No legal-protection/ASCI-compliance motto as core USP — dropped per direction change.

## 2. Roles
- **Creator** — gets discovered by brands, books editors
- **Brand** — discovers/filters creators, books collabs
- **Editor** — offers editing gigs, fulfills creator requests

## 3. Core Features

### 3.1 Onboarding
Role selection before signup → separate UI per role (Creator/Brand/Editor).

### 3.2 Creator Profile + Package Menu
Public profile (`/creator/:slug`): stats, category tags, portfolio, credibility chips (Trust Score/Completion %/Authenticity %/Rating), fixed-price/delivery-time package cards.

### 3.3 Brand Discovery
Filter by category (All/Tech/Fashion/Lifestyle/Gaming/Fitness/Travel/Beauty), followers, engagement, "influencing score" (**definition still open — placeholder metric until defined**).

### 3.4 Booking Flow
Brand → Creator: browse → message/DM → proposal or package select → brief approval → payment → delivery → release.
Brand-initiated DM: brand can message any creator directly (per original ask).

### 3.5 Creator↔Editor Module
Creator hires editor → editor delivers watermarked/low-res preview → creator requests revisions (max 3-4 rounds) → final asset gated until payment confirmed → editor account temp-suspended (4-5 days) if repeatedly fails/denies agreed revisions beyond 3-4 times (**trigger definition still open**).

**Hard constraint carried over:** true screenshot/screen-recording prevention not OS-enforceable. Watermarking + best-effort detection only. Do not promise "screenshot-proof" in UI copy.

## 4. Data Model (updated for marketplace model)

```
User (id, email, phone, role: creator|brand|editor|admin)

CreatorProfile (user_id, display_name, categories[], platforms[](jsonb),
  city, content_language, availability_status, influencing_score)

BrandProfile (user_id, company_name, industry, gstin)

EditorProfile (user_id, portfolio_links[], rating)

Package (owner_id, owner_type: creator|editor, content_type, price,
  delivery_days, revisions_included)

Booking (id, brand_id, creator_id, package_id, status:
  pending|negotiating|accepted|delivered|paid, amount, created_at, status_history[])

EditRequest (id, creator_id, editor_id, status, revision_count[max 3-4],
  payment_status, preview_asset_url[watermarked], final_asset_url[gated],
  suspension_flag)

Message (thread_id, sender_id, recipient_id, body, created_at)
```

## 5. Tech Stack (locked — Spring Boot backend for SDE1 Java resume alignment)
- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind v4, mobile-first responsive (built on AI Starter Kit template, frontend-only)
- Backend: **Spring Boot 3.x, Java 21 LTS** — separate repo `weave-backend`
- Architecture: Controller → Service → Repository → Entity, DTOs, `@ControllerAdvice`, `@Valid`
- ORM: Spring Data JPA + Hibernate
- DB: PostgreSQL, Flyway migrations
- Auth: Spring Security + JWT (stateless), RBAC (Creator/Brand/Editor/Admin)
- Build: Maven | Testing: JUnit5 + Mockito
- Payments/Payouts/Escrow: **UniBee self-hosted** — $0/month open-source subscription billing, recurring payments, invoicing, and payment events. $0 plans skip gateways. No escrow/fund holding.
- File storage: AWS S3 or Cloudflare R2 (watermarked previews, portfolio assets)
- Containerization: Docker | CI/CD: GitHub Actions
- Hosting: backend on Render/Railway or AWS EC2, frontend on Vercel

## 6. Sitemap
See `SITEMAP.md` — 32 routes across Creator/Brand/Editor/Public/Admin.

## 7. UI/UX Reference
See `UI_UX_RESEARCH.md` — patterns borrowed from CollabMarket (profile layout), GetCollab (discovery/filter), Fiverr (package tiers, gig cards, revision flow).

## 7A. E-signature (deferred)
FreeSign (freesign.io) — open-source, self-hostable, free. AGPL copyleft applies if self-hosted and modified. No Aadhaar-linked eSign; fallback to Digio/Leegality if that becomes a legal requirement.

## 8. Non-Functional Requirements
- CRUD permissions are persisted in a role/resource/action policy matrix. Super Admins can update Creator, Brand, and Editor permissions from the RBAC console; Admin access remains protected. Core booking, package, profile, edit-request, invoice, and message APIs enforce the matrix and record policy changes in the privileged audit log.
- i18n-ready (English v1, Hindi/regional planned)
- INR only v1, currency as a field not hardcoded
- RBAC enforced server-side, not just UI
- `status_history` append-only on Booking and EditRequest for dispute resolution

## 9. Payments/Compliance
- UniBee for subscription billing, recurring payments, invoices, collections, and payment events. Free plans must require no payment method or gateway call. Paid transactions still have external gateway/bank costs. Creator→editor payout/disbursal remains separate work.
- GST/TDS invoice fields still required wherever platform facilitates payment (GSTIN, SAC code, CGST/SGST/IGST) — this is a payments-correctness requirement, not the dropped "legal-protection" feature
- No escrow/fund-holding without payment aggregator license — confirm model (pass-through payment link vs. held funds) before building EditRequest payment-gate logic

## 10. Explicitly Out of Scope (v1)
- ASCI disclosure checklist (dropped — no longer positioned as core USP)
- Creator↔Creator collab matching (defer)
- Public trending leaderboard (defer)
- True screenshot/recording prevention (not buildable)
- AI-trained rate/fit-score model (use static/rule-based scoring for v1)

## 11. Open Decisions (need founder sign-off before build)
1. "Influencing score" — exact formula
2. Editor-suspension trigger — under-delivery vs. rejecting requested changes
3. UniBee billing coverage — payment-gateway rollout is deferred to a later release as of 2026-08-20; confirm gateway coverage, self-hosting, recurring billing, webhook, reconciliation, and payout requirements before production cutover
4. Whether GST/TDS invoicing stays in scope given ASCI/legal-protection framing dropped (recommend: keep — payments still need correct invoicing regardless of positioning)

## 12. Doc Sync Status
`PRD.md`, `SCOPE.md`, `TRD.md`, `DESIGN.md`, `AGENT_CONTEXT.md` still reflect the earlier "not a marketplace" direction. **Not yet updated to match this pivot.** Update those files before handing to a dev/agent, or agent will get conflicting instructions.

## 13. Payment Direction Update
- UniBee is the target stack: free/open-source subscription billing and recurring payments.
- UniBee is the primary provider, isolated behind the same payment adapter.
- $0 user plans use internal zero-amount completion; no gateway charge.
- Paid user transactions are not guaranteed free; external processor costs remain.
- Invoice payment links use UniBee hosted checkout; live payment-gateway onboarding is deferred to a later release as of 2026-08-20.

## 14. SaaS Starter Capability Goal

Weave will use Makerkit-style SaaS capabilities as an implementation baseline, while preserving Weave workflows, UniBee billing, and open-source ownership:

- Full authentication: password, magic link, social login, MFA, recovery, session revocation, and audit logging.
- Multi-tenancy: personal accounts, organizations, switching, memberships, and strict tenant isolation.
- Current implementation starts with personal organizations, memberships, active-organization switching, and an authenticated switcher. Resource-level tenant scoping remains open; bookings are cross-party collaboration records and must use participant authorization rather than a single-tenant assumption.
- Super Admin: user and organization management, impersonation, disable/restore controls, and privileged-action audit logs.
- Current admin surface includes a command center, user suspend/restore, organization member/status management, moderation, content, operations, impersonation, and durable privileged-action audit tools.
- Creator, brand, and editor dashboards now have separate role-specific hierarchy and actions inside a shared responsive UI system, with interactive analytics and credited local Pexels dummy media for development.
- Billing: UniBee self-hosted primary; recurring billing and customer portal through provider-neutral interfaces. `$0` plans require no gateway.
- Frontend: Shadcn UI, Tailwind CSS v4, dark/light/system theme, accessible mobile-first layouts.
- Product surfaces: SEO-ready blog, documentation/help center, realtime notifications, and plugin modules.
- Engineering: strict TypeScript/ESLint, Playwright E2E, React.Email, unified SMTP/Resend mailers, serverful/serverless-safe boundaries, AI-agent rules, and MCP tooling.
- Architecture rule: Weave owns domain logic and data. External providers stay replaceable adapters.
- Creator→editor payout/disbursal still needs a separate design and implementation plan.
