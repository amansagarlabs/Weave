# DESIGN — Weave Connector Platform

> This document supersedes the old “Creator Operations Platform” framing. Weave is a creator-brand-editor discovery and booking platform. `Development paper.md` controls product direction; `TRD.md` controls implementation; `Sitemap.md` controls routes. The visual direction in this document is locked to the current Weave landing page.

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

---

## 9. Weave visual direction — locked

The current landing page is the reference surface for every authenticated and public page. Extend its visual language; do not introduce a second product style.

- **Mood:** editorial, optimistic, human, confident, lightly playful.
- **Canvas:** warm paper background with generous whitespace.
- **Primary ink:** near-black green for text, navigation, outlines, and high-contrast actions.
- **Primary accent:** acid lime for invitations, highlights, selected states, and creator energy.
- **Secondary accent:** coral orange for action shadows, warnings, and small moments of emphasis.
- **Support color:** forest green for primary actions and positive states.
- **Type:** heavy rounded display face for headings; readable humanist sans-serif for body and controls; compact mono/uppercase labels for metadata.
- **Shape:** rounded cards and pills, with concentric radii for nested surfaces.
- **Depth:** offset hard shadows used sparingly; use the forest/ink/orange stack from the landing hero instead of generic gradients.
- **Composition:** asymmetric editorial layouts are encouraged on hero and discovery pages; forms and operational screens should become calmer and more structured.

Do not use purple-blue gradients, glassmorphism, generic stock illustrations, dense enterprise tables, or fake AI match percentages.

## 10. Shared application shell

### Public shell

The public shell contains the Weave wordmark, `How it works`, `Explore`, login, and lime `Join Weave` CTA. On mobile, collapse secondary links into a menu button with a visible focus state.

### Authenticated shell

Use a responsive two-part shell:

1. Desktop: compact forest sidebar with wordmark, role navigation, current workspace indicator, notifications, and profile menu.
2. Mobile: top bar with wordmark, page title, notification button, and a bottom navigation bar with no more than five primary destinations.

The active route is indicated with an icon plus text and a lime surface; never use color alone. Keep the main content column between 720px and 1180px depending on page type.

### Shared page anatomy

Every authenticated page should have:

- breadcrumb or role context when the page is nested;
- one clear page title and one-sentence purpose statement;
- one primary action, placed consistently in the title row;
- status and error feedback near the action that caused it;
- an intentional loading state and an intentional empty state;
- mobile layout tested at 360px width.

## 11. Page-by-page UI specification

### Public pages

| Route | UI direction |
|---|---|
| `/` | Current reference landing page. Keep the editorial hero, rotated lime message card, coral offset label, category strip, and three-step explanation. |
| `/login` | Calm centered auth card on paper background. Wordmark, “Welcome back.” heading, email/password fields, lime or forest submit button, forgot-password link, signup link, and inline error state. |
| `/signup` | Role-first signup. Show three large selectable cards: Creator, Brand, Editor. Each card has a short benefit line and arrow. Continue only after a role is selected. |
| `/onboarding/role` | Full-page role decision with the three cards, a short “You can change this later” note, and a progress marker. This is the pre-auth version of role selection. |
| `/creator/:slug` | Public creator storefront: profile header, availability pill, category tags, stats chips, portfolio tabs, package cards, credibility area, and message/request CTA. Hide empty credibility metrics and show “Building a track record” where needed. |
| `/help` | Search-first help page with grouped cards for account, profiles, bookings, payments, safety, and contact support. Use accordion rows with keyboard support. |

### Creator pages

| Route | UI direction |
|---|---|
| `/creator/onboarding` | Four-step progress flow: identity, categories/platforms, audience, availability. Use one focused form per step, visible labels, autosave indicator, and a preview card on desktop. |
| `/creator/dashboard` | Warm operational home: greeting, “complete your profile” progress, active booking status cards, earnings summary, quick actions, and a strong first-booking empty state. |
| `/creator/profile/edit` | Profile editor with sticky preview panel on desktop and preview toggle on mobile. Sections: identity, bio, categories, platforms, location, availability, and public slug. |
| `/creator/packages` | Package menu editor. Use editable cards for content type, price, delivery days, revisions, and description. Provide add, duplicate, reorder, and archive actions. |
| `/creator/portfolio` | Upload/manage grid with drag-and-drop on desktop and file picker on mobile. Each asset has type, caption, visibility, and delete controls. Show upload progress and failure recovery. |
| `/creator/bookings` | Filterable booking list grouped by status. Cards on mobile, compact rows on desktop. Status order: Pending, Negotiating, Accepted, Delivered, Paid. |
| `/creator/bookings/:id` | Booking detail with a horizontal status timeline, brief summary, package/rate card, brand details, message CTA, deliverables, and next-action panel. |
| `/creator/messages` | Inbox with unread indicators, search, role/avatar labels, and empty state explaining how brands can start a conversation. |
| `/creator/messages/:threadId` | Thread view with message bubbles, brief attachment area, booking context rail, and composer with clear sending/error states. |
| `/creator/hire-editor` | Editor discovery cards inspired by Fiverr: thumbnail, editor identity, rating, starting price, delivery time, revisions, and “View profile” CTA. No fake ranking score. |
| `/creator/editor-requests` | Request list with revision count, preview/payment state, and next action. Make the 3–4 revision cap visible. |
| `/creator/editor-requests/:id` | Detail workspace with brief, watermarked/low-resolution preview, revision timeline, request-change action, payment status, and gated final-download action. Explain that watermarking is best-effort and cannot prevent screenshots. |
| `/creator/earnings` | Earnings overview with paid/pending totals, invoice list, filters, invoice status badges, and payment-link actions. Use INR formatting but keep currency in data. |
| `/creator/settings` | Settings sections for account, security, GSTIN/tax details, notifications, language, and delete-account request. Use progressive disclosure for advanced tax fields. |

