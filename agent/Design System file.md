# Weave Design System

Version: 1.0  
Status: implementation source of truth for the frontend visual layer

This system extends the current Weave landing page across public, creator, brand, editor, and admin surfaces. Product requirements remain in `Development paper.md`; routes remain in `Sitemap.md`; this file controls visual tokens, component behavior, and UI consistency.

## 1. Design principles

1. **Human first:** Weave should feel like a trusted creative workspace, not enterprise procurement software.
2. **Clear next action:** Every screen has one obvious primary action.
3. **Warm confidence:** Use a paper canvas, strong ink, and intentional bright accents.
4. **Earned trust:** Never invent metrics, ranking scores, guarantees, or payment protection.
5. **Quiet operations:** Editorial layouts can be expressive; forms, bookings, and payment screens must be calm.

## 2. Color tokens

Use semantic CSS variables. Components must not hardcode hex values.

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#F6F7F2` | Primary page background |
| `--color-card` | `#FFFFFF` | Cards, drawers, inputs |
| `--color-ink` | `#17221F` | Main text, outlines, dark controls |
| `--color-muted` | `#697570` | Secondary text |
| `--color-line` | `#DCE4DE` | Dividers and quiet borders |
| `--color-forest` | `#1E4B3B` | Primary actions, positive states |
| `--color-lime` | `#E8F55B` | Selected states, invitations, highlights |
| `--color-coral` | `#EF7047` | Accent shadow, warning emphasis |
| `--color-amber` | `#B7791F` | Awaiting action; pair with label/icon |
| `--color-danger` | `#B42318` | Errors, overdue, destructive actions |

Status mapping:

- Pending / Negotiating: amber surface + dark text + clock icon.
- Accepted / Delivered: forest surface or tint + text label.
- Paid / Complete: forest tint + check icon.
- Overdue / Failed: danger tint + alert icon.

## 3. Typography

```css
:root {
  --font-display: "Trebuchet MS", "Arial Rounded MT Bold", sans-serif;
  --font-body: "Trebuchet MS", "Segoe UI", sans-serif;
  --font-meta: "JetBrains Mono", "SFMono-Regular", monospace;
}
```

Type scale: `12 / 14 / 16 / 18 / 24 / 32 / 48 / 64 / 88`.

- Display headings: 48–88px, weight 800–900, letter-spacing `-0.06em`, line-height `.92–1.02`.
- Page headings: 32–48px, weight 800, letter-spacing `-0.05em`.
- Section headings: 24–32px, weight 800.
- Body: 16px, line-height `1.6`, max width `65ch`.
- Metadata: 12–14px, uppercase or mono, letter-spacing `.12–.18em`.
- Numbers, rates, and totals use tabular numerals.

## 4. Spacing and shape

Use the 4px rhythm: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.

| Token | Value |
|---|---:|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `20px` |
| `--radius-xl` | `32px` |
| `--radius-pill` | `999px` |
| `--shadow-offset` | `4px 4px 0 var(--color-ink)` |
| `--shadow-accent` | `5px 5px 0 var(--color-coral)` |

Nested surfaces use concentric radii: outer radius equals inner radius plus padding. Keep at least 8px between adjacent touch targets and 44px minimum interactive height.

## 5. Component behavior

### Buttons

- Primary: forest background, white text, optional coral offset shadow.
- Accent: lime background, ink text, ink offset shadow.
- Secondary: transparent/paper background, 2px ink outline.
- Ghost: no fill, muted hover surface.
- Destructive: danger background, white text, confirmation for irreversible actions.
- All buttons include visible focus rings, disabled state, and a loading state that preserves width.
- Press feedback uses `transform: scale(.97)`; no broad `transition: all`.

### Cards

Use white or lime cards on paper. Apply soft layered shadows for elevated cards and offset shadows only to intentional feature cards. Hover lift is limited to pointer devices and should be 1–2px.

### Status badges

Always include text. Recommended anatomy: icon, label, optional count. Do not rely on red/green alone.

### Forms

Visible label, input, helper text, error text. Placeholder is an example, never the only label. Progressive disclosure keeps tax, payment, and advanced profile fields out of the first view.

### Empty states

Use a short friendly headline, one explanatory sentence, and one action. Illustration is optional; use a lime/coral geometric mark rather than stock art.

### Dialogs and drawers

Use `role="dialog"`, `aria-modal="true"`, labelled heading, Escape close, click-outside behavior where safe, focus trap, and focus restoration. Mobile dialogs become bottom drawers when the task is form-heavy.

### Data displays

Cards on mobile; tables only for admin and desktop operational views. Preserve status, amount, owner, date, and next action as the first visible fields.

## 6. Motion

- Button/toggle feedback: 100–160ms.
- Popovers: 150–250ms.
- Drawers/dialogs: 200–300ms.
- Page/empty-state entrance: 300–500ms only when useful.
- Use ease-out curves and transform/opacity only.
- Respect `prefers-reduced-motion: reduce`.
- Never animate high-frequency navigation or data updates in a way that slows the user.

## 7. Iconography and imagery

- Use one consistent outline icon family with 1.75–2px stroke.
- Icon-only controls require an accessible label and tooltip where meaning is not obvious.
- Meaningful images require descriptive alt text; decorative marks use empty alt text.
- Creator/editor portfolio media must show loading, failure, and upload states.
- Watermarked previews must be visually distinct from final assets; copy must state that screenshots cannot be technically prevented.

## 8. Layout recipes

### Editorial landing

Two-column hero, left-aligned heading, rotated lime feature card, coral offset annotation, category strip, then three-column process explanation.

### Discovery grid

Filter bar above a responsive 1/2/3-column card grid. Preserve category chips and a visible result count. Add a calm empty state when filters return nothing.

### Workspace detail

Title/action row, status timeline, two-column content on desktop, stacked sections on mobile, sticky next-action panel only when it does not obscure content.

### Form flow

Progress marker, one focused section, visible save state, primary action at the bottom, secondary back action, and an optional preview panel on wide screens.

## 9. Accessibility contract

- WCAG AA contrast minimum: 4.5:1 normal text, 3:1 large text.
- Keyboard support for every action and menu.
- Visible `:focus-visible` ring with 2–3px outline.
- `aria-live="polite"` for validation, upload, payment, and save feedback.
- Minimum 44×44px hit area.
- Heading order remains sequential and each page has one `h1`.
- Never communicate state by color alone.
- Verify at 200% zoom and at 360px width.

## 10. Implementation checklist

- [ ] Tokens live in one global CSS file.
- [ ] Components use semantic tokens, not literal colors.
- [ ] Every route has loading, empty, error, and success states.
- [ ] All visible copy is i18n-ready.
- [ ] No escrow, screenshot-proof, guaranteed-payment, or fake-AI-match language.
- [ ] Creator/brand/editor role navigation is server-authorized, not only hidden in the UI.
- [ ] Storybook or equivalent component examples cover primary, hover, focus, disabled, loading, and error states.
