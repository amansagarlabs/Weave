# AUTH_STRATEGY.md — Weave

## Decision
- **Core session/authorization: existing Spring Security + JWT (stateless)** — unchanged, already built.
- **Phone OTP provider: MSG91**
- **Social login: not in MVP** — revisit only if user research shows real demand.

## Why MSG91 over alternatives

| Option | Verdict | Reason |
|---|---|---|
| **MSG91** (chosen) | ✅ | India-focused, DLT-registered (required for compliant Indian SMS delivery), plain REST API, ~₹0.15–0.20/SMS, no foreign vendor dependency, keeps Weave's own JWT as the single source of truth |
| Firebase Auth | Considered | Free tier generous, phone OTP + Google sign-in bundled, easy Next.js SDK — but introduces a second token system (Firebase ID token + your JWT) and a Google dependency not needed for an India-first, non-Google-ecosystem product |
| AWS Cognito | Rejected | Overkill for this scale, steeper setup, pricing less predictable for SMS OTP in India |
| Auth0/Clerk | Rejected | General-purpose, pricier at scale, no particular India-market advantage over MSG91 for OTP specifically |
| Twilio Verify | Considered | Reliable, but per-SMS cost to India numbers is generally higher than MSG91, and DLT registration handling is less India-native |

## Integration flow
1. Frontend collects phone number → calls `weave-backend` `/auth/otp/send`
2. Backend (`com.weave.auth`) calls MSG91 send-OTP API
3. User submits received code → frontend calls `/auth/otp/verify`
4. Backend calls MSG91 verify API → on success, issues Weave's own JWT (existing flow, unchanged downstream)
5. Existing email/password flow stays as an alternate entry path — do not remove

## Environment variables required
- `MSG91_AUTH_KEY`
- `MSG91_TEMPLATE_ID` (DLT-approved OTP template)
- `MSG91_SENDER_ID`

Store via environment variables only, per `TRD.md` config convention — never hardcoded.

## Explicitly out of scope for MVP
- Google/social OAuth login
- Multi-factor authentication beyond OTP-as-primary-factor
- Session management across multiple devices (single active JWT is sufficient for v1)

## Open item
- Rate limiting on `/auth/otp/send` is required before production (already flagged in `REMAINING.md` under Backend and infrastructure remaining) — prevents SMS-bombing abuse and cost blowout.

---

# MESSAGING SECURITY HARDENING

**Scope:** Security-only pass on the messaging subsystem. No new features, no UI changes beyond what security requires.

## Threat Model — What We Are Defending Against

| # | Threat | Category |
|---|---|---|
| 1 | User A reads User B's messages | Horizontal privilege escalation |
| 2 | Brand reads Creator↔Editor private thread | Cross-role leakage |
| 3 | Unauthenticated WebSocket subscription to any topic | Broken access control |
| 4 | Replaying a stolen STOMP token to subscribe to another user's topics | Token replay |
| 5 | Enumerating thread IDs to probe other users' conversations | ID enumeration |
| 6 | Injecting messages into a thread the attacker is not part of | Message injection |
| 7 | XSS via unsanitized message body stored and reflected | Stored XSS |
| 8 | Mass message scraping via REST (rate limit bypass) | Abuse |
| 9 | Admin reading user messages without audit trail | Privileged access abuse |

## Current State Assessment

### Confirmed already closed
- **Auth audit ledger** exists (`auth_audit_events` table, V28 migration) — covers authentication events, not message access.
- **Admin audit ledger** exists (`admin_audit_events` table, V23 migration) — covers admin operations, not message access.
- **Redis-backed rate limiting** exists (`RateLimitingFilter`) — covers `/messages` endpoints at 60 req/min (MESSAGES category). Key: `user:<email>` for authenticated, `ip:<addr>` for anonymous.
- **STOMP auth interceptor** (`StompAuthChannelInterceptor`) validates JWT on CONNECT, authorizes `/topic/threads/{id}` SUBSCRIBE frames.
- **Participant check** exists in `MessageService.authorizeThread()` — called from STOMP SUBSCRIBE interceptor and typing handler.
- **STOMP token** issues short-lived JWT via `POST /auth/realtime-token` — token contains `sub` (email) and `role` claim.

