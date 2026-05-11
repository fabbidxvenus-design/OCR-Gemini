# Runtime Responsive Hooks

## Rule

Use `useMediaQuery` / `useIsTablet` / `useIsDesktop` hooks for runtime responsive behavior that can't be handled by CSS alone.

**Why:** Some responsive decisions require JavaScript (e.g., conditionally rendering components, changing event handlers, or computing layout). CSS media queries can't handle these cases. Centralized hooks prevent duplicate `matchMedia` logic across components.

**How to apply:**

- Use CSS-only responsive (`md:`, `lg:` classes) whenever possible.
- Use hooks when you need to:
  - Conditionally render components (e.g., `{!isTablet && <BottomNav />}`)
  - Change component props based on screen size
  - Compute layout values in JavaScript
- Import from `@/hooks/useMediaQuery` to ensure consistent breakpoints.

## Code Example

```typescript
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

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

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

// Usage in component
import { useIsTablet } from '@/hooks/useMediaQuery';

function MyComponent() {
  const isTablet = useIsTablet();

  return (
    <>
      {isTablet ? <Sidebar /> : <BottomNav />}
      <div className={isTablet ? 'md:ml-sidebar' : ''}>
        {/* Content */}
      </div>
    </>
  );
}
```

## Exceptions

- Initial render returns `false` until effect runs; this can cause a flash of mobile layout on tablet. For SSR or critical above-fold content, prefer CSS-only responsive.
- For print media, use CSS `@media print` instead of JavaScript hooks.
