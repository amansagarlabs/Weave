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
- Rate limiting on `/auth/otp/send` is required before production (already flagged in `WEAVE_REMAINING_WORK.md` under Backend and infrastructure remaining) — prevents SMS-bombing abuse and cost blowout.