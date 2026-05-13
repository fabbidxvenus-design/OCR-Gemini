# TIP-062: Design Tokens & Tailwind Config

## Objective
Update Tailwind design tokens to match the Google Stitch production design system.

## Source
- Stitch design system: `assets/8074986626643835639`
- Direction: Industrial Utility + AI Trust

## Files
- `tailwind.config.js`
- Optional: `src/index.css` if global CSS variables are needed

## Requirements

### Colors
Add or update tokens:
- `primary`: `#0F766E`
- `primary-hover`: `#134E4A`
- `primary-light`: `#CCFBF1`
- `deep-teal`: `#134E4A`
- `secondary`: `#2563EB`
- `secondary-light`: `#DBEAFE`
- `ai`: `#7C3AED`
- `ai-light`: `#F3E8FF`
- `warning`: `#D97706`
- `warning-light`: `#FEF3C7`
- `error`: `#DC2626`
- `error-light`: `#FEE2E2`
- `ink`: `#0F172A`
- `muted`: `#64748B`
- `canvas`: `#F8FAFC`
- `card`: `#FFFFFF`
- `line`: `#CBD5E1`

Maintain compatibility aliases for existing classes where practical (`surface`, `neutral`, `text-primary`, etc.).

### Typography
- Headings: Manrope-style stack if available; fallback to Inter/system.
- Body: Inter/system.
- Technical labels: mono.

### Layout Tokens
- Touch target: 48px target, 44px minimum.
- Header: 56px–64px.
- Bottom nav: 72px–80px including safe area.
- Screen padding: 20px target.

## Acceptance Criteria
- Existing class names still compile.
- New production tokens are available.
- Build passes after token update.
