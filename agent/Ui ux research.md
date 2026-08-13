# UI_UX_RESEARCH.md
Competitor UI/UX teardown — Creator↔Brand↔Editor connector model

---

## 1. CollabMarket (collabmarket.in) — Creator-side profile pattern

**Profile page layout:**
- Header: photo, name, niche tags (Lifestyle/Fashion/Beauty/Travel/Animals & Pets), follower count + platform icon, location, "Available for work" status badge
- Credibility row: Trust Score, Completion %, Authenticity %, Rating (all shown as compact stat chips near top)
- Stats block: followers, avg likes, avg views, engagement %, avg comments, campaigns completed (self-reported)
- Portfolio: tabbed grid (Photos / Videos), sortable (newest/oldest/most liked)
- Package cards below portfolio: fixed price + fixed delivery time per content type ("Instagram Reel — ₹3,500 — 5 day delivery")
- CTA row per package: Select Package / Negotiate Package / Send Message / Request Quote
- Trust badge: "Secured by CollabMarket Escrow" near payment CTAs
- Free tools (separate pages, used as SEO/lead-gen): Instagram Bio Search, Engagement Rate Calculator, Earnings Estimator

## 2. GetCollab (getcollab.in) — Brand-side discovery pattern

**Discovery/filter UI:**
- Category filter bar: All, Tech, Fashion, Lifestyle, Gaming, Fitness, Travel, Beauty
- Creator card in results grid: photo, name, category, followers, engagement %, Audience Match %, Authenticity Score, avg ROAS
- AI matching engine surfaces ranked creators per campaign brief

**Booking flow:** Discovery → Proposals & Bidding (creator submits price + gets ranked "fit score," e.g. 98%) → Direct Chat → Campaign Management (brief → approved → content review → live) → Secure Payment (released on delivery confirmation)

## 3. Fiverr — gig/package UI pattern (reference for Editor marketplace)

- Gig card: thumbnail image, seller avatar + name, seller level badge (New Seller / Level 1 / Level 2 / Top Rated), star rating + review count, "Starting at ₹X"
- Seller profile: avatar, level badge, response time, member-since date, languages, bio, portfolio gallery grid, reviews list
- Package comparison: 3-tier side-by-side table (Basic / Standard / Premium) — price, delivery time, revisions included, feature checklist per tier
- Order flow: select tier → fill requirements form → pay upfront (held by platform) → seller delivers → buyer requests revision or accepts → payment released on accept

## 4. Upwork — proposal/bid pattern (secondary reference)

- Job-post model: client posts brief, freelancers submit proposals + bid amount
- Milestone-based escrow release for fixed-price work
- Not directly reusable (job-board framing) but confirms proposal+escrow as a proven trust mechanism

---

## 5. Synthesis — what to borrow for this platform

| Our surface | Pattern to borrow | Source |
|---|---|---|
| Creator public profile | Header stats + credibility chips + tabbed portfolio | CollabMarket |
| Creator package menu | Fixed price/delivery-time cards, 3-tier comparison option | Fiverr |
| Brand discovery/filter | Category bar (All/Tech/Fashion/Lifestyle/Gaming/Fitness/Travel/Beauty) + creator card with match/authenticity stats | GetCollab |
| Brand↔Creator booking flow | Proposal/bid → chat → brief approval → payment on delivery | GetCollab |
| Editor gig listing | Gig card + seller level badge + tiered packages | Fiverr |
| Editor revision flow | Request revision → re-deliver → accept/release payment, capped at 3-4 rounds | Fiverr (capped by us, Fiverr allows per-package custom limits) |
| Trust signal placement | Escrow/secured badge near every payment CTA | CollabMarket |

**Deliberate deviations from competitors:**
- No AI "fit score" claim unless real matching logic exists — do not fake a percentage
- Editor content delivery: watermarked/blurred preview until payment, final asset gated post-payment (not just an "accept" click — enforce server-side)