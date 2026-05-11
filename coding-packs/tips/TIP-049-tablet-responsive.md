# TIP-049: Tablet Responsive Layout

## HEADER
- TIP-ID: TIP-049
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-043 (Full UI Overhaul)
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React, Dexie.js
- Key files to read first:
    - `tailwind.config.js` (current design tokens)
    - `src/components/layout/Layout.tsx` (main layout wrapper)
    - `src/components/layout/BottomNav.tsx` (mobile nav)
    - `src/components/layout/Header.tsx` (app header)
    - `src/pages/HistoryPage.tsx` (grid layout page)
    - `src/pages/AnalyticsPage.tsx` (kpi grid page)
- Patterns to follow: Mobile-first with progressive enhancement. Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).

## APPLICABLE STANDARDS
- none

## TASK
Thêm responsive layout support cho tablet (768px+) và desktop (1024px+) trong khi vẫn giữ mobile là primary target. Cập nhật Layout, Navigation, và các pages để tận dụng không gian màn hình lớn hơn.

## SPECIFICATIONS
### Business Rules
1. **Breakpoints**: Mobile-first approach với 4 breakpoints:
   - Base: 375px - 428px (current mobile)
   - sm: 640px (large phone)
   - md: 768px (tablet portrait)
   - lg: 1024px (tablet landscape / desktop)
   - xl: 1280px (desktop)

2. **Layout Strategy**:
   - **Mobile (base)**: Single column, full-width, fixed bottom nav
   - **Tablet (md+)**: Side navigation sidebar (240px), content area với max-width 1024px, centered
   - **Desktop (lg+)**: Wider content area (max-width 1280px), more breathing room

3. **HistoryPage Grid**:
   - Mobile: 2-column grid
   - Tablet (md+): 3-column grid
   - Desktop (lg+): 4-column grid

4. **AnalyticsPage KPIs**:
   - Mobile: 1-column stack
   - Tablet (md+): 2-column grid (2 KPI per row)
   - Desktop (lg+): 4-column inline

5. **Navigation**:
   - Mobile: Fixed bottom nav (current)
   - Tablet (md+): Sidebar nav + hamburger for mobile menu

6. **Spacing Scale for Larger Screens**:
   - Side padding: 16px (mobile) → 24px (tablet) → 32px (desktop)
   - Card padding: 16px (mobile) → 20px (tablet) → 24px (desktop)
   - Section gap: 12px (mobile) → 16px (tablet) → 24px (desktop)

### Validation
- All touch targets remain ≥ 44px on mobile
- No horizontal overflow on any viewport
- Content remains readable at all breakpoints

### Error Handling
- Graceful degradation if CSS custom properties not supported
- Sidebar collapses to hamburger menu on screens < 768px

## ACCEPTANCE CRITERIA
- **Given** user on tablet (768px) **When** opens HistoryPage **Then** sees 3-column grid instead of 2-column
- **Given** user on tablet (768px) **When** opens AnalyticsPage **Then** sees KPI cards in 2x2 grid layout
- **Given** user on tablet (768px) **When** views any page **Then** sees sidebar navigation instead of bottom nav
- **Given** user on mobile **When** uses app **Then** behavior unchanged (bottom nav, single column)
- **Given** user on desktop (1024px+) **When** uses app **Then** sees centered content with max-width 1280px
- **Given** any viewport **When** viewing pages **Then** no horizontal scroll or overflow

## CONSTRAINTS
- DO NOT: Remove or change mobile-first behavior
- DO NOT: Add new color variables (reuse existing design tokens)
- REUSE: BottomNav component, existing Tailwind config
- SKIP: Do not implement dark mode tablet-specific styles, keep single theme for now

## FILES TO CREATE
- `src/components/layout/Sidebar.tsx` — Sidebar navigation for tablet+
- `src/hooks/useMediaQuery.ts` — Hook for responsive detection

## FILES TO MODIFY
- `tailwind.config.js` — Add responsive spacing tokens + breakpoints
- `src/components/layout/Layout.tsx` — Add responsive layout structure
- `src/components/layout/Header.tsx` — Add hamburger menu for mobile sidebar
- `src/pages/HistoryPage.tsx` — Add responsive grid columns
- `src/pages/AnalyticsPage.tsx` — Add responsive KPI grid

## IMPLEMENTATION APPROACH

### 1. tailwind.config.js updates
```javascript
// Add responsive spacing
spacing: {
  // existing...
  'screen-sm': '24px',
  'screen-md': '32px',
  'screen-lg': '48px',
  'section-sm': '16px',
  'section-md': '20px',
}

// Add max-width for content
maxWidth: {
  'app': '1024px',
  'content': '1280px',
}
```

### 2. Layout component structure
```
Mobile:
┌─────────────────────────┐
│ Header (56px)           │
├─────────────────────────┤
│                         │
│ Main Content            │
│ (flex-1, overflow-y)    │
│                         │
├─────────────────────────┤
│ BottomNav (64px)        │
└─────────────────────────┘

Tablet+:
┌────────────┬────────────┐
│ Sidebar    │ Header     │
│ (240px)    │ (56px)     │
│            ├────────────┤
│ [Nav]      │            │
│ [Items]    │ Main       │
│            │ Content    │
│            │ (max-w)    │
└────────────┴────────────┘
```

### 3. Media query hook
```typescript
// useMediaQuery.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// Usage: const isTablet = useMediaQuery('(min-width: 768px)');
```