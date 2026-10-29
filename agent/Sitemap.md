# SITEMAP.md
Full page / route list — Creator ↔ Brand ↔ Editor connector platform

---

## Public (no auth)

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Sign up |
| `/onboarding/role` | Role selection (Creator / Brand / Editor) |
| `/creator/:slug` | Public creator profile (brand-facing, shareable) |
| `/help` | Help / support |
| `/dashboard` | Workspace redirect to the signed-in role home |

## Creator role

| Route | Page |
|---|---|
| `/creator/onboarding` | Profile setup (category, platforms, followers, city, language) |
| `/creator/dashboard` | Home — bookings, requests, earnings summary |
| `/creator/profile/edit` | Edit profile |
| `/creator/packages` | Rate card / package menu editor |
| `/creator/packages/new` | Add a package |
| `/creator/packages/edit` | Edit a package |
| `/creator/portfolio` | Portfolio upload / manage |
| `/creator/portfolio/upload` | Upload portfolio asset metadata |
| `/creator/bookings` | Booking list (all statuses) |
| `/creator/bookings/:id` | Booking detail |
| `/creator/messages` | Message inbox (brand DMs) |
| `/creator/messages/:threadId` | Message thread |
| `/creator/hire-editor` | Browse / hire an editor |
| `/creator/editor-requests` | List of editor requests placed |
| `/creator/editor-requests/:id` | Request detail — revision flow, preview, payment gate |
| `/creator/earnings` | Earnings / invoices |
| `/creator/settings` | Account settings |

## Brand role

| Route | Page |
|---|---|
| `/brand/onboarding` | Profile setup (company, industry, GSTIN) |
| `/brand/dashboard` | Home — active bookings, campaign summary |
| `/brand/discover` | Creator discovery / filter (category, followers, engagement, influencing score) |
| `/brand/creator/:slug` | View creator profile (brand context) |
| `/brand/messages` | Message inbox |
| `/brand/messages/:threadId` | Message thread |
| `/brand/bookings` | Booking list |
| `/brand/bookings/:id` | Booking detail |
| `/brand/settings` | Account settings |

## Editor role

| Route | Page |
|---|---|
| `/editor/onboarding` | Profile setup |
| `/editor/dashboard` | Home — incoming requests, earnings |
| `/editor/gigs` | Manage editing service packages / pricing |
| `/editor/gigs/new` | Add a gig |
| `/editor/gigs/edit` | Edit a gig |
| `/editor/requests` | Incoming creator requests |
| `/editor/requests/:id` | Request detail — deliver content, revision tracking, payment status |
| `/editor/earnings` | Earnings |
| `/editor/settings` | Account settings |

## Shared / Admin

| Route | Page |
|---|---|
| `/notifications` | Notification center (all roles) |
| `/admin/users` | User management (internal) |
| `/admin/disputes` | Dispute / flag review (internal) |
| `/admin/content` | CMS for compliance / disclosure text, category taxonomy (internal) |

---

**Total: 46 routes** (including nested create/edit variants and the `/dashboard` redirect helper that exists in the App Router tree).
