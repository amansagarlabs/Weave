# DESIGN — Creator Operations Platform (India MVP)

---

## 1. Design Principles
- **Feels professional, not corporate.** The user is a 20-something creator managing their side hustle/business — the tool should feel closer to a well-designed personal finance app than an enterprise SaaS dashboard.
- **Trust is the product.** Since the core motto is "mutual self-protection with transparency," visual design should reinforce clarity and honesty — clean data presentation, no dark patterns, no artificially inflated numbers.
- **Mobile-first thinking, even on a responsive web app.** Most micro-influencers manage their business from their phone between shoots — every core flow (log a deal, send an invoice, check payment status) must work comfortably one-handed on mobile web.
- **Low cognitive load.** This user is not a project-management power user. Favor simple lists and clear statuses over dense dashboards.

## 2. Screen Inventory (Phase 1)

1. **Role Selection** (first screen, pre-signup)
2. **Sign-up / Login** (role-specific, branches after role selection)
3. **Creator Onboarding** — profile setup (category, platforms, followers, city, language)
4. **Brand Onboarding** — profile setup (company, industry, GSTIN)
5. **Creator Dashboard (Home)** — summary: active deals, pending invoices, quick actions
6. **Deal Tracker (List View)** — all deals by status
7. **Deal Detail** — single deal: rate, notes, status timeline, "mark ready to post" action
8. **ASCI Disclosure Checklist (Modal/Step)** — triggered from Deal Detail
9. **Rate Benchmark Tool** — input followers/category/engagement → suggested range
10. **Invoice Generator** — form + preview + send action
11. **Invoice Detail / Status** — sent, paid, overdue states
12. **Deal History / CRM View** — past brands, rates, payment reliability
13. **Media Kit Editor** — creator edits their own public page (rate card, stats)
14. **Media Kit Public View** — what a brand sees when sent the link (no login required)
15. **Settings** — GSTIN, notification preferences, language

## 3. Key User Flows

**Flow A — First-time creator activation**
Role Selection → Sign-up → Creator Onboarding → Dashboard (empty state, prompts to log first deal) → Deal Tracker (add deal) → Deal Detail

**Flow B — Getting paid (the core value loop)**
Deal Detail (status: accepted) → mark "content delivered" → ASCI Checklist shown → Invoice Generator (pre-filled from deal) → Invoice sent via Razorpay link → Invoice Detail shows "sent" → webhook updates to "paid" → Deal History updated automatically

**Flow C — Sharing credibility**
Media Kit Editor (creator sets up rate card once) → copies public link → shares externally (WhatsApp/Instagram bio) → Media Kit Public View (brand sees stats + credibility snapshot, no login)

## 4. Empty States (Important — Design Explicitly, Don't Default to Blank)
- Dashboard with zero deals: should prompt "Log your first deal" with one-tap action, not a blank screen
- Media kit before any completed deals: credibility snapshot section should gracefully hide or show "Building your track record" rather than showing 0%/0% which reads as untrustworthy

## 5. Status/State Language (Keep Consistent Across Screens)
Deal status: Pending → Negotiating → Accepted → Content Delivered → Paid
Invoice status: Draft → Sent → Paid → Overdue
Use consistent color-coding for status across Deal Tracker, Deal Detail, and Invoice views (e.g., amber = pending/awaiting action, green = paid/complete, red = overdue — final palette to be defined in implementation, not prescribed here).

## 6. Design System Notes
- Build a small, consistent component set early: status badge, deal card, form input, button (primary/secondary), modal/checklist — reuse across all screens rather than one-off styling per screen
- Typography and color tokens should be defined once (design tokens file) and referenced everywhere, not hardcoded per component — this matters more than which specific palette is chosen, since it's what keeps a small team's UI consistent without a dedicated designer reviewing every screen
- For actual visual/UI implementation (not just this written spec), consult frontend design best practices at build time for typography, spacing, and color choices appropriate to a trust-oriented fintech-adjacent product — avoid generic default-template look

## 7. Accessibility & Language
- All interactive elements need visible focus states and adequate touch-target size (mobile-first)
- Text content (labels, checklist copy, disclosure text) must be stored externally (i18n-ready), not hardcoded in components, to support the planned Hindi/regional language rollout without a UI rebuild

## 8. Out of Scope for Phase 1 Design
- Editor collaboration screens (revision workflow, watermarked preview UI) — design when Phase 1.5 is greenlit
- Brand-side DM/filter UI — design when Phase 1.5 is greenlit
- Public leaderboard UI — design in Phase 2