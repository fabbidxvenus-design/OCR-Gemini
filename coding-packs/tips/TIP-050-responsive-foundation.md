# TIP-050: Responsive Hook + Tailwind Config

## HEADER
- TIP-ID: TIP-050
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-043
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS

## TASK
Tạo useMediaQuery hook và cập nhật tailwind.config.js với responsive tokens và breakpoints.

## SPECIFICATIONS

### 1. useMediaQuery Hook
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

// Pre-built hooks
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
```

### 2. Tailwind Config Updates
```javascript
// Add to theme.extend
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
},
maxWidth: {
  'app': '1024px',
  'content': '1280px',
},
spacing: {
  'screen-sm': '24px',
  'screen-md': '32px',
  'screen-lg': '48px',
}
```

## ACCEPTANCE CRITERIA
- **Given** useMediaQuery hook **When** called with media query **Then** returns boolean reactively
- **Given** useIsTablet() **When** viewport >= 768px **Then** returns true
- **Given** useIsDesktop() **When** viewport >= 1024px **Then** returns true
- **Given** tailwind config **When** build **Then** responsive classes available (sm:, md:, lg:)

## CONSTRAINTS
- DO NOT: Add non-standard breakpoints
- REUSE: Follow existing hook patterns in codebase