### Confirmed gaps (to fix in this pass)
1. **No message body sanitization** — `MessageService.send()` only trims whitespace. HTML tags stored and reflected. No jsoup in pom.xml.
2. **No message body length limit** — `CreateMessageRequest.body` has `@NotBlank` but no `@Size(max=...)`. DB column is `VARCHAR(5000)`.
3. **Inbox query filters in Java, not SQL** — `findBySenderIdOrRecipientIdOrderByCreatedAtDesc` returns all message rows, deduplication by `threadId` happens in Java. No `LIMIT`.
4. **Thread IDs are free-form strings** — client supplies `threadId` via `CreateMessageRequest`. No UUID enforcement. `booking-{id}` prefix is guessable.
5. **No dedicated subscription interceptor** — `StompAuthChannelInterceptor` only checks `/topic/threads/{id}` SUBSCRIBE. Does NOT check `/topic/thread/{id}/typing` or `/topic/user/{id}/inbox`. Any authenticated STOMP user can subscribe to any user's inbox topic.
6. **STOMP token does not embed userId** — token has `sub` (email) and `role`. The interceptor resolves email→userId via DB lookup on every CONNECT, which is correct but adds latency. No session binding.
7. **No message access audit trail** — admin message access is not logged.
8. **`MessageService.send()` broadcasts after STOMP connect but not from REST path** — fixed in the prior session (broadcast added to `MessageService.send()`), but needs verification.
9. **REST message endpoints are not participant-scoped at the query level** — `inbox()` loads all user messages and filters in Java.

## Security Fixes — Implementation Plan

### Fix 1: Message body sanitization (backend, on WRITE)

**File:** `MessageService.java`

Add a `sanitize()` method that strips HTML tags using `String.replaceAll` (no jsoup dependency — it is not in pom.xml and should not be added):

```java
private String sanitize(String body) {
    if (body == null) return null;
    return body
        .replaceAll("<[^>]*>", "")   // strip all HTML tags
        .replaceAll("&", "&amp;")    // encode ampersands
        .replaceAll("<", "&lt;")     // encode remaining < (belt-and-suspenders)
        .replaceAll(">", "&gt;")     // encode remaining >
        .trim();
}
```

Call `sanitize()` before `Message.create()` in `MessageService.send()`.

**Max length:** Add `@Size(max = 4000)` to `CreateMessageRequest.body`. Reject with 400 if exceeded. Update DB column from `VARCHAR(5000)` to `VARCHAR(4000)` via Flyway migration (V34).

### Fix 2: Dedicated subscription interceptor

**New file:** `MessageSubscriptionInterceptor.java` in `com.weave.message.security`

Validates every STOMP SUBSCRIBE frame:
- `/topic/threads/{threadId}` — must be participant (reuse `MessageService.authorizeThread()`)
- `/topic/thread/{threadId}/typing` — must be participant
- `/topic/user/{userId}/inbox` — must be the same user (userId from Principal, not from payload)
- Any other `/topic/` subscription — blocked

Register in `WebSocketConfig.configureClientInboundChannel()` alongside existing `StompAuthChannelInterceptor`.

### Fix 3: Inbox query — DB-level filtering

**File:** `MessageRepository.java`

Replace the Java-dedup approach with a proper query:

```java
@Query("""
    SELECT m FROM Message m
    WHERE m.id IN (
        SELECT MAX(m2.id) FROM Message m2
        WHERE m2.senderId = :userId OR m2.recipientId = :userId
        GROUP BY m2.threadId
    )
    ORDER BY m.createdAt DESC
    """)
List<Message> findLatestPerThread(@Param("userId") Long userId);
```

This returns only the latest message per thread at the SQL level, no Java dedup needed. Add `LIMIT` via `Pageable` if needed.

### Fix 4: Thread ID validation

**File:** `CreateMessageRequest.java`

Add thread ID format validation:
- Must be non-blank, max 120 chars (existing DB constraint)
- Must match `^[a-zA-Z0-9_-]+$` (alphanumeric, hyphens, underscores only)
- `booking-{id}` prefix: validate `id` is a positive long

This prevents injection of path-like or topic-prefix thread IDs.

### Fix 5: Admin message access audit trail

**Reuse existing:** `AdminAuditEvent` entity and `AdminAuditService` (V23 migration).

When an admin reads a message thread (if such an endpoint exists or is added later), log:
- `adminUserId`, `action = "MESSAGE_THREAD_READ"`, `targetType = "THREAD"`, `targetId = threadId`, `details = { participantCount }`

No new entity needed — extend `AdminAuditService.record()` calls.

### Fix 6: STOMP token session binding (optional hardening)

**Current behavior:** STOMP token is a short-lived JWT (email + role). On CONNECT, `StompAuthChannelInterceptor` extracts email, loads UserDetails, sets Principal. Token is not bound to a specific WebSocket session.

