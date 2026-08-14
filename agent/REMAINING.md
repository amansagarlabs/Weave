# Weave — Remaining Work

Updated: 2026-08-14

This file is the current implementation checklist for continuing Weave. Product direction comes from `Development paper.md`, routes from `Sitemap.md`, technical decisions from `TRD.md`, and visual behavior from `Design System file.md`.

## Current state

### Completed

- [x] Polyrepo structure exists: `weave-frontend` and `weave-backend`.
- [x] Spring Boot 3.4 / Java 21 / Maven project skeleton exists.
- [x] PostgreSQL, Flyway, JPA, JWT security, CORS, and initial schema are configured.
- [x] Auth signup/login UI and backend endpoints exist.
- [x] Creator profile save endpoint and creator onboarding form are connected.
- [x] Creator discovery endpoint and discovery UI are connected.
- [x] Category taxonomy uses exactly: All, Tech, Fashion, Lifestyle, Gaming, Fitness, Travel, Beauty.
- [x] Booking create/list endpoints exist.
- [x] Brand and creator booking lists call `GET /bookings`.
- [x] Message send/thread endpoints exist.
- [x] Profile and message UI actions call the backend API.
- [x] Public navigation has a grouped Explore flyout and mobile menu.
- [x] Reusable authenticated shell, mobile bottom navigation, cards, pills, statuses, tabs, timelines, forms, empty states, discovery cards, and footer exist.
- [x] Authenticated shell now uses a shadcn-style collapsible sidebar with icon-only collapsed mode, sidebar search, and a reusable workspace trigger/inset layout.
- [x] Authenticated shell now includes a top-right profile avatar dropdown with account links, logout, and a persisted theme toggle using the shared global color variables.
- [x] Public help search/accordion and notifications interactions exist.
- [x] Watermark copy clearly states that screenshots and screen recordings cannot technically be prevented.
- [x] Payment copy uses payment links/status and does not promise escrow or fund holding.
- [x] Creator settings now persist locale and notification preference through `/users/me` and show a live account snapshot.
- [x] Frontend production build passes all currently registered routes.
- [x] Development-only demo accounts documented in `agent/DEMO_CREDENTIALS.md`; seeded only with the explicit Spring `demo` profile.
- [x] Demo profile includes representative booking, message, editor-request, package, and draft-invoice records for page-flow testing.
- [x] Map JSONB-backed entity fields explicitly with Hibernate `@JdbcTypeCode(SqlTypes.JSON)`; creator profile save verified end to end.

### Important verification note

- [x] Backend Maven tests verified through the pinned Docker Maven/Java 21 build: 13 tests passed.
- [x] Full backend compile and Spring Boot packaging verified through the Docker build.
- [x] Frontend route count is broader than the sitemap because package edit/new, portfolio upload, and other nested routes are also registered. Reconcile the sitemap count before release.

## Highest-priority remaining work

### 1. Finish authentication and authorization

- [x] Add protected-route handling in the frontend. Redirect unauthenticated users away from workspace routes.
- [x] Validate the JWT role on the backend for domain controllers with Spring method security; service-level ownership checks remain in place.
- [x] Add a current-user endpoint and use the real user ID in frontend message rendering and message requests.
- [x] Replace the hardcoded message recipient fallback in `components/message-thread.tsx` with the actual conversation participant.
- [x] Add logout and a consistent unauthorized state. Token expiry handling remains open for API refresh/expiry detection.
- [x] Add backend unit tests for signup, login, duplicate email, and invalid JWT handling. Role-restriction integration coverage remains open.

### 2. Complete creator profile and package management

- [x] Add `GET /creator/profile/me` so profile edit loads existing values.
- [x] Change profile save from always-create behavior to update/upsert behavior.
- [x] Validate unique public slugs with a clear field-level error.
- [x] Add backend package repository, DTOs, service, and controller.
- [x] Connect `/creator/packages`, `/creator/packages/new`, and `/creator/packages/edit` to real package CRUD.
- [x] Add archive behavior and owner authorization for packages. Duplicate and reorder remain open.
- [x] Add creator portfolio storage metadata and local/mock upload flow; connect S3/R2 after storage credentials are configured.

### 3. Finish brand profiles and booking workflow

- [x] Add brand profile DTOs, repository, service, and controller.
- [x] Connect `/brand/onboarding` and `/brand/settings` to persisted brand data.
- [x] Validate that the requested creator exists and has a creator role before creating a booking.
- [x] Validate optional `packageId` ownership and amount against the selected package.
- [x] Add booking detail endpoint `GET /bookings/{id}` with participant authorization.
- [x] Add status transition endpoint for Pending, Negotiating, Accepted, and Content Delivered. Paid remains payment-webhook work.
- [x] Persist and return status history for the booking timeline.
- [x] Replace placeholder booking detail pages with live API data and next-action controls.

### 4. Build editor domain APIs and UI

- [x] Add editor profile DTOs, repository, service, controller, and save/load endpoints.
- [x] Add editor gig/package persistence and connect `/editor/gigs`, `/editor/gigs/new`, and `/editor/gigs/edit`.
- [x] Add edit-request creation, list, detail, status, revision-count, and preview metadata endpoints.
- [x] Enforce the three-revision cap in backend validation.
- [ ] Keep editor suspension behavior as a placeholder with the comment `pending founder sign-off`; do not invent trigger logic.
- [x] Connect creator hire-editor discovery and request creation to real editor data. Request queues/details are now live.
- [x] Public creator storefront loads persisted profile and package data without invented metrics.
- [x] Brand discovery uses persisted creator profiles with intentional loading, error, and empty states; invented discovery metrics are removed.
- [x] Add upload-state UI for preview and final asset metadata; integrate S3/R2 only after storage configuration is available.

