# TRD — Weave (India MVP)
*Locked stack — Spring Boot backend (SDE1 Java resume alignment)*

---

## 1. Architecture Overview
- **Type:** Web application, mobile-responsive (not native mobile for v1)
- **Pattern:** Separate frontend/backend repos, REST API (JSON), relational database
- **Repos:** `weave-frontend` (Next.js), `weave-backend` (Spring Boot) — not a monorepo
- **Hosting region:** India-first (low latency for India-based users); architecture should not hardcode region assumptions, to allow future multi-region expansion

## 1A. Repo & Backend Architecture Strategy
- **Repo strategy: Polyrepo** — `weave-frontend` and `weave-backend` as separate repos. No monorepo tooling (Nx/Turborepo/Lerna) — unnecessary overhead for 2 projects, cleaner for recruiters skimming GitHub, simpler independent CI/CD.
- **Backend strategy: Modular Monolith** — single Spring Boot app, NOT microservices. Microservices at this scale (solo/small team, low initial traffic) solves problems you don't have (service discovery, distributed transactions, deployment orchestration) at the cost of shipping speed. A clean modular monolith is also the stronger SDE1-interview signal — it shows you can design proper domain boundaries, which is the actual skill being evaluated.
- **Package-by-domain, not by technical layer only:**
```
com.weave
├── creator      (Controller, Service, Repository, Entity, DTO)
├── brand        (Controller, Service, Repository, Entity, DTO)
├── editor       (Controller, Service, Repository, Entity, DTO)
├── booking      (Controller, Service, Repository, Entity, DTO)
├── invoice      (Controller, Service, Repository, Entity, DTO)
├── auth         (Spring Security config, JWT filter, RBAC)
├── common       (shared exceptions, @ControllerAdvice, base DTOs, config)
```
Each domain package is internally layered (Controller → Service → Repository → Entity). Keeping domain boundaries clean now means a future split to microservices (if ever genuinely needed) is a lift-and-shift, not a rewrite — but that split is explicitly NOT planned for this project.

## 2. Locked Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind v4 | Built on nextjstemplates.com AI Starter Kit (free tier), frontend-only — backend replaced |
| Backend | **Spring Boot 3.x, Java 21 LTS** | Current LTS, virtual threads, SDE1-JD standard |
| API style | REST (JSON) | GraphQL unneeded for this scope |
| ORM | Spring Data JPA + Hibernate | Standard SDE1-expected pairing |
| Database | PostgreSQL | Relational data (users, bookings, invoices); JSONB columns for flexible fields (category tags, evolving compliance content) |
| Migrations | Flyway | Version-controlled schema, standard with Spring Boot |
| Auth | Spring Security + JWT (stateless) | RBAC: Creator, Brand, Editor, Admin |
| Build tool | Maven | Broader enterprise JD match than Gradle |
| Testing | JUnit5 + Mockito | Interview-relevant, standard |
| File storage | AWS S3 (or Cloudflare R2, S3-compatible) | Media kit images, editor-delivered content (watermarked previews) |
| Payments/Payouts/Escrow | **UniBee self-hosted** — $0/month open-source subscription billing, recurring payments, invoicing, hosted checkout, and payment events | $0 plans skip gateway calls. Invoice checkout uses UniBee. Paid plans still carry unavoidable gateway/bank costs. No escrow |
| Containerization | Docker | Backend containerized, strong SDE1 signal |
| CI/CD | GitHub Actions | Free, standard |
| Backend hosting | Render/Railway (fast/free tier) or AWS EC2 (resume weight) | Pick based on time budget |
| Frontend hosting | Vercel | Native Next.js host |
| E-signature (deferred) | FreeSign (freesign.io) — open-source, self-hostable, no subscription | AGPL license (copyleft — self-hosted modifications must stay open-source); no native Aadhaar-linked eSign like Digio/Leegality, but standard e-signature is generally valid for most contracts. Fallback: Digio/Leegality if Aadhaar-linked signing becomes a requirement. |
| Messaging (deferred) | WhatsApp Business API via BSP | For deal-inbox forwarding, payment reminders |

## 2A. Backend Architecture Convention (Spring Boot)
Layered: **Controller → Service → Repository → Entity**, with DTOs for request/response (never expose Entities directly), `@ControllerAdvice` for centralized exception handling, `@Valid`/Bean Validation on inputs. This is the expected pattern for SDE1 Java code review — apply consistently across all modules (Deal/Booking, Invoice, MediaKit, EditRequest).

