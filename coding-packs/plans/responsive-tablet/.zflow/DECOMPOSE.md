# DECOMPOSE — Responsive Tablet Support

> zflow plan mode | Plan: responsive-tablet | Phase: DECOMPOSE
> Generated: 2026-05-08

---

## EXECUTION ORDER

### Phase 1: Foundation (TIP-050)
**Can run alone**
```
┌─────────────────────────────────────┐
│ TIP-050: Responsive Hook + Config   │
│ - src/hooks/useMediaQuery.ts        │
│ - tailwind.config.js updates         │
└─────────────────────────────────────┘
```

### Phase 2: Parallel Tasks (TIP-051, TIP-053, TIP-054)
**All can run in parallel after TIP-050**

```
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│ TIP-051: Sidebar Component          │     │ TIP-053: HistoryPage Responsive     │
│ - src/components/layout/Sidebar.tsx  │     │ - src/pages/HistoryPage.tsx         │
│                                      │     │ - Grid: 2→3→4 columns              │
└──────────────┬──────────────────────┘     └─────────────────────────────────────┘
               │                                    │
               ▼                                    │
┌─────────────────────────────────────┐              │
│ TIP-052: Layout + Header Update     │              │
│ - src/components/layout/Layout.tsx  │              │
│ - src/components/layout/Header.tsx  │              │
└─────────────────────────────────────┘              │
                                                     ▼
                                     ┌─────────────────────────────────────┐
                                     │ TIP-054: AnalyticsPage KPIs        │
                                     │ - src/pages/AnalyticsPage.tsx       │
                                     │ - KPIs: 1→2→4 columns              │
                                     └─────────────────────────────────────┘
```

---

## DETAILED TASK BREAKDOWN

### TIP-050: Responsive Hook + Tailwind Config

| Step | Task | File | Priority |
|------|------|------|----------|
| 050-1 | Create useMediaQuery hook | `src/hooks/useMediaQuery.ts` | P0 |
| 050-2 | Add useIsTablet/useIsDesktop helpers | `src/hooks/useMediaQuery.ts` | P0 |
| 050-3 | Update tailwind.config.js with breakpoints | `tailwind.config.js` | P0 |
| 050-4 | Add responsive spacing tokens | `tailwind.config.js` | P1 |

### TIP-051: Sidebar Component

| Step | Task | File | Priority |
|------|------|------|----------|
| 051-1 | Create Sidebar component structure | `src/components/layout/Sidebar.tsx` | P0 |
| 051-2 | Add nav items with icons | `src/components/layout/Sidebar.tsx` | P0 |
| 051-3 | Add active state styling | `src/components/layout/Sidebar.tsx` | P0 |
| 051-4 | Add hover states | `src/components/layout/Sidebar.tsx` | P1 |

### TIP-052: Layout + Header Update

| Step | Task | File | Priority |
|------|------|------|----------|
| 052-1 | Update Layout to conditionally render Sidebar | `src/components/layout/Layout.tsx` | P0 |
| 052-2 | Update Layout content max-width | `src/components/layout/Layout.tsx` | P0 |
| 052-3 | Update Header for tablet hamburger | `src/components/layout/Header.tsx` | P1 |

### TIP-053: HistoryPage Responsive

| Step | Task | File | Priority |
|------|------|------|----------|
| 053-1 | Add responsive grid cols (2→3→4) | `src/pages/HistoryPage.tsx` | P0 |
| 053-2 | Center list view on tablet+ | `src/pages/HistoryPage.tsx` | P1 |
| 053-3 | Responsive header/stack layout | `src/pages/HistoryPage.tsx` | P1 |

### TIP-054: AnalyticsPage Responsive

| Step | Task | File | Priority |
|------|------|------|----------|
| 054-1 | Add responsive KPI grid (1→2→4) | `src/pages/AnalyticsPage.tsx` | P0 |
| 054-2 | Update KPI card layout (stacked→inline) | `src/pages/AnalyticsPage.tsx` | P0 |
| 054-3 | Responsive date filter | `src/pages/AnalyticsPage.tsx` | P1 |

---

## ESTIMATED TIME

| TIP | Estimated | Actual | Total |
|-----|-----------|--------|-------|
| TIP-050 | S | - | 0 |
| TIP-051 | S | - | 0 |
| TIP-052 | S | - | 0 |
| TIP-053 | S | - | 0 |
| TIP-054 | S | - | 0 |
| **TOTAL** | **~5 hours** | **-** | **0** |

---

## TESTING STRATEGY

### Visual Verification
Manual browser testing at:
1. Mobile: 375px (DevTools)
2. Tablet: 768px (DevTools)
3. Desktop: 1280px (DevTools)

### Checklist
- [ ] BottomNav hidden on tablet+
- [ ] Sidebar visible on tablet+
- [ ] History grid columns change at correct breakpoints
- [ ] KPI grid columns change at correct breakpoints
- [ ] Content max-width 1280px on desktop
- [ ] No horizontal overflow at any viewport

---

## RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| BottomNav still shows on tablet | UX confusion | Explicit isTablet check before rendering |
| Horizontal overflow on tablet | Layout breaks | Test at 768px specifically |
| Tailwind config conflicts | Build errors | Review existing config first |

---

*DECOMPOSE COMPLETE | Phase: DECOMPOSE | Ready for EXECUTE*