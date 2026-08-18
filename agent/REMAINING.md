# Weave — Remaining Work

Updated: 2026-08-18

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
- [x] Added the reusable footer to all public-facing surfaces: homepage, help, login, signup, role selection, and public creator profiles.
- [x] Public footer includes full and compact variants, role links, workspace/login state, responsive utility navigation, and the animated crowd illustration.
- [x] Removed the crowd pause control and tightened footer utility-link hover spacing.
- [x] Launch hardening: suspended accounts are disabled by Spring Security and invalid credentials return a structured 401 response.
- [x] Launch hardening: booking creation/status changes, messages, and editor requests now create persisted participant notifications.
- [x] Launch hardening: persisted notifications can send best-effort transactional email through environment-configured SMTP; Mailpit is included for local capture.
- [x] Enterprise auth pass: access and refresh sessions use HttpOnly cookies, refresh rotation, revocation, secure cookie configuration, and CSRF double-submit protection.
- [x] Frontend auth no longer stores access JWTs or roles in localStorage; API calls use credentials, silent refresh, and backend session truth.
- [x] Added short-lived server-issued realtime credentials for STOMP without persistent browser token storage.
- [x] Added PostgreSQL outbox persistence for notifications, retry/backoff, dead-letter state, and admin-safe inspection/retry.
- [x] Added Redis-backed distributed rate limiting with local fallback and Compose health-gated Redis persistence.
- [x] Added explicit Cloudinary production storage provider with server-side credentials, media type/size validation, and HTTPS delivery URLs; MinIO/R2-compatible storage remains available for alternate deployments.
- [x] Added Prometheus-compatible metrics exposure and baseline security headers.
- [x] Added hashed, one-time, expiring password reset tokens, queued reset email delivery, and refresh-session revocation after reset.

### Important verification note

- [x] Backend Maven tests verified through the pinned Docker Maven/Java 21 build: 17 tests ran with 15 passing and 2 Testcontainers tests skipped when nested Docker is unavailable.
- [x] Full backend compile and Spring Boot packaging verified through the Docker build.
- [x] Frontend route count is broader than the sitemap because package edit/new, portfolio upload, and other nested routes are also registered. Reconcile the sitemap count before release.

## Highest-priority remaining work

### 1. Finish authentication and authorization

- [x] Add protected-route handling in the frontend. Redirect unauthenticated users away from workspace routes.
- [x] Validate the JWT role on the backend for domain controllers with Spring method security; service-level ownership checks remain in place.
- [x] Add a current-user endpoint and use the real user ID in frontend message rendering and message requests.
- [x] Replace the hardcoded message recipient fallback in `components/message-thread.tsx` with the actual conversation participant.
- [x] Add logout and a consistent unauthorized state with silent refresh and session revocation.
- [x] Add backend unit tests for signup, login, duplicate email, and invalid JWT handling. Role-restriction integration coverage remains open.
- [x] Reject suspended accounts at the Spring Security user-details boundary.

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
- [x] Keep editor suspension behavior as a placeholder with the comment `pending founder sign-off`; do not invent trigger logic. Existing suspension code preserves this boundary.
- [x] Connect creator hire-editor discovery and request creation to real editor data. Request queues/details are now live.
- [x] Public creator storefront loads persisted profile and package data without invented metrics.
- [x] Brand discovery uses persisted creator profiles with intentional loading, error, and empty states; invented discovery metrics are removed.
- [x] Add upload-state UI for preview and final asset metadata; integrate S3/R2 only after storage configuration is available.

### 5. Implement payments and invoices safely

- [x] Add invoice entity, migration, repository, DTOs, service, and controller.
- [x] Add configurable GST/TDS invoice fields: GSTIN, SAC code, place of supply, tax breakup, and net payable.
- [x] Add a Razorpay payment-link integration using the provider HTTP API, with invoice/booking references and environment-only credentials. Test/live keys still need to be supplied.
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
- [x] Add transactional notification outbox events with worker retries and dead-letter state.
- [ ] Add admin operations views for failed email, webhook, storage, and active session records.
- [x] Create persisted participant notifications for booking, message, and editor-request events.
- [x] Add payment notification events for invoice creation, payment-link readiness, and paid webhook updates.

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
- [x] Add the reusable footer to public pages without adding it to authenticated workspace shells.

