# SCOPE — Creator Operations Platform (India MVP)

---

## Purpose
This document is the single source of truth for what is IN and OUT of scope at each phase. When in doubt during development, this document overrides feature enthusiasm — if it's not listed as in-scope for the current phase, it does not get built yet.

---

## Phase 1 — MVP (Build Now)

**In scope:**
- Role-based onboarding (Brand / Creator selection, separate UI per role)
- Deal Tracker (manual entry only)
- Rate Benchmarking (seeded from public data, not live model)
- GST/TDS-compliant provider-neutral Invoice Generator
- GST-threshold running tracker
- Deal History / CRM view (including renewal nudges)
- ASCI Disclosure Checklist (static content, triggered at "ready to post" step)
- Creator Media Kit / Rate Card public page

**Out of scope for Phase 1:**
- WhatsApp integration (deal import, reminders)
- E-signature for contracts
- Editor role / Creator↔Editor collaboration module
- Brand↔Creator direct messaging or filtering
- Creator↔Creator collab matching
- Public trending leaderboard
- AI-trained rate-benchmarking model (seeded lookup table only)
- Payment escrow (fund holding)
- Non-English UI (i18n-ready architecture yes; translated content no)

**Exit criteria to move to Phase 1.5:** A creator can complete the full loop — sign up, log a deal, generate a compliant invoice, get paid, see it reflected in their CRM/media-kit credibility snapshot — without manual intervention from the founding team.

---

## Phase 1.5 — Evaluate Before Committing Engineering Time

These are validated ideas but require an explicit founder decision before building (see open questions below each):

**Creator ↔ Editor Collaboration Module**
- Revision workflow (3-4 rounds), watermarked previews, payment-gated download, editor suspension logic
- **Do not build until:** editor-suspension trigger is precisely defined by founders (Section 6 of TRD)
- **Do not build:** true screenshot/screen-recording prevention — not technically achievable; scope is watermarking + detection-where-available only

**Brand ↔ Creator Direct Collaboration Module**
- Brand-initiated DMs, creator filtering by views/"influencing score"
- **Do not build until:** "influencing score" is defined, and founders confirm this won't cannibalize the "not a marketplace" positioning that differentiates Phase 1
- **Recommended scope if built:** feature bundled into existing creator accounts (opt-in visibility to brands), not a standalone public directory

---

## Phase 2 — Post-Launch, Post User-Base

**In scope once Phase 1 exit criteria are met:**
- Creator ↔ Creator Collaboration Matching (reuses category taxonomy + deal-history data already collected)
- Public Trending Leaderboard (growth/lead-gen mechanism)
- Free public tools: engagement rate calculator, earnings estimator

**Rationale for sequencing:** both depend on having real user data/volume to be credible (matching needs enough creators to match against; leaderboard needs enough ranked entries to look alive, not empty).

---

## Permanent Non-Goals (Not Planned for Any Phase Unless Strategy Changes)
- Becoming a brand-browse marketplace/directory competing directly with Qoruz/Kofluence/CollabMarket/GetCollab — the product's core differentiation is that creators own their operations layer, not that brands discover creators through us
- AI content-scanning for compliance — checklist-based by design, to stay simple and avoid false-positive risk
- Becoming a licensed payment aggregator / holding funds in escrow — unless a specific founder decision reverses this, informed by legal/compliance review

---

## Category Taxonomy (Applies Across All Phases)
All, Tech, Fashion, Lifestyle, Gaming, Fitness, Travel, Beauty (+ extendable niche sub-tags such as Wedding, Ethnic Wear, Pets)

## Geographic Scope
- Phase 1: India only (INR currency, India tax compliance, India payment rails)
- Post-validation: global expansion via currency/localization layer (architecture should not block this, but no international launch work happens until Phase 1 is validated)
