# Spring Boot to Cloudflare Workers migration plan

**Goal:** replace the Java/Spring backend with Workers-compatible services while keeping the Next.js app and its existing API behavior where practical. Target a zero Cloudflare bill within published free allowances. This is a substantial rewrite, not a way to run the Spring Boot binary on Workers.

## Current backend footprint

The repository has a Spring Boot 3.4 / Java 21 backend with roughly 14 domains: auth, users/profiles, organizations and RBAC, bookings, billing/invoices, messages, notifications, admin, and storage. It uses Spring Web/Security/JPA/Flyway, PostgreSQL, Redis, STOMP WebSockets, scheduled outbox jobs, mail, S3-compatible storage, Cloudinary, and UniBee/payment integrations. There are 33 Flyway migrations and about 23 domain tables.

The migration should start by freezing the HTTP and WebSocket contracts: route, request/response JSON, error shape, cookie names/flags, CSRF behavior, and webhook acknowledgements. Keep current REST routes and payloads where possible so the Next.js UI needs only a base URL change plus a small chat socket adapter.

## Free-tier target architecture

| Existing capability | Workers-compatible target | Migration notes |
| --- | --- | --- |
| Spring MVC / filters | TypeScript Worker API, preferably Hono | Port route by route; validate DTOs at the edge; return compatible status/error payloads. |
| PostgreSQL + JPA + Flyway | D1 SQLite, SQL migrations, explicit repository layer | Convert all 33 migrations and validate SQLite differences. D1 becomes canonical data store; no JPA portability shortcut. |
| STOMP simple broker | Durable Objects WebSocket hubs, one object per thread | Use native WebSocket messages for new client protocol; keep REST as canonical message write/history API. DO handles presence, typing, and fanout. |
| Redis counters / distributed lock | Durable Object counters and D1 conditional claims | Use DO for per-key atomic rate limits; D1 outbox claims for bounded jobs. Do not use KV for strict counters. |
| Redis-backed outbox polling | D1 outbox table + Cron Trigger | Idempotent claim, bounded batch, retry/backoff and dead-letter state in D1. Avoid paid Queues. |
| MinIO/S3 / upload metadata | R2 + D1 metadata | Worker authorizes upload/download and validates key ownership, size and content type. Run cleanup through Cron. |
| Spring Security / JWT | Worker middleware using Web Crypto-compatible JWT library | Preserve access/refresh semantics, HttpOnly/Secure/SameSite cookies and CSRF checks. Store revocation/session state in D1. |
| Spring Mail | No Cloudflare-free arbitrary-recipient mail path | Defer email-dependent flows or choose a separate provider with an explicitly verified free allowance. Never silently drop reset/verification emails. |
| UniBee / other payment providers | Keep provider adapters and webhook endpoints in Worker | Store credentials as Worker secrets; verify signatures and persist idempotency receipts in D1. Provider transaction fees remain external. |
| Scheduled Java jobs | Cron Triggers, plus DO Alarms where a per-object timer is needed | Make handlers idempotent and safe to retry. |

Keep the Next.js frontend wherever it is already hosted. The goal here only ports the backend; it does not require Vercel deployment. Point the app’s API configuration at the Worker origin and configure CORS/cookies for that origin.

## Free-plan constraints to design around

Cloudflare documents free allowances of up to 100,000 Worker requests/day, D1 5 GB total storage with 100,000 writes/day and 5 million rows read/day, and SQLite-backed Durable Objects 100,000 requests/day, 100,000 rows written/day, 5 million rows read/day, and a compute allowance. These are ceilings, not a promise of unlimited free service: on free plans, reaching limits can cause operations to fail until reset. Monitor usage and make overload visible.

R2 has a monthly free allowance; keep media volume and operations within the current published limits. Set upload limits and lifecycle/cleanup policies from the start.

**Email is the largest product constraint:** Cloudflare Email Sending is not available for arbitrary outbound recipients on Workers Free. Email verification, password reset, magic links and email notifications cannot be considered complete until a separate sender is selected or those flows are intentionally deferred. A separate provider may have a free tier, but it is outside the “Cloudflare only, guaranteed $0” promise and may change its limits.

Cloudflare Workers Free can host the API/realtime components only within free quotas. No Containers, paid Queues, paid Email Sending, or paid database plan is included. Payment processors, OAuth providers, Cloudinary or any retained third-party services may have their own terms or fees.

