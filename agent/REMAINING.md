# Weave — Remaining Work

Updated: 2026-08-13

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
- [x] Public help search/accordion and notifications interactions exist.
- [x] Watermark copy clearly states that screenshots and screen recordings cannot technically be prevented.
- [x] Payment copy uses payment links/status and does not promise escrow or fund holding.
- [x] Frontend production build passes all currently registered routes.

### Important verification note

- [ ] Backend Maven tests are still unverified in this environment because `mvn` is not available on PATH and no Maven wrapper is currently present.
- [ ] Frontend route count is broader than the sitemap because package edit/new, portfolio upload, and other nested routes are also registered. Reconcile the sitemap count before release.

## Highest-priority remaining work

### 1. Finish authentication and authorization

- [ ] Add protected-route handling in the frontend. Redirect unauthenticated users away from workspace routes.
- [ ] Validate the JWT role on the backend for every domain endpoint, not only inside selected services.
- [ ] Add a current-user endpoint and use the real user ID in frontend message rendering and message requests.
- [ ] Replace the hardcoded message recipient fallback in `components/message-thread.tsx` with the actual conversation participant.
- [ ] Add logout, token expiry handling, and a consistent unauthorized state.
- [ ] Add backend tests for signup, login, duplicate email, invalid JWT, and role restrictions.

### 2. Complete creator profile and package management

- [ ] Add `GET /creator/profile/me` so profile edit loads existing values.
- [ ] Change profile save from always-create behavior to update/upsert behavior.
- [ ] Validate unique public slugs with a clear field-level error.
- [ ] Add backend package repository, DTOs, service, and controller.
- [ ] Connect `/creator/packages`, `/creator/packages/new`, and `/creator/packages/edit` to real package CRUD.
- [ ] Add archive, duplicate, reorder, and owner authorization for packages.
- [ ] Add creator portfolio storage metadata and upload flow using S3/R2 later; keep local/mock upload state until storage credentials are configured.

### 3. Finish brand profiles and booking workflow

- [ ] Add brand profile DTOs, repository, service, controller, and migration if needed.
- [ ] Connect `/brand/onboarding` and `/brand/settings` to persisted brand data.
- [ ] Validate that the requested creator exists and has a creator role before creating a booking.
- [ ] Validate optional `packageId` ownership and amount against the selected package.
- [ ] Add booking detail endpoint `GET /bookings/{id}` with participant authorization.
- [ ] Add status transition endpoints with the approved states: Pending, Negotiating, Accepted, Content Delivered, Paid.
- [ ] Persist and return status history for the booking timeline.
- [ ] Replace placeholder booking detail pages with live API data and next-action controls.

### 4. Build editor domain APIs and UI

- [ ] Add editor profile DTOs, repository, service, controller, and save/load endpoints.
- [ ] Add editor gig/package persistence and connect `/editor/gigs`, `/editor/gigs/new`, and `/editor/gigs/edit`.
- [ ] Add edit-request creation, list, detail, status, revision-count, and preview metadata endpoints.
- [ ] Enforce the three-revision cap in backend validation.
- [ ] Keep editor suspension behavior as a placeholder with the comment `pending founder sign-off`; do not invent trigger logic.
- [ ] Connect creator hire-editor and editor request pages to real editor data.
- [ ] Add upload-state UI for preview and final asset metadata; integrate S3/R2 only after storage configuration is available.

### 5. Implement payments and invoices safely

- [ ] Add invoice entity, migration, repository, DTOs, service, and controller.
- [ ] Add Razorpay Java SDK integration behind a service interface.
- [ ] Implement payment-link/pass-through flow only; do not hold funds or build escrow.
- [ ] Add webhook signature verification and idempotent payment-status updates.
- [ ] Implement invoice states: Draft, Sent, Paid, Overdue.
- [ ] Connect creator earnings/invoice screens and brand booking payment status to the API.
- [ ] Add explicit error and retry states for failed payment-link creation and webhook processing.

### 6. Complete messaging

- [ ] Add conversation/thread persistence or a thread query that returns participants and context.
- [ ] Add participant authorization to `GET /messages/{threadId}`.
- [ ] Add inbox endpoint with unread counts and latest-message preview.
- [ ] Connect creator and brand inbox pages to live threads instead of empty-state-only UI.
- [ ] Add booking/package context to message threads.
- [ ] Add send failure retry and optimistic/pending message states.

### 7. Complete admin and support surfaces

- [ ] Add admin-only backend endpoints for users, disputes, flags, taxonomy, and editable content.
- [ ] Enforce `ADMIN` role server-side; the admin UI must not use a normal brand shell as its authorization boundary.
- [ ] Replace placeholder admin rows with loading, error, pagination, filtering, and safe action states.
- [ ] Add confirmation dialogs for destructive admin actions.
- [ ] Add content preview and publish confirmation for compliance copy and category labels.
- [ ] Connect notifications to persisted events instead of sample in-memory notifications.

## Frontend quality work remaining

- [ ] Add loading and error files/states for important App Router segments.
- [ ] Add `aria-current` and active-route styling to desktop and mobile navigation.
- [ ] Replace raw `<a>` links inside workspace pages with Next `Link` where appropriate.
- [ ] Add a real modal/dialog primitive with Escape handling, focus trap, and focus restoration for ASCI/disclosure steps and confirmations.
- [ ] Add a reusable file-dropzone component with progress, failure recovery, and keyboard operation.
- [ ] Add a reusable select, currency field, tag input, and payment-state component.
- [ ] Move visible copy into an i18n-ready message map as required by the design system.
- [ ] Add a skip link and ensure every page has one logical `h1`.
- [ ] Test keyboard navigation, 360px layout, 768px layout, 1440px layout, and 200% zoom.
- [ ] Add automated accessibility checks and component examples for primary, hover, focus, disabled, loading, and error states.
- [ ] Replace sample creator metrics and copy with backend-backed values; never display invented influence scores.

## Backend and infrastructure remaining

- [ ] Add Maven Wrapper or document the required Maven installation so builds are reproducible.
- [ ] Add JUnit 5 and Mockito tests for every service and controller authorization path.
- [ ] Add Testcontainers PostgreSQL integration tests for Flyway migrations and repositories.
- [ ] Add database indexes for public slug, creator category discovery, booking participants, and message threads.
- [ ] Add request validation and consistent API error envelopes for all domains.
- [ ] Add structured logging, correlation IDs, and safe production error messages.
- [ ] Add Docker Compose development verification for PostgreSQL, backend, and frontend.
- [ ] Add GitHub Actions workflows for backend tests, frontend build, and security/dependency checks.
- [ ] Configure S3/R2, Razorpay, JWT secret, database credentials, and CORS through environment variables only.
- [ ] Add rate limiting and abuse protection for auth, messages, discovery, and payment-link endpoints.

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
