# TIP-082: Add Error State to HistoryPage

## Metadata
| Field | Value |
|-------|-------|
| **TIP** | TIP-082 |
| **Author** | Claude (auto-generated from PHASE 2 audit) |
| **Created** | 2026-05-17 |
| **Type** | Bug Fix / Productization |
| **Priority** | P1 |
| **Estimated Hours** | 1 |
| **Status** | READY |

## Problem Statement

`HistoryPage.tsx` renders `isLoading` skeletons correctly, but when `useScansState` encounters an error, it only sets the error state without showing an error UI to the user. The `error` returned by `useScansState` is never used in the component's render — there is no error display section between the loading skeleton and the empty/list states.

**Current behavior**: Error state (via `useScansState` error return) is silently swallowed. User sees either loading skeleton or empty list, but no actionable error when API fails.

**Expected behavior**: When `useScansState` returns an `error` string, render an error state card with the message and a retry button.

## Implementation Steps

### Step 1: Add error state render

Read `src/pages/HistoryPage.tsx`. Change:

```typescript
const { scans: scanList, isLoading } = useScansState({ limit: 100, order: 'desc' });
```

To:

```typescript
const { scans: scanList, isLoading, error } = useScansState({ limit: 100, order: 'desc' });
```

Add a new `useCallback` for retry:

```typescript
const handleRetry = useCallback(() => {
  // Force re-render by toggling a key, or refetch
  window.location.reload();
}, []);
```

Or better — add a `forceRefresh` state that, when toggled, remounts the component state:

```typescript
const [refreshKey, setRefreshKey] = useState(0);
// Pass key to useScansState — not directly supported, so use window.location.reload
```

The simplest and cleanest approach for mobile is a reload:

```typescript
const handleRetry = useCallback(() => {
  window.location.reload();
}, []);
```

Then add error UI between loading and the list:

```typescript
{isLoading ? (
  <div className="space-y-3" aria-label="Đang tải lịch sử">
    {Array.from({ length: 4 }).map((_, index) => (
      <SkeletonCard key={index} data-testid="history-skeleton-card" />
    ))}
  </div>
) : error ? (
  <div className="card-production flex flex-col items-center justify-center px-5 py-10 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-light">
      <AlertTriangle className="h-7 w-7 text-error" />
    </div>
    <h3 className="font-display text-heading-sm text-text-primary">Tải lịch sử thất bại</h3>
    <p className="mt-2 max-w-[260px] text-small text-text-secondary">{error}</p>
    <PrimaryButton className="mt-5" onClick={handleRetry}>
      Thử lại
    </PrimaryButton>
  </div>
) : scans.length > 0 ? (
```

### Step 2: Verify

- `npm run lint` — no errors
- `npm run build` — passes
- The error state shows with Vietnamese message and retry button

## Files to Modify

- `src/pages/HistoryPage.tsx`

## Constraints

- DO NOT change any business logic
- DO NOT add new dependencies — use existing `AlertTriangle` icon, `PrimaryButton`, `card-production` class
- Preserve existing loading skeleton and empty state behavior
- Keep `handleRetry` as `window.location.reload()` — simplest for mobile without complex state management
- The `error` prop is already typed as `string | null` by `useScansState`