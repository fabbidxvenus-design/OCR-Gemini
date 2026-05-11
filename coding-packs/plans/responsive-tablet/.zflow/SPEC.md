# SPEC.md — Responsive Tablet Support

> zflow plan mode | Plan: responsive-tablet | Phase: SPEC
> Generated: 2026-05-08

---

## SCOPE

5 TIPs: TIP-050 through TIP-054
- TIP-050: Responsive Hook + Tailwind Config
- TIP-051: Sidebar Navigation Component
- TIP-052: Layout + Header Responsive Update
- TIP-053: HistoryPage Responsive Grid
- TIP-054: AnalyticsPage Responsive KPIs

---

## BREAKPOINTS

| Breakpoint | Width | Target |
|------------|-------|--------|
| base | 375-428px | Mobile (primary) |
| sm | 640px+ | Large phone |
| md | 768px+ | Tablet portrait |
| lg | 1024px+ | Tablet landscape / Desktop |
| xl | 1280px+ | Desktop |

---

## G/W/T SPECS

### TIP-050: Responsive Hook + Tailwind Config

**SPEC-050-01: useMediaQuery Hook**
```
GIVEN useMediaQuery hook called with "(min-width: 768px)"
WHEN viewport changes to 769px
THEN hook returns true

GIVEN useMediaQuery hook called with "(min-width: 768px)"
WHEN viewport changes to 767px
THEN hook returns false
```

**SPEC-050-02: useIsTablet Hook**
```
GIVEN useIsTablet hook
WHEN viewport >= 768px
THEN returns true

GIVEN useIsTablet hook
WHEN viewport < 768px
THEN returns false
```

**SPEC-050-03: useIsDesktop Hook**
```
GIVEN useIsDesktop hook
WHEN viewport >= 1024px
THEN returns true

GIVEN useIsDesktop hook
WHEN viewport < 1024px
THEN returns false
```

**SPEC-050-04: Tailwind Responsive Classes**
```
GIVEN Tailwind build
THEN responsive prefixes available: sm:, md:, lg:, xl:

GIVEN Tailwind build
THEN max-w-content: 1280px available

GIVEN Tailwind build
THEN screen-sm: 24px, screen-md: 32px spacing available
```

---

### TIP-051: Sidebar Navigation Component

**SPEC-051-01: Sidebar Rendering**
```
GIVEN Sidebar component
WHEN rendered on tablet+ (>= 768px)
THEN sidebar width is 240px fixed
AND sidebar height is 100vh
AND sidebar background is white
AND sidebar has border-right 1px card-border
```

**SPEC-051-02: Sidebar Navigation Items**
```
GIVEN Sidebar component
THEN shows 4 nav items: Quét scan, Lịch sử, Thống kê, Cài đặt
AND each item has icon (24px) left-aligned
AND each item has text body size

GIVEN nav item with active route
THEN item has bg-primary-light background
AND item has left border 3px primary
AND item text is text-primary
```

**SPEC-051-03: Sidebar Nav Item Hover**
```
GIVEN nav item with inactive route
WHEN user hovers over item
THEN item background changes to bg-surface
```

---

### TIP-052: Layout + Header Responsive Update

**SPEC-052-01: Layout Mobile Behavior**
```
GIVEN Layout component
WHEN viewport < 768px (mobile)
THEN renders Header at top
AND renders main content with pb-16 for BottomNav space
AND renders BottomNav at bottom

GIVEN Layout component with showBottomNav=false
WHEN viewport < 768px
THEN BottomNav not rendered
```

**SPEC-052-02: Layout Tablet+ Behavior**
```
GIVEN Layout component
WHEN viewport >= 768px (tablet+)
THEN renders Sidebar on left (240px)
AND renders Header at top of content area
AND renders main content without pb-16
AND BottomNav not rendered
```