References: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [Email Sending pricing](https://developers.cloudflare.com/email-service/platform/pricing/).

## Migration sequence

### 0. Contract and feature inventory
- Capture all controller routes, DTOs, authorization rules, cookie/CSRF behavior, websocket destinations, webhook signature checks and job side effects.
- Mark features as core, external-provider dependent, or email-dependent.
- Record table relationships, uniqueness constraints, indexes and data volumes.
- Confirm password hash format and MFA secret handling before moving authentication data.

**Exit:** reviewed route/schema/behavior inventory and a written compatibility checklist.

### 1. Worker skeleton and security foundation
- Create a separate TypeScript Worker API package with local dev, Wrangler config and environment bindings for D1, DO and R2.
- Implement health/readiness, request IDs, CORS, validation, common errors, session/JWT middleware, CSRF, role/org authorization and audit logging.
- Preserve cookie names and attributes where safe; configure allowed frontend origins explicitly.
- Implement secrets only through Worker secret bindings, never checked into source.

**Exit:** auth/session primitives and health route work against local D1 without production credentials.

### 2. D1 schema and data migration
- Translate the 33 PostgreSQL migrations into ordered D1 SQL migrations. Replace PostgreSQL-specific types, sequences/identity, JSON operators, conflict clauses and partial indexes deliberately.
- Add a D1 schema version table and verify foreign keys, cascades, unique constraints and query plans.
- Build a one-time export/import tool for the 23 tables. Preserve IDs where feasible and validate row counts, relationships, nullability and representative records.
- Rehearse import on a disposable D1 database. Keep Spring/Postgres as the source of truth until cutover; do not dual-write.

**Exit:** repeatable import with reconciliation report and tested rollback point.

### 3. Core identity and marketplace workflows
Port in this order: users and profiles; organizations/memberships/RBAC; creator packages and discovery; booking/edit requests; invoices and tax rules; admin and moderation. Port permission checks explicitly—Spring annotations and service-level security will not carry over automatically.

Keep billing provider calls behind adapters. Preserve webhook signature validation, idempotency receipts and audit events. Test provider sandbox flows before switching webhook URLs.

**Exit:** core web flows pass against D1 with authorization and webhook idempotency confirmed.

### 4. Realtime messaging
- D1 remains the durable source for message history and message writes.
- Create a Durable Object per thread for WebSocket connections, presence, typing indicators and low-latency fanout.
- Replace the browser STOMP client with a small native WebSocket adapter and message envelope. Keep REST history/send routes initially; after parity, optionally send via socket through the same validation/service path.
- Authenticate socket upgrades with a short-lived realtime token, authorize thread membership before accepting, and enforce payload/rate limits.
- Store reactions/attachments as explicit D1/R2 records if they are part of the intended product contract; do not assume current chat supports them until inventory confirms it.

**Exit:** multiple clients see messages/typing live, reconnect safely, and cannot subscribe to another user’s thread.

### 5. R2 uploads and media
- Replace MinIO/S3 runtime assumptions with R2 bindings and signed/authorized Worker operations.
- Keep object metadata and ownership in D1; use random object keys and enforce file size/MIME rules server-side.
- Migrate existing objects in a resumable batch and verify object counts/checksums before switching reads.
- Add scheduled orphan cleanup and retention rules.

**Exit:** upload, preview/download, ownership denial and cleanup validated.

### 6. Outbox, notifications and scheduled work
- Port the outbox processor to Cron Trigger batches with atomic conditional claims, attempt counts, exponential backoff and idempotent handlers.
- Port storage cleanup to Cron. Keep retry state in D1; use DO Alarms only for per-object timing.
- Gate email-producing events until a real sender is configured. Keep in-app notifications working independently.

**Exit:** retry/restart simulation does not duplicate billing or notifications and cannot strand claimed events.

### 7. Cutover and rollback
- Rehearse full export/import and frontend configuration against a staging Worker.
- Freeze writes briefly, take final Postgres export, import and reconcile counts/checksums.
- Switch API origin and webhook destinations, monitor error rates, quota usage, auth failures, outbox lag and websocket disconnects.
- Keep the old backend and database read-only for the agreed rollback window. Roll back by switching the frontend/API and webhook origins; avoid reverse-sync complexity by not dual-writing.
- Decommission paid/runtime dependencies only after the rollback window and data retention checks.

**Exit:** production traffic is on Worker/D1, reconciliation is clean, and a practiced rollback remains available.

## Key risks and decisions

1. **This is a rewrite.** Spring/JPA/Security/STOMP/Redis/Spring Mail code cannot run unchanged on Workers. Plan for TypeScript implementations and contract-based parity.
2. **Auth migration needs special care.** Confirm BCrypt/Argon2 format, MFA encryption and refresh-token storage. Preserve hashes only if a compatible verifier is available; otherwise require a safe password reset path. Never export plaintext passwords.
3. **Strict $0 conflicts with email delivery.** Choose between deferring email-based auth/notifications or allowing a separately selected provider whose free limits are not guaranteed here.
4. **Free limits are finite and hard stops.** Capacity is suitable for a demo/low-volume launch, not an unlimited production promise. Add daily quota alerts and graceful 429/503 behavior.
5. **Relational port needs query redesign.** D1 is SQLite, not PostgreSQL; audit transaction boundaries, SQL features, sorting/pagination and concurrent booking/payment writes.
6. **Realtime uses two state systems.** D1 owns durable records; the DO owns live connections/transient state. Treat DO fanout as best effort and let reconnect/history catch clients up.
7. **External costs remain external.** Payment processing and any retained OAuth/media/email providers are not made free by moving the API.

## Recommended first implementation milestone

Build only the Worker skeleton, D1 schema for auth/users/conversations/messages, and one thread Durable Object. Validate a complete demo loop—sign in, open a thread, send and receive live messages, reload history—before porting marketplace, admin and payment modules. This proves the free-tier architecture before the larger rewrite proceeds.


## Implementation checkpoint (local code only)

Started the recommended chat milestone in this repository:

- Added a separate TypeScript Worker package under `weave-worker/`, with local D1 migrations and a thread Durable Object.
- Added chat API routes for inbox/history/send, the current user and booking context, participant-checked file upload/download, and persistent emoji reactions.
- Configured R2 binding for attachments with a 10 MB cap and an explicit MIME allowlist.
- Switched the conversation UI from STOMP to native WebSockets and added a separate `NEXT_PUBLIC_CHAT_API_URL` so Spring can continue handling sign-in and refresh during this phase.
- Changed Spring's realtime token endpoint to issue five-minute, purpose-bound tokens; the Worker only accepts those on socket upgrade routes.
- Added local setup instructions. No remote Cloudflare resources were created and no deployment was run.

This is the first vertical slice, not a completed backend migration. It expects imported user, booking and message data in D1; production also needs a compatible auth-cookie hostname and prepared D1/R2 resources. Notifications, full schema conversion/import tooling, all remaining Spring domains, quota monitoring and cutover/rollback remain before a production cutover. Chat should use the Worker API only after local D1 data has been seeded/imported and the Worker is running.
