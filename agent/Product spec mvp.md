# Product Spec — Creator Operations Platform (India MVP)
*Dev handoff spec — companion to `startup-brainstorm-creator-platform.md` (full context/reasoning doc)*

---

## 1. Product Overview
A platform for micro-influencers (1K–100K followers) in India to manage their own brand-deal operations — deal tracking, rate benchmarking, GST/TDS-compliant invoicing, and a shareable professional media kit. Launch: India-first (web app, mobile-responsive). Expansion: global, post-validation.

**Not a brand-browse marketplace.** Creators own their data and storefront; the tool is not a directory brands search through.

---

## 2. User Roles & Onboarding
- On sign-up, user selects role first: **Brand** or **Creator** (later: **Editor**, see Section 4.1)
- Each role gets a distinct UI/dashboard post-selection — do not share a generic dashboard across roles
- **Creator profile fields:** name, category/niche (see Section 8 taxonomy), platform(s) + handles, follower count(s), city/location, primary content language, availability status
- **Brand profile fields:** company name, industry, GSTIN (optional at signup, required before invoicing flows)

---

## 3. Core MVP Features (Phase 1 — Build First)

### 3.1 Deal Tracker (Deal Inbox)
- Manual entry for v1 (no WhatsApp/email auto-import yet)
- Fields: brand name, deal type (reel/story/post/video/etc.), proposed rate, status (pending → negotiating → accepted → content delivered → paid), notes, key dates
- Status changes should be loggable with timestamp (feeds Section 3.4 CRM history)

### 3.2 Rate Benchmarking (lightweight v1)
- Inputs: category, follower count, engagement rate, platform, city tier, content language
- Output: suggested rate range
- Data source for v1: seeded from publicly available industry rate-card reports (not live user data yet — insufficient volume at launch)
- Design for future replacement of seed data with real aggregated user data as volume grows

### 3.3 Contract + Invoice Generator
- GST-compliant invoice fields: GSTIN (creator + brand), SAC code, place of supply, CGST/SGST/IGST breakup
- TDS-aware net-payable calculation (Section 194R / 194J logic — see Section 6 for compliance notes)
- Running-total tracker that flags creator as they approach the ₹20L GST registration threshold
- Auto payment-follow-up reminders for unpaid invoices
- Payment collection via Razorpay (UPI/payment links)

### 3.4 Deal History / CRM
- Table/list view: brand worked with, rate charged, deal date, payment status, payment timeliness
- Renewal nudge: simple notification after X months of inactivity with a given brand (default: 3 months, configurable)

### 3.5 ASCI Disclosure Checklist
- Static, content-only feature (no AI/content scanning)
- Triggered at the "mark content ready to post" step in the deal tracker
- Shows platform-specific disclosure format (Instagram/YouTube/etc.) as a checklist + ready-to-copy caption line
- Content must stay accurate/updatable as ASCI guidelines evolve — treat as CMS-editable content, not hardcoded

### 3.6 Creator Media Kit / Rate Card Page
- Auto-generated, shareable public page (own URL, not inside a directory)
- Displays: stats snapshot, category tags, rate card/package menu (fixed price + delivery time per content type, creator-editable), credibility snapshot (on-time delivery %, repeat-brand rate — computed from Section 3.4 data)
- Creator shares this link directly (WhatsApp/Instagram bio/email) — platform is not the distribution channel

---

## 4. Role-Specific Modules (Phase 1.5 — Evaluate Before Building)

### 4.1 Creator ↔ Editor Collaboration Module
- New role: **Editor** (added to onboarding role selection)
- Revision workflow: creator can request changes, up to 3–4 rounds
- Content protection while unpaid: dynamic watermark overlay (creator name/timestamp) + blurred/low-res preview
  - **Note:** true screenshot/screen-recording prevention is not reliably enforceable at OS level (iOS/Android) — do not scope this as a hard requirement; watermarking + detection-where-available is the realistic implementation
- Final content download gated until payment is marked complete (escrow-style release, not necessarily true payment escrow — see Section 6 open question)
- Editor account temporary suspension (4–5 days) triggered after repeated failure on agreed revisions (3–4+ times)
  - **Trigger definition needs founder sign-off before build** — clarify whether this means editor under-delivering vs. editor rejecting creator's requested changes

### 4.2 Brand ↔ Creator Direct Collaboration Module
- Brand can initiate direct message to a creator through the platform
- Brand can filter/search creators by: follower count, view count, category, an "influencing score" composite metric (needs definition — see Section 6)
- **Positioning note:** this overlaps with an already-saturated market category (brand-discovery marketplaces). Recommend scoping as a feature bundled into a creator's existing account (e.g., brands can message/view only creators who've opted in) rather than a standalone searchable directory.

---

## 5. Phase 2 Features (Post-Launch, Post User-Base)

### 5.1 Creator ↔ Creator Collaboration Matching
- Match creators across complementary categories for organic collabs (e.g., fashion ↔ jewelry, comedy ↔ comedy)
- Reuses category taxonomy (Section 8) and a "fit score" concept (audience overlap/style compatibility)

### 5.2 Public Trending Leaderboard + Free Tools (Growth Loop)
- Public leaderboard page: top creators by growth metrics (views/comments/follower growth), filterable by category/city
- Free public tools (lead-gen, no login required): engagement rate calculator, earnings estimator

---

## 6. Compliance & Tax Logic (India)
- **TDS Section 194R:** brands deduct 10% TDS on fair value of benefits/perquisites (cash or gifted product/trip) once crossing ₹20,000/brand/financial year
- **TDS Section 194J:** applies to creator service fees; creators under ₹75L gross receipts can use simplified return filing (informational — not built into product logic beyond invoice calculations)
- **GST:** registration mandatory above ₹20L annual turnover (₹10L in special-category states); 18% GST on influencer/promotional services once registered
- Tax logic should be built as a **configurable rules layer**, not hardcoded — thresholds/rates are subject to change and require periodic verification against current CBDT rules

**Open decisions for founders (not developer-owned):**
- Escrow vs. simple invoicing+tracking — full payment escrow requires payment aggregator licensing in India; confirm approach before building payment-hold logic
- "Influencing score" composite metric definition (Section 4.2)
- Editor suspension trigger definition (Section 4.1)

---

## 7. Third-Party Integrations

| Integration | Purpose | MVP Priority |
|---|---|---|
| Razorpay | UPI/payment collection, GST-compliant invoicing | **Build in v1** |
| Digio or Leegality | E-signature for contracts | Defer past v1 |
| WhatsApp Business API (via BSP) | Deal-inbox auto-forwarding, payment reminders | Defer past v1 |

---

## 8. Category Taxonomy (Use Consistently Platform-Wide)
**All, Tech, Fashion, Lifestyle, Gaming, Fitness, Travel, Beauty**
Plus niche sub-tags as needed (e.g., Wedding, Ethnic Wear, Pets) — extendable list, not fixed enum.

---

## 9. Build Priority — v1 Sprint Order (2–3 weeks, solo/2-person team)
1. Auth + role-based onboarding (Section 2)
2. Deal tracker, manual entry (Section 3.1)
3. Invoice generator — Razorpay + GST/TDS fields (Section 3.3)
4. ASCI disclosure checklist — static content (Section 3.5)
5. Media kit page — shareable link (Section 3.6)
6. Deal history/CRM view (Section 3.4)
7. Rate benchmarking — seeded data version (Section 3.2)

**Explicitly out of v1 scope:** e-signature, WhatsApp integration, Editor module, Brand DM/filter module, Creator↔Creator matching, public leaderboard — all documented above for later phases, not to be built in the first sprint.