## 3. Data Model (Core Entities)

```
User
 - id, email, phone, role (creator|brand|editor|admin), created_at, locale

CreatorProfile
 - user_id (FK), display_name, categories[] (see taxonomy), platforms[] (jsonb: {platform, handle, follower_count}),
   city, city_tier, content_language, availability_status, gstin (nullable)

BrandProfile
 - user_id (FK), company_name, industry, gstin (nullable)

Deal
 - id, creator_id (FK), brand_name, deal_type, proposed_rate, currency, status (enum: pending|negotiating|accepted|content_delivered|paid),
   notes, created_at, updated_at, status_history (jsonb log for CRM/history view)

Invoice
 - id, deal_id (FK), creator_id (FK), amount, gst_amount, tds_amount, sac_code, gstin_creator, gstin_brand,
   place_of_supply, status (draft|sent|paid|overdue), provider_payment_link_id, provider_customer_id, due_date, paid_at

MediaKit
 - creator_id (FK), public_slug, rate_card (jsonb: [{content_type, price, delivery_days}]),
   stats_snapshot (jsonb, cached), credibility_snapshot (jsonb: {on_time_delivery_pct, repeat_brand_pct})

ComplianceContent (CMS-style, not hardcoded)
 - id, platform, deal_type, disclosure_text, updated_at  -- editable without code deploys

-- Phase 1.5 --
EditorProfile
 - user_id (FK), portfolio_links[], rating

EditCollaboration
 - id, deal_id (FK, nullable), creator_id (FK), editor_id (FK), status, revision_count (max 3-4 enforced),
   payment_status, suspension_flag

-- Phase 2 --
CollabMatch
 - id, creator_a_id (FK), creator_b_id (FK), fit_score, status
```

## 4. API Design (Representative Endpoints — not exhaustive)

```
POST   /auth/signup                 { role, email/phone }
POST   /auth/login
GET    /users/me

POST   /creator/profile
GET    /creator/profile/:id

POST   /deals                       create deal (manual entry)
GET    /deals?creator_id=           list deals (CRM/history view)
PATCH  /deals/:id                   update status/notes

GET    /rate-benchmark              ?category&followers&engagement&platform&city_tier&language

POST   /invoices                    generate from deal_id
GET    /invoices/:id
POST   /invoices/:id/send           triggers payment-link + reminder scheduling

GET    /compliance/disclosure       ?platform&deal_type  -> static checklist content

GET    /media-kit/:public_slug      public, unauthenticated
PATCH  /media-kit                   creator edits own rate card

-- Phase 1.5 --
POST   /edit-collaborations
PATCH  /edit-collaborations/:id/revision
PATCH  /edit-collaborations/:id/payment-confirm   gates final download

-- Phase 2 --
GET    /collab-matches?creator_id=
```

## 5. Third-Party Integration Notes

**UniBee (free/open-source primary)**
- Use UniBee as primary subscription, recurring-payment, invoice, collection, and payment-event system
- Offer free/$0 plans by creating zero-amount invoices and marking them paid without a gateway transaction
- Never claim real card/UPI/bank processing is free; gateway and payout fees remain external costs
- Model provider customer, subscription, invoice, payment, and webhook event IDs for idempotency/reconciliation
- Creator→editor payout/disbursal is separate from subscription billing and requires its own provider flow
- Structure invoice objects with GSTIN, HSN/SAC code, place of supply, CGST/SGST/IGST breakup fields
- Webhook or event listener required for payment-status updates (paid/failed) to update `Invoice.status`

**Digio/Leegality (deferred past v1)**
- Aadhaar OTP eSign flow; integrate only when contract-generation feature is prioritized

**WhatsApp Business API (deferred past v1)**
- Requires a BSP (Business Solution Provider) relationship, not direct Meta integration
- Use only for utility-category messages initially (cheaper tier) — deal reminders, payment nudges

## 6. Compliance & Tax Logic (Critical — Build as Configurable Rules, Not Hardcoded)
- **GST:** 18% on influencer/promotional services once creator crosses ₹20L annual turnover (₹10L special-category states) — store thresholds/rates in a config table, not application code, since rates change
- **TDS Section 194R:** 10% on benefits/perquisites (cash or gifted product/trip) above ₹20,000/brand/financial year
- **TDS Section 194J:** applies to service fees; informational for invoice calculation, not enforced client-side
- Running-total tracker: sum invoiced amount per financial year per creator; flag at 80%/100% of ₹20L threshold
- **This logic must be reviewable/updatable by a non-engineer (e.g., admin config panel or CMS) since CBDT rules change periodically**

## 7. Security & Access Control
- CRUD permissions are persisted per role/resource/action in `rbac_policies`. Admins can update Creator, Brand, and Editor policies from `/admin/rbac/policies`; Admin access cannot be disabled. Core booking, package, profile, edit-request, invoice, and message endpoints evaluate these policies server-side. Policy changes are audited and read from PostgreSQL for immediate effect without unnecessary cache invalidation.
- Role-based access control (RBAC): Creator, Brand, Editor, Admin — enforce at API layer, not just UI
- Media kit pages are the only public/unauthenticated routes; everything else requires auth
- Editor-delivered content (Section 4.1 of PRD): store watermarked/low-res preview separately from final asset; final asset only served after `payment_status == confirmed`
- Standard practices: hashed credentials or OAuth, HTTPS everywhere, rate-limiting on public endpoints (media kit, rate-benchmark)

## 8. Non-Functional Requirements
- **Localization:** UI copy must be externalized (i18n-ready) from day one, even if only English ships in v1 — Hindi/regional language is a planned Phase 1.x addition, and retrofitting i18n later is expensive
- **Currency:** INR only for v1, but currency should be a field, not hardcoded, to support global expansion later
- **Performance:** no special scaling requirements at MVP user volumes; standard indexing on `Deal.creator_id`, `Invoice.creator_id` is sufficient
- **Auditability:** `status_history` on deals and invoice status changes should be append-only logs, not overwritten — useful both for the CRM feature and for dispute resolution

## 9. Explicitly Deferred Technical Work (Do Not Build in v1)
- E-signature integration
- WhatsApp Business API integration
- AI/ML rate-benchmarking model (use static seeded lookup table for v1, not a trained model)
- True screenshot/screen-recording prevention (not technically enforceable — do not attempt; use watermarking)
- Payment escrow (holding funds) — requires payment aggregator licensing in India; confirm with founders before any implementation work begins

## 10. Open Technical Decisions (Flag to Founders, Do Not Assume)
- UniBee billing coverage — confirm gateway coverage, self-hosting, recurring billing, webhook, and payout requirements before production cutover.
- Creator→editor payout/disbursal flow — currently missing from implementation checklist and needs a separate design before editor-collab money flow is complete.
- "Influencing score" composite metric definition (Phase 1.5 Brand↔Creator module)
- Editor suspension trigger definition (under-delivery vs. rejecting change requests)

## 11. SaaS Starter Capability Baseline

Use Makerkit-style capabilities as product requirements, while preserving Weave domain rules and UniBee billing:

- Authentication: password, magic link, social login, MFA, recovery, session revocation, rate limits, and audit events.
- Multi-tenancy: personal account plus multiple organizations, membership roles, switching, tenant-scoped authorization, and tenant-safe queries.
- Organization foundation is implemented through personal organizations, memberships, an active organization on the user session, and an authenticated switcher. Domain records still require explicit tenant scoping before this requirement is complete; cross-party booking access remains participant-based by design.
- Super Admin: manage, impersonate, disable, and restore users and organizations; audit every privileged action.
- Admin command center, user management, organization management, moderation, content, operations, impersonation, and durable privileged-action audit records are implemented.
- Role dashboards use a shared responsive shell with distinct creator, brand, and editor information architecture, dynamic API-backed metrics, interactive analytics, and a local development feed populated with credited Pexels media.
- Billing: UniBee self-hosted subscription and recurring billing; provider-neutral customer portal. Free plans skip gateway calls.
- UI: Shadcn UI, Tailwind CSS v4, dark/light/system theme, accessible responsive layouts, mobile-first behavior.
- Content: SEO-ready blog and documentation/help center with controlled publishing.
- Delivery: strict TypeScript/ESLint, Playwright E2E, React.Email, unified SMTP/Resend mailer API, serverful/serverless-safe boundaries.
- Extensibility: plugin contracts for testimonials, feedback, roadmap, waitlist, and future modules; no vendor lock-in.
- Agent tooling: repository AI-agent rules and MCP server contract.
- Realtime: Supabase-compatible notification boundary; current WebSocket implementation stays replaceable.
