# Dexie Live Queries for Reactive UI

## Rule

Use `useLiveQuery` from `dexie-react-hooks` for all IndexedDB reads that drive UI state. Avoid manual polling or stale reads.

**Why:** `useLiveQuery` automatically re-runs the query and triggers React re-renders when the underlying Dexie table changes. This keeps UI in sync with IndexedDB without manual subscription logic or stale data bugs.

**How to apply:**

- Wrap Dexie queries in `useLiveQuery(() => db.table.operation(), [deps])`.
- Return `undefined` while loading; component should handle loading state.
- For derived/filtered data, compute inside the query callback to keep reactivity.
- For expensive computations, use `useMemo` on the live query result, not inside the query.

## Code Example

```typescript
// src/hooks/useScans.ts pattern
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ScanRecord } from '@/db/schema';

export function useScans(options?: { limit?: number; order?: 'asc' | 'desc' }): ScanRecord[] | undefined {
  const { limit = 100, order = 'desc' } = options || {};

  return useLiveQuery(async () => {
    const scans = await db.scans
      .orderBy('timestamp')
      .limit(limit)
      .toArray();

    return order === 'desc' ? scans.reverse() : scans;
  }, [limit, order]);
}

export function useScan(scanId?: string): ScanRecord | undefined {
  return useLiveQuery(
    async () => {
      if (!scanId) return undefined;
      return await db.scans.get(scanId);
    },
    [scanId]
  );
}
```

## Exceptions

- For one-shot writes (create/update/delete), use direct Dexie methods without `useLiveQuery`.
- For background analytics aggregation, compute outside React render cycle and cache in `analytics` table.