**SPEC-052-03: Content Max-Width**
```
GIVEN Layout component on desktop (>= 1024px)
WHEN main content rendered
THEN content max-width is 1280px
AND content is horizontally centered
```

**SPEC-052-04: Header Mobile vs Tablet**
```
GIVEN Header component
WHEN viewport < 768px
THEN back button visible (ChevronLeft) if showBack=true

GIVEN Header component
WHEN viewport >= 768px
THEN hamburger menu icon visible on left
```

---

### TIP-053: HistoryPage Responsive Grid

**SPEC-053-01: Grid Columns by Breakpoint**
```
GIVEN HistoryPage with viewMode="grid"
WHEN viewport is mobile (base)
THEN grid has 2 columns (grid-cols-2)

GIVEN HistoryPage with viewMode="grid"
WHEN viewport is tablet (md: 768px+)
THEN grid has 3 columns (md:grid-cols-3)

GIVEN HistoryPage with viewMode="grid"
WHEN viewport is desktop (lg: 1024px+)
THEN grid has 4 columns (lg:grid-cols-4)
```

**SPEC-053-02: List View Responsive**
```
GIVEN HistoryPage with viewMode="list"
WHEN viewport is mobile
THEN list items are full width

GIVEN HistoryPage with viewMode="list"
WHEN viewport is tablet+
THEN list items max-width 768px and centered
```

**SPEC-053-03: Search/Filter Responsive**
```
GIVEN HistoryPage on mobile
WHEN search and filters displayed
THEN stacked vertically

GIVEN HistoryPage on tablet+
WHEN search and filters displayed
THEN horizontal layout
```

---

### TIP-054: AnalyticsPage Responsive KPIs

**SPEC-054-01: KPI Grid Columns by Breakpoint**
```
GIVEN AnalyticsPage
WHEN viewport is mobile (base)
THEN KPI cards stack vertically (grid-cols-1)

GIVEN AnalyticsPage
WHEN viewport is tablet (md: 768px+)
THEN KPI cards in 2x2 grid (md:grid-cols-2)

GIVEN AnalyticsPage
WHEN viewport is desktop (lg: 1024px+)
THEN KPI cards in single row (lg:grid-cols-4)
```

**SPEC-054-02: KPI Card Layout Mobile**
```
GIVEN KPI card on mobile
WHEN rendered
THEN icon centered above text
AND layout is flex-col
```

**SPEC-054-03: KPI Card Layout Tablet+**
```
GIVEN KPI card on tablet+
WHEN rendered
THEN icon left of text (inline)
AND layout is flex-row
```

**SPEC-054-04: Date Range Filter Responsive**
```
GIVEN AnalyticsPage date range chips
WHEN viewport is mobile
THEN chips wrap if needed

GIVEN AnalyticsPage date range chips
WHEN viewport is tablet+
THEN chips in single row with flex-1
```

---

## VISUAL VERIFICATION POINTS

| VP# | Viewport | Page | Checkpoint |
|-----|----------|------|------------|
| VP-01 | Mobile (375px) | HistoryPage | 2-column grid visible |
| VP-02 | Tablet (768px) | HistoryPage | 3-column grid visible, sidebar visible |
| VP-03 | Desktop (1280px) | HistoryPage | 4-column grid visible, content max-1280px centered |
| VP-04 | Mobile (375px) | AnalyticsPage | KPIs stacked vertically |
| VP-05 | Tablet (768px) | AnalyticsPage | KPIs in 2x2 grid |
| VP-06 | Desktop (1280px) | AnalyticsPage | KPIs in single row |

---

## RED GATE

Since this is a visual/layout-only change, RED gate = visual verification at each viewport width.

---

## QUALITY GATE CHECKLIST

- [ ] All G/W/T specs defined
- [ ] Visual verification points documented
- [ ] Breakpoints consistent across components
- [ ] Mobile-first behavior preserved

---

*SPEC.md v1.0 | Phase: SPEC | Status: READY FOR DECOMPOSE*