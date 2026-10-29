# AGENT_CONTEXT.md
*Read this first. This file orients any AI coding agent (or human developer) working in this codebase.*

---

## What this project is
A web platform giving Indian micro-influencers (1K–100K followers) tools to manage their own brand-deal operations: deal tracking, rate benchmarking, GST/TDS-compliant invoicing, and a shareable media kit. **This is explicitly NOT a brand-browse marketplace** — do not build discovery/directory features where brands search a list of creators; the product differentiator is that creators own and control their own operations layer.

## Document map — read in this order
1. **`PRD.md`** — what we're building and why; personas, goals, user stories
2. **`SCOPE.md`** — the authoritative in/out-of-scope list by phase. **When unsure whether to build something, check this file, not your own judgment about what seems useful.**
3. **`TRD.md`** — technical architecture, data model, API shape, integration details, compliance/tax logic
4. **`DESIGN.md`** — screens, user flows, empty states, component/design-token approach
5. **`product-spec-mvp.md`** — granular per-feature functional spec (field-level detail)
6. **`startup-brainstorm-creator-platform.md`** — full research and reasoning history; consult only if you need *why* a decision was made, not for feature requirements (SCOPE.md and TRD.md are authoritative for that)

## Build order (do not build out of sequence)
Follow the sprint order in `product-spec-mvp.md` Section 9 / `SCOPE.md` Phase 1 list:
1. Auth + role-based onboarding
2. Deal tracker (manual entry)
3. Invoice generator (UniBee checkout + GST/TDS fields)
4. ASCI disclosure checklist (static content)
5. Media kit page
6. Deal history/CRM view
7. Rate benchmarking (seeded data)

**Do not build Phase 1.5 or Phase 2 features (Editor module, Brand DM/filter module, Creator-matching, leaderboard) unless explicitly instructed — these require founder decisions documented as open questions in `TRD.md` Section 10 and `SCOPE.md`.**

## Hard constraints — do not violate these regardless of what seems like a good idea mid-build
- **No AI content-scanning** for the ASCI compliance feature — it's a static checklist by design (see `PRD.md` Non-Goals, `TRD.md` Section 9). Do not "improve" this into an AI feature without explicit instruction.
- **No true screenshot/screen-recording prevention** — not technically achievable on iOS/Android. If building the Editor module later, implement watermarking + best-effort detection only, and say so clearly in any UI copy (don't overpromise "screenshot-proof" to users).
- **No payment escrow / fund-holding** — this requires payment aggregator licensing in India. Invoicing + UniBee hosted checkout only; Weave never holds funds.
- **Tax/compliance logic must be config-driven, not hardcoded** — GST rate, TDS thresholds, and disclosure text all change over time and must live in editable config/CMS tables, not embedded in application logic (`TRD.md` Section 6).
- **i18n-ready from day one** — all user-facing copy externalized into translatable strings, even though only English ships in v1 (`DESIGN.md` Section 7). Retrofitting this later is expensive; don't hardcode strings in components now.

## Category taxonomy (use exactly this list, everywhere)
`All, Tech, Fashion, Lifestyle, Gaming, Fitness, Travel, Beauty` (+ extendable niche sub-tags)

## When something is ambiguous
1. Check `SCOPE.md` first — is it explicitly in or out for the current phase?
2. Check `TRD.md` Section 10 / `SCOPE.md` open-questions sections — is this a flagged founder decision? If so, stop and surface the question rather than assuming an answer.
3. If genuinely unspecified and low-risk (e.g., a UI copy choice), make a reasonable choice consistent with `DESIGN.md` principles and proceed — don't block on trivial decisions.

## Definition of done for Phase 1 (MVP)
A creator can, without any manual intervention from the founding team: sign up → complete profile → log a deal → mark it ready to post (see disclosure checklist) → generate a GST/TDS-compliant invoice → send a UniBee checkout → reconcile the UniBee webhook → see it reflected in their deal history and media-kit credibility snapshot. This end-to-end loop is the MVP exit criteria (`SCOPE.md`).
