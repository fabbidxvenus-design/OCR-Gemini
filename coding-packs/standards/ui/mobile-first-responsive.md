# Mobile-First Responsive Layout

## Rule

Build layouts mobile-first (375px base), then enhance for tablet (768px+) and desktop (1024px+) using Tailwind `md:` and `lg:` prefixes.

**Why:** Mobile users are the primary audience (warehouse workers with phones). Starting mobile-first ensures core functionality works on smallest screens, then progressive enhancement adds tablet/desktop features without breaking mobile.

**How to apply:**

- Base styles apply to mobile (no prefix).
- Use `md:` prefix for tablet+ (768px+): sidebar, multi-column grids, increased padding.
- Use `lg:` prefix for desktop+ (1024px+): wider grids, max-width constraints.
- Use `useIsTablet()` / `useIsDesktop()` hooks for runtime behavior changes (e.g., show sidebar vs bottom nav).
- Never use `max-width` media queries; always `min-width` (mobile-first).

## Code Example

```tsx
// src/components/layout/Layout.tsx pattern
import { useIsTablet } from '@/hooks/useMediaQuery';

export default function Layout({ children, showBottomNav = true }: LayoutProps) {
  const isTablet = useIsTablet();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Sidebar /> {/* Hidden on mobile via CSS */}
      <div className={`flex-1 flex flex-col ${isTablet ? 'md:ml-sidebar' : ''}`}>
        <Header />
        <main className={`flex-1 overflow-y-auto ${isTablet ? 'p-screen-md' : 'pb-16'}`}>
          <div className={`max-w-content mx-auto ${isTablet ? 'px-screen-md py-section-md' : 'p-screen space-y-section'}`}>
            {children}
          </div>
        </main>
        {!isTablet && showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

// src/pages/HistoryPage.tsx grid pattern
<div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : ''} gap-section`}>
  {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
</div>
```

## Exceptions

- For print styles or desktop-only admin features, use `lg:` or `xl:` as base and hide on mobile.
- For touch-specific interactions (e.g., swipe gestures), use `@media (hover: none)` instead of breakpoints.
