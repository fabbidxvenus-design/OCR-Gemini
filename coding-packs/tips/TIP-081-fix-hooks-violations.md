# TIP-081: Fix React Hooks Violations — Conditional useMemo

## Metadata
| Field | Value |
|-------|-------|
| **TIP** | TIP-081 |
| **Author** | Claude (auto-generated from PHASE 2 audit) |
| **Created** | 2026-05-17 |
| **Type** | Bug Fix |
| **Priority** | P0 |
| **Estimated Hours** | 2 |
| **Status** | READY |

## Problem Statement

ESLint reports conditional React Hooks violations in two page components. Hooks are called AFTER `if (isPendingMissing) return` or `if (!scan) return` early returns, which violates React Rules of Hooks. This is a **pre-existing bug**, not introduced by recent changes.

### Locations

**1. `src/pages/AnalyticsPage.tsx`** — 4 useMemo calls after `if (isLoading)` return:
- Line ~69: `const totalScans = useMemo(...)` after `isLoading` check
- Line ~79: `const filteredScans = useMemo(...)` after `isLoading` check  
- Line ~94: `const avgConfidence = useMemo(...)` after `isLoading` check
- Line ~106: `const modelUsage = useMemo(...)` after `isLoading` check

**2. `src/pages/OCRResultPage.tsx`** — 1 useMemo after `if (!scan)` return:
- Line ~63: `const categorizedFields = useMemo(...)` after `if (!scan)` check

### Root Cause

All hooks must be called unconditionally and in the same order every render. The current code calls `useMemo` after an early return, which breaks hook ordering if the condition ever changes between renders.

## Fix Pattern

The standard fix is to **move all hooks above all conditional returns**:

```typescript
// BEFORE (violation)
if (isLoading) {
  return <Skeleton />;
}
const filteredScans = useMemo(() => {...}, [allScans, dateRange]); // ❌ hook after conditional

// AFTER (correct)
const filteredScans = useMemo(() => {...}, [allScans, dateRange]); // ✅ hook before any conditionals
if (isLoading) {
  return <Skeleton />;
}
```

For `useMemo` that depends on data that only exists after a guard check, restructure so the `useMemo` runs regardless but returns early:

```typescript
// Pattern for useMemo that needs a guard
const categorizedFields = useMemo(() => {
  if (!scan) return { main: [], secondary: [], metadata: [] }; // safe empty
  return categorizeFields(scan.ocrStructured.fields);
}, [scan]);
```

## Implementation Steps

### Step 1: Fix `src/pages/AnalyticsPage.tsx`
1. Read the current file around lines 65-115
2. Move all 4 `useMemo` declarations (for `totalScans`, `filteredScans`, `avgConfidence`, `modelUsage`) BEFORE the `if (isLoading) return` block
3. If any `useMemo` body references a variable that only exists after the guard, add safe null/empty handling inside the `useMemo`
4. Run `npm run lint` to confirm no hooks violations remain

### Step 2: Fix `src/pages/OCRResultPage.tsx`
1. Read the current file around line 60-70
2. Move `const categorizedFields = useMemo(...)` BEFORE the `if (!scan) return` block
3. Handle the case where `scan` is null/undefined inside the `useMemo` callback (return empty categorization)

### Step 3: Verify
1. `npm run lint` — no hooks violations
2. `npm run build` — production build succeeds
3. E2E suite passes — verify OCR result and analytics pages still render correctly

## Files to Modify
- `src/pages/AnalyticsPage.tsx`
- `src/pages/OCRResultPage.tsx`

## Constraints
- DO NOT change any business logic or UI behavior
- DO NOT add new dependencies
- Preserve existing `useMemo` dependencies and memoization logic
- Keep the `isLoading` / `!scan` guard returns for proper loading/missing states
- No E2E or test file changes needed