# Phase 1: Foundation + Components

## Overview
Extend Tailwind config with design tokens + create reusable components.

## Tasks
- [ ] **TIP-027**: Extend Tailwind config with design tokens (1h)
- [ ] **TIP-028**: Create StatusBar component (1h) — depends on TIP-027
- [ ] **TIP-030**: Create HistoryCard component (2h) — depends on TIP-027
- [ ] **TIP-033**: Create KPICard component (1h) — depends on TIP-027

## Dependencies
TIP-027 is the foundation. TIP-028, TIP-030, TIP-033 can run parallel after TIP-027.

## Implementation Order
1. TIP-027 (foundation) → sequential
2. TIP-028, TIP-030, TIP-033 → parallel

## Acceptance Criteria
- Design tokens available as Tailwind classes (bg-primary, text-success, etc.)
- StatusBar: 62px height, semi-transparent dark, shows time
- HistoryCard: thumbnail + title + timestamp, supports select mode
- KPICard: icon + label + value format

## Design Tokens (from ui-spec.md)
```javascript
colors: {
  primary: '#2563EB',    // CTAs
  success: '#22C55E',    // Verified
  error: '#EF4444',      // Errors
  warning: '#FFFBEB',    // Low confidence bg
  'slate-900': '#0F172A', // Dark bg
  'slate-800': '#1E293B', // Secondary dark
  surface: '#F8FAFC',    // Light bg
  card: '#FFFFFF',       // Cards
  border: '#E2E8F0',     // Borders
  text: '#111827',       // Primary text
  muted: '#64748B',      // Secondary text
}
```

## File Mapping
| TIP | Files | Purpose |
|-----|-------|---------|
| TIP-027 | tailwind.config.js, src/index.css | Design tokens |
| TIP-028 | src/components/ui/StatusBar.tsx | Status bar |
| TIP-030 | src/components/history/HistoryCard.tsx | History card |
| TIP-033 | src/components/analytics/KPICard.tsx | KPI card |

## Source Documents
- `design/ui-spec.md`
- `00-PROJECT-CONTEXT-REDESIGN.md`
- `tips/TIP-027-tailwind-design-tokens.md`
- `tips/TIP-028-statusbar-component.md`
- `tips/TIP-030-historycard-component.md`
- `tips/TIP-033-kpicard-component.md`

---

*Phase 1 | Foundation | P0 | ~5h | Vibecode to zflow converted*
