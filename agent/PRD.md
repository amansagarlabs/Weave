# PRD — Creator Operations Platform (India MVP)

---

## 1. Product Vision
A platform that gives micro-influencers (1K–100K followers) professional-grade operations tooling — deal tracking, fair-rate benchmarking, compliant invoicing, and a credible media kit — that today only exists (poorly) as spreadsheets, WhatsApp chats, and screenshots. India-first, global-ready.

**Motto:** Mutual self-protection, with 100% transparency to the audience. The platform protects the creator legally, proves authenticity to the brand, and keeps the audience honestly informed — no existing competitor serves all three.

## 2. Problem Statement
Micro-influencers operate brand deals with zero infrastructure: pitches live in DMs, rates are guessed or lowballed, invoices are hand-made, payment is chased manually, and there's no compliance safety net (ASCI disclosure rules) or record of past work. Existing platforms (Qoruz, Kofluence, Winkl, CollabMarket, GetCollab, etc.) all serve the **brand's** side of discovery — none serve the creator's own operations.

## 3. Target Users (Personas)

**Primary: The Micro-Influencer ("Priya")**
- 1K–100K followers, India-based, works with 2-10 brands/quarter
- Manages everything manually today; doesn't know if she's charging fairly; has been paid late or not at all at least once
- Wants to look and operate professionally without hiring an agent (who only take top-tier creators anyway)

**Secondary: The Brand/Marketer ("Rohan")**
- Runs influencer campaigns for a D2C brand or agency
- Wants confidence a creator's numbers are real and a smooth, professional deal process
- Not the primary paying customer in Phase 1 — served indirectly via the creator's polished media kit

**Phase 1.5: The Editor**
- Freelance reels/photo editor who works for creators
- Wants fair payment guarantees and a clear revision process

## 4. Goals & Success Metrics (v1)
- **Activation:** creator completes profile + logs first deal within first session
- **Core value proof:** creator generates and sends their first GST/TDS-compliant invoice through the platform
- **Retention signal:** creator returns to log a second deal within 30 days
- **Leading indicator for Phase 2:** % of creators who share their media-kit link externally

*(Numeric targets to be set once early user cohort is live — do not hardcode conversion assumptions pre-launch.)*

## 5. User Stories (MVP)

**Onboarding**
- As a new user, I select my role (Brand/Creator) before anything else, and see a UI built for that role.
- As a creator, I set up my profile with category, platforms, follower counts, city, and content language.

**Deal Management**
- As a creator, I log a brand pitch with rate, status, and notes, so I stop losing track of deals in DMs.
- As a creator, when marking content ready to post, I see a disclosure checklist so I don't accidentally violate ASCI rules.

**Rate Confidence**
- As a creator, I see a suggested fair rate range for a deal based on my category, followers, engagement, and city tier, so I don't get lowballed.

**Getting Paid**
- As a creator, I generate a GST/TDS-compliant invoice in a few clicks and send it to the brand.
- As a creator, I get notified when I'm approaching the ₹20L GST threshold.
- As a creator, unpaid invoices auto-remind the brand so I don't have to chase manually.

**Credibility**
- As a creator, I have a shareable media kit page showing my stats, rate card, and track record (on-time delivery %, repeat brands), which I send directly to brands.

## 6. Feature Scope
See `SCOPE.md` for the full in/out breakdown by phase. Full functional detail for each feature lives in `product-spec-mvp.md` (dev-ready feature spec) and `TRD.md` (technical implementation).

**Phase 1 (MVP):** Role-based onboarding, deal tracker, rate benchmarking (seeded), GST/TDS invoice generator, deal history/CRM, ASCI disclosure checklist, media kit page.

**Phase 1.5 (evaluate before build):** Creator↔Editor collaboration module, Brand↔Creator direct messaging/filtering.

**Phase 2 (post-launch):** Creator↔Creator collab matching, public trending leaderboard, free lead-gen tools.

## 7. Non-Goals (Explicitly Out of Scope for v1)
- Not a brand-browse marketplace/directory (deliberate — see competitive positioning in `startup-brainstorm-creator-platform.md` Section 2A)
- Not a payments escrow company (regulatory overhead deferred — see open decision in TRD)
- Not building AI content-scanning for compliance (static checklist only)
- Not attempting true screenshot/screen-recording prevention (not OS-enforceable; watermarking instead)

## 8. Assumptions & Risks
- **Cold-start risk on rate benchmarking:** mitigated by seeding with published industry rate-card data before real usage data exists
- **Regulatory risk:** GST/TDS rules change; tax logic must be a configurable rules layer, not hardcoded (see TRD)
- **Adoption risk:** value only proven once a creator completes the full loop (log deal → invoice → paid); onboarding must get users to this point fast

## 9. Related Documents
- `SCOPE.md` — phase boundaries and in/out-of-scope detail
- `TRD.md` — technical architecture, data model, integrations
- `DESIGN.md` — screens, flows, design system
- `AGENT_CONTEXT.md` — instructions for AI coding agents working in this codebase
- `product-spec-mvp.md` — granular feature spec
- `startup-brainstorm-creator-platform.md` — full research/reasoning history