### 5. Implement payments and invoices safely

- [x] Add invoice entity, migration, repository, DTOs, service, and controller.
- [x] Add configurable GST/TDS invoice fields: GSTIN, SAC code, place of supply, tax breakup, and net payable.
- [x] Add a Razorpay payment-link service boundary. Provider SDK/configuration remains to be connected.
- [x] Implement the payment-link/pass-through boundary only; do not hold funds or build escrow.
- [x] Add webhook signature verification and idempotent payment-status updates.
- [x] Implement invoice states: Draft, Sent, Paid, Overdue.
- [x] Connect creator earnings/invoice screens to the invoice and booking APIs.
- [x] Show participant-visible invoice/payment status from booking detail. Razorpay webhook status updates remain open.
- [x] Add explicit provider-not-configured and invalid-webhook error states. Frontend retry affordance remains open.

### 6. Complete messaging

- [x] Add conversation/thread persistence or a thread query that returns participants and context.
- [x] Add participant authorization to `GET /messages/{threadId}`.
- [x] Add participant-scoped inbox endpoint with latest-message preview. Unread counts remain open.
- [x] Connect creator and brand inbox pages to live threads instead of empty-state-only UI.
- [x] Add booking context and participant validation to `booking-{id}` message threads.
- [x] Add send failure retry and optimistic/pending message states.

### 7. Complete admin and support surfaces

- [x] Add admin-only backend endpoints for users, disputes, flags, taxonomy, and editable content. Admin user suspend/restore endpoints now exist; disputes/flags/taxonomy/content are now wired end to end.
- [x] Enforce `ADMIN` role server-side and use a dedicated admin shell/navigation boundary.
- [x] Replace placeholder admin user rows with an admin-only API, loading, and error states. Pagination/filtering remain open.
- [x] Add confirmation dialogs for destructive admin actions.
- [x] Add content preview and publish confirmation for compliance copy and category labels.
- [x] Connect notifications to persisted events instead of sample in-memory notifications.

## Frontend quality work remaining

- [x] Add loading and error files/states for important App Router segments.
- [x] Add `aria-current` and active-route styling to desktop and mobile navigation.
- [x] Replace raw `<a>` links inside workspace pages with Next `Link` where appropriate.
- [x] Add a real modal/dialog primitive with Escape handling, focus trap, and focus restoration for ASCI/disclosure steps and confirmations.
- [x] Add responsive admin user cards/table fallback with suspend/restore confirmation flow and suspension status badges.
- [x] Add a reusable file-dropzone component with progress, failure recovery, and keyboard operation.
- [x] Add a reusable select, currency field, tag input, and payment-state component.
- [x] Move visible copy into an i18n-ready message map as required by the design system.
- [x] Add a skip link to authenticated shells. Logical heading audit across all routes remains open.
- [ ] Test keyboard navigation, 360px layout, 768px layout, 1440px layout, and 200% zoom.
- [ ] Add automated accessibility checks and component examples for primary, hover, focus, disabled, loading, and error states.
- [x] Replace sample creator metrics and copy with backend-backed values; never display invented influence scores.

## Backend and infrastructure remaining

- [x] Add a reproducible Docker Maven/Java 21 build path; local Maven Wrapper remains optional.
- [x] Add JUnit 5 and Mockito unit tests for tax calculation, invoice states, and webhook signature handling. Full service/controller authorization coverage remains open.
- [ ] Add Testcontainers PostgreSQL integration tests for Flyway migrations and repositories.
- [x] Add database indexes for public slug, creator category discovery, booking participants, and message threads.
- [x] Add request validation and consistent API error envelopes for current domain requests.
- [x] Add structured logging, correlation IDs, and safe production error messages.
- [x] Add Docker Compose development wiring and PostgreSQL health check for the backend stack; runtime smoke test passes with Flyway v5 and `/actuator/health` returning `UP`.
- [x] Add GitHub Actions workflows for backend tests, frontend build, and security/dependency checks.
- [ ] Configure free opensource cloudflare S3/R2, payment gateway, JWT secret, database credentials, and CORS through environment variables only.
- [x] Add rate limiting and abuse protection for auth, messages, discovery, and payment-link endpoints.
- [ ] Add real time conversations web socket an if anyone typign show typign animated resposne make dynamic and add + icons for uplaod anyhting content like in usual conversation opensorce emojis gifs stickers etc 


## Suggested build order

1. Authentication guards, current-user endpoint, logout, and backend tests.
2. Creator package CRUD and brand profile persistence.
3. Booking detail/status transitions and live timelines.
4. Inbox/thread participant model and live inboxes.
5. Editor profiles, gigs, and edit requests.
6. Invoice/payment-link integration and webhook handling.
7. Portfolio storage and preview upload states.
8. Admin APIs, notifications, accessibility audit, and deployment CI.

## Release acceptance checklist

- [ ] A creator can sign up, complete a profile, add a package, and view the public profile.
- [ ] A brand can sign up, discover a creator, send a message, request a package, and view a pending booking.
- [ ] Both participants can view the same booking status history and authorized messages.
- [ ] An editor can create a gig, receive a request, upload a preview, handle revisions, and see payment status.
- [ ] A creator can create an invoice/payment link and see Draft, Sent, Paid, or Overdue state without escrow behavior.
- [ ] Admin routes are server-authorized and operational.
- [ ] All required routes have intentional loading, empty, error, and success states.
- [ ] Backend tests, frontend build, database migration checks, and accessibility checks pass in CI.