## Backend and infrastructure remaining

- [x] Add a reproducible Docker Maven/Java 21 build path; local Maven Wrapper remains optional.
- [x] Add JUnit 5 and Mockito unit tests for tax calculation, invoice states, and webhook signature handling. Full service/controller authorization coverage remains open.
- [x] Add Testcontainers PostgreSQL integration tests for Flyway migrations and repositories.
- [x] Add database indexes for public slug, creator category discovery, booking participants, and message threads.
- [x] Add request validation and consistent API error envelopes for current domain requests.
- [x] Add structured logging, correlation IDs, and safe production error messages.
- [x] Add Docker Compose development wiring and PostgreSQL health check for the backend stack; runtime smoke test passes with Flyway v5 and `/actuator/health` returning `UP`.
- [x] Add GitHub Actions workflows for backend tests, frontend build, and security/dependency checks.
- [x] Configure S3-compatible MinIO development storage and participant-authorized preview/final asset uploads through environment variables. Cloudflare R2 or another S3-compatible deployment can replace the endpoint and credentials without application changes.
- [x] Add rate limiting and abuse protection for auth, messages, discovery, and payment-link endpoints.
- [x] Add authenticated WebSocket/STOMP conversations: short-lived cookie-authenticated token, participant-scoped thread subscriptions, persisted message delivery, frontend reconnect, and accessible connection status. Typing presence remains open.
- [x] Add Redis service wiring for shared rate limits and future presence/jobs.
- [x] Add `/actuator/prometheus` exposure behind authenticated operator access.
- [x] Add password reset tokens with one-time expiry and session revocation.
- [ ] Add signed private R2 URLs, upload finalization/cleanup jobs, and full payment webhook receipt ledger.
- [ ] Add dynamic typing indicators with accessible status text and a subtle animation.
- [x] Add an accessible conversation composer attachment/media control with type and 10 MB size validation. Upload storage, emoji/GIF/sticker providers, and moderation rules remain explicitly unconnected.


## Next-day build plan

1. Add private signed R2 downloads, upload finalization/cleanup jobs, and the full payment webhook receipt ledger.
2. Add typing indicators with a short-lived presence event, debounce/throttle protection, reduced-motion support, and an `aria-live` status.
3. Connect validated attachments to configured S3/R2 storage and define moderated emoji/GIF/sticker providers.
4. Run a responsive/accessibility pass at 360px, 768px, 1440px, and 200% zoom; fix heading order, focus states, touch targets, and footer overflow.
5. Configure deployment secrets and provider integrations through environment variables only: PostgreSQL, S3/R2, Razorpay, JWT, and CORS.
6. Run the complete creator, brand, editor, payment, admin, migration, and accessibility acceptance suite in CI.

## Release acceptance checklist

- [ ] A creator can sign up, complete a profile, add a package, and view the public profile.
- [ ] A brand can sign up, discover a creator, send a message, request a package, and view a pending booking.
- [ ] Both participants can view the same booking status history and authorized messages.
- [ ] An editor can create a gig, receive a request, upload a preview, handle revisions, and see payment status.
- [ ] A creator can create an invoice/payment link and see Draft, Sent, Paid, or Overdue state without escrow behavior.
- [x] Admin routes are server-authorized and operational.
- [ ] All required routes have intentional loading, empty, error, and success states.
- [ ] Backend tests, frontend production build, database migration checks, and accessibility checks pass in CI.

## Current launch blockers

- Frontend source type-checks. Local `next build` is blocked by a Windows `.next/trace` permission/lock issue; CI build still needs a clean-run verification.
- Backend source changes are not compiled locally because Maven is unavailable and Docker BuildKit cannot access its local state in this environment.
- Cloudinary production credentials or an alternate R2 endpoint still need to be supplied. Razorpay payment-link HTTP creation is implemented but requires real test/live keys.
- Production SMTP/Listmonk deployment, newsletter consent, unsubscribe handling, and subscriber synchronization remain open. Transactional email is now provider-agnostic: Mailpit locally, Resend, or the optional self-hosted Docker Mailserver overlay. Deliverability still requires domain DNS, reverse DNS, DKIM/SPF/DMARC, bounce handling, and monitoring.
- Backend Docker compilation was attempted but timed out during Docker/Maven image setup; rerun `docker compose build backend` in a working Docker environment.