### Brand pages

| Route | UI direction |
|---|---|
| `/brand/onboarding` | Company setup flow: company identity, industry, GSTIN, team contact, and campaign preferences. Keep one decision per screen. |
| `/brand/dashboard` | Campaign-oriented home with active bookings, pending actions, recent conversations, and a discovery CTA. Avoid finance-heavy creator dashboard patterns. |
| `/brand/discover` | Search and discovery workspace with category chips exactly `All, Tech, Fashion, Lifestyle, Gaming, Fitness, Travel, Beauty`, follower/engagement filters, and creator cards. Influencing score is displayed only as “Coming soon” or omitted until founder sign-off. |
| `/brand/creator/:slug` | Brand view of public creator profile with package comparison, portfolio, credibility chips, availability, message, and request-booking actions. Never display an “AI fit” percentage. |
| `/brand/messages` | Conversation inbox with campaign/creator context and quick filters for unread, active brief, and awaiting reply. |
| `/brand/messages/:threadId` | Thread plus brief panel. Allow attaching requirements, selecting a package, and moving to booking proposal without leaving the conversation. |
| `/brand/bookings` | Booking pipeline with status tabs and compact cards showing creator, package, amount, delivery date, and next action. |
| `/brand/bookings/:id` | Booking workspace with creator header, approved brief, deliverables checklist, review/accept actions, payment-link status, and event timeline. No escrow language. |
| `/brand/settings` | Company profile, billing/tax details, team preferences, notifications, language, and account controls. |

### Editor pages

| Route | UI direction |
|---|---|
| `/editor/onboarding` | Portfolio-first setup: identity, editing specialties, portfolio links, packages, pricing, delivery, and revisions included. |
| `/editor/dashboard` | Work queue with incoming requests, active deliveries, revision alerts, and earnings snapshot. The next task should be obvious within three seconds. |
| `/editor/gigs` | Gig/package management using tier cards: Basic, Standard, Premium. Each card supports price, delivery, revisions, included services, cover media, and archive. |
| `/editor/requests` | Request queue with creator, request date, deadline, revision count, payment state, and preview status. |
| `/editor/requests/:id` | Delivery workspace with brief, asset upload, watermarked preview, revision controls, and final-asset gate. Suspension behavior remains a placeholder pending founder sign-off. |
| `/editor/earnings` | Paid/pending earnings, request-linked invoices/payment links, and simple monthly totals. |
| `/editor/settings` | Profile, payout/payment-link preferences, notifications, language, and account controls. |

### Shared and admin pages

| Route | UI direction |
|---|---|
| `/notifications` | Notification center with unread/read tabs, grouped dates, icon + text status, and “mark all read”. |
| `/admin/users` | Dense but readable internal table with search, role filter, status, profile completion, and safe action menus. Confirm destructive actions. |
| `/admin/disputes` | Dispute queue with severity/status filters, two-column case detail, evidence timeline, internal notes, and resolution actions. |
| `/admin/content` | CMS-style editor for compliance/payment copy, disclosure content where retained, category taxonomy, and system labels. Changes need preview and publish confirmation. |

## 12. Shared component inventory

Build these before page-specific components:

- `WeaveLogo`, `PublicNav`, `AppShell`, `MobileBottomNav`;
- `Button`, `IconButton`, `LinkButton`, `Badge`, `StatusBadge`;
- `Card`, `StatChip`, `EmptyState`, `Skeleton`, `Toast`;
- `TextField`, `Select`, `CurrencyField`, `TagInput`, `FileDropzone`;
- `PackageCard`, `CreatorCard`, `EditorGigCard`, `BookingCard`;
- `Timeline`, `FilterBar`, `Tabs`, `DataTable`, `Pagination`;
- `Dialog`, `Drawer`, `ConfirmDialog`, `Accordion`;
- `Avatar`, `PortfolioGrid`, `MessageComposer`, `PaymentState`.

Components must support loading, disabled, error, and keyboard-focus states before being reused across routes.

## 13. State and copy rules

- Use the exact status labels defined in the product documents.
- Always pair status color with text and, where useful, an icon.
- Empty states should explain what happened and offer one action.
- Never show `0%` credibility metrics when no history exists.
- Never promise screenshot-proof content, guaranteed payment, escrow, or AI matching.
- Use “payment link” or “payment status”; do not use “funds held”, “released from escrow”, or equivalent language.
- All visible copy must come from an i18n-ready message map, even for English-only v1.

## 14. Responsive and accessibility acceptance criteria

- All primary flows work at 360px, 768px, and 1440px widths.
- Interactive controls have at least 44px touch targets.
- Keyboard focus is visible and never removed without a replacement.
- Dialogs trap focus, close with Escape, and restore focus to the trigger.
- Forms use visible labels, linked descriptions, and inline `aria-live="polite"` errors.
- Motion respects `prefers-reduced-motion`.
- Normal text meets WCAG AA contrast; color is never the only status signal.
- Test public profile pages, discovery cards, booking timelines, and upload states with keyboard navigation before release.
