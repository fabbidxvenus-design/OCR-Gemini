# Scan Record Immutability

## Rule

Treat `ScanRecord` objects as immutable in React state. Use Dexie `update()` for persistence, not in-place mutation.

**Why:** React relies on reference equality to detect state changes. Mutating a scan record in place breaks React's change detection and causes stale UI. Dexie `update()` is the correct persistence API and doesn't require in-memory mutation.

**How to apply:**

- When editing a scan, create a new object with spread operator: `{ ...scan, edited: true }`.
- Pass the new object to `updateScan(scanId, updates)` which calls `db.scans.update(scanId, updates)`.
- Never call `scan.edited = true` or `scan.ocrStructured.fields.push(...)` directly.
- For derived state (e.g., filtered scans), use `useMemo` on the live query result.

## Code Example

```typescript
// WRONG: in-place mutation
const scan = useScan(scanId);
scan.edited = true; // ❌ Breaks React change detection
await db.scans.update(scanId, scan);

// CORRECT: immutable update
const scan = useScan(scanId);
const updatedScan = { ...scan, edited: true }; // ✅ New object
await updateScan(scanId, { edited: true }); // ✅ Dexie update helper

// src/hooks/useScans.ts helper
export async function updateScan(scanId: string, updates: Partial<ScanRecord>): Promise<void> {
  await db.scans.update(scanId, updates);
}
```

## Exceptions

- Dexie's internal update logic mutates the persisted record; this is expected and safe.
- For bulk operations, use `db.scans.bulkUpdate()` with partial objects, not full records.