**Recommendation:** Accept current behavior for MVP. The token is already short-lived (issued on-demand via `POST /auth/realtime-token`), and the interceptor validates on every CONNECT. Full session binding (ConcurrentHashMap sessionId→userId, evict on DISCONNECT) is production hardening, not MVP-critical.

### Fix 7: Frontend — never trust URL for authorization

**File:** `message-thread.tsx`

Current behavior: `threadId` comes from `useParams()`. The component loads messages via `GET /messages/{threadId}` — if the user is not a participant, the backend returns 403 and the component shows an error.

**Verification needed:** Confirm the 403 path works and redirects appropriately. No code change expected — the existing backend participant check is the authorization boundary.

### Fix 8: Frontend — plain text rendering

**File:** `message-thread.tsx`

Current behavior: `<p>{message.body}</p>` — React auto-escapes. No `dangerouslySetInnerHTML`.

**Verification needed:** Static analysis confirm no `dangerouslySetInnerHTML` in message rendering. No code change expected.

### Fix 9: STOMP reconnect — fresh token

**File:** `message-thread.tsx`

Current behavior: On reconnect, the `connect()` function calls `api<{ token: string }>("/auth/realtime-token", { method: "POST" })` — fetches a fresh token every time. Token is not cached in state.

**Verification needed:** Confirm the reconnect path always fetches fresh. No code change expected — the current implementation already does this correctly.

## Files Changed (planned)

| File | Change |
|---|---|
| `MessageService.java` | Add `sanitize()` method, call before `Message.create()`, enforce 4000 char limit |
| `CreateMessageRequest.java` | Add `@Size(max = 4000)` on `body`, add thread ID format regex |
| `MessageRepository.java` | Add `findLatestPerThread()` query for inbox |
| `MessageSubscriptionInterceptor.java` | **New** — STOMP SUBSCRIBE authorization for all topic patterns |
| `WebSocketConfig.java` | Register `MessageSubscriptionInterceptor` |
| `V34__message_body_limit.sql` | **New** — ALTER COLUMN body to VARCHAR(4000) |
| `admin-audit` integration | Extend existing `AdminAuditService` for message thread reads |

## Security Gaps — Confirmed Already Closed

| Gap | Evidence |
|---|---|
| Unauthenticated STOMP connection | `StompAuthChannelInterceptor` validates JWT on CONNECT (line 32-42) |
| STOMP subscription to `/topic/threads/{id}` without auth | `StompAuthChannelInterceptor` SUBSCRIBE check (line 43-48) |
| REST message endpoints unauthenticated | Spring Security `anyRequest().authenticated()` + RBAC `@PreAuthorize` |
| Rate limiting on message REST endpoints | `RateLimitingFilter` maps `/messages` → MESSAGES category (60 req/min) |
| Typing indicator spam | 400ms ConcurrentHashMap debounce in `RealtimeMessageController` |
| Password/OTP brute force | AUTH category rate limiting (10 req/min per IP) |
| JWT revocation on logout | Refresh token deletion + cookie clearing |

## Remaining Risks (accepted or out of scope)

| Risk | Status |
|---|---|
| E2E encryption | Out of scope — platform threat model does not require it |
| Message deletion / edit | Not in MVP feature set |
| File attachment XSS (images, PDFs) | Attachment upload not connected to messaging yet |
| WebSocket rate limiting (STOMP frames) | Servlet filter does not cover WS — typing debounce is the only protection. Accept for MVP. |
| Thread ID enumeration via `booking-{id}` | Partially mitigated by participant check. Full mitigation requires UUID thread IDs — deferred. |
| Cross-role thread access (Brand reads Creator↔Editor) | Mitigated by participant check — threads are bilateral. No group threads exist. |

## Tests to Add

### Backend — `MessageSecurityTest`
- `nonParticipantCannotReadThread` — GET `/messages/{threadId}` → 403
- `nonParticipantCannotSendToThread` — POST `/messages` → 403
- `nonParticipantStompSubscriptionRejected` — STOMP SUBSCRIBE to `/topic/threads/{id}` → error
- `userCannotSubscribeToAnotherUsersInbox` — STOMP SUBSCRIBE to `/topic/user/{otherId}/inbox` → error
- `messageBodySanitizesHtmlTags` — send `<script>alert(1)</script>` → stored as plain text
- `messageBodyRejectsOver4000Chars` — POST with 4001-char body → 400
- `inboxQueryOnlyReturnsOwnThreads` — verify SQL-level filtering

### Frontend (if Playwright/Jest exists)
- `dangerouslySetInnerHTML is not used in message rendering` — static analysis
- `STOMP reconnect fetches fresh token` — mock `/auth/realtime-token`
