# TIP-004: IndexedDB Setup + CRUD Operations

## HEADER
- **TIP-ID**: TIP-004
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Database
- **Priority**: P0
- **Depends on**: TIP-001
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Dexie.js 4 + dexie-react-hooks 1
- **Key files to read first**: 
  - `BUILDER-HANDOFF.md` (IndexedDB schema, patterns)
  - `src/db/schema.ts` (created in TIP-002, will be extended)
- **Patterns to follow**: Dexie.js for IndexedDB wrapper, React hooks for queries, 90-day cleanup policy

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Extend the existing Dexie database schema (created in TIP-002) with complete CRUD operations for scan records. Implement query functions for listing, filtering, searching, and deleting scans. Add automatic 90-day cleanup policy to prevent quota exhaustion. Create React hooks for common database operations. Ensure all operations are type-safe and handle IndexedDB quota errors gracefully.

---

## SPECIFICATIONS

### Business Rules

1. **Schema**: Already defined in TIP-002 (`src/db/schema.ts`)
2. **CRUD operations**: Create, Read, Update, Delete for scan records
3. **Cleanup policy**: Auto-delete scans older than 90 days
4. **Quota handling**: Detect and handle IndexedDB quota exceeded errors
5. **Search**: Full-text search on OCR raw text and structured fields
6. **Filtering**: Filter by date range, edited status
7. **Sorting**: Sort by timestamp (newest first by default)
8. **Pagination**: Support offset/limit for large result sets

### Database Queries

**src/db/queries.ts**:
```typescript
import { db, ScanRecord } from './schema';

// Create
export async function createScan(scan: Omit<ScanRecord, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.scans.add({ ...scan, id });
  return id;
}

// Read
export async function getScanById(id: string): Promise<ScanRecord | undefined> {
  return db.scans.get(id);
}

export async function getAllScans(options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp';
  order?: 'asc' | 'desc';
}): Promise<ScanRecord[]> {
  const { limit = 50, offset = 0, sortBy = 'timestamp', order = 'desc' } = options || {};
  
  let collection = db.scans.orderBy(sortBy);
  if (order === 'desc') {
    collection = collection.reverse();
  }
  
  return collection.offset(offset).limit(limit).toArray();
}

export async function getScansByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ScanRecord[]> {
  return db.scans
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .reverse()
    .toArray();
}

export async function getEditedScans(): Promise<ScanRecord[]> {
  return db.scans.where('edited').equals(1).reverse().sortBy('timestamp');
}

export async function searchScans(query: string): Promise<ScanRecord[]> {
  const lowerQuery = query.toLowerCase();
  const allScans = await db.scans.toArray();
  
  return allScans.filter((scan) => {
    // Search in raw text
    if (scan.ocrRaw.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in structured fields
    const fieldsMatch = scan.ocrStructured.fields?.some((field) =>
      field.value.toLowerCase().includes(lowerQuery)
    );
    if (fieldsMatch) return true;
    
    // Search in title
    if (scan.ocrStructured.title?.toLowerCase().includes(lowerQuery)) return true;
    
    return false;
  });
}

// Update
export async function updateScan(
  id: string,
  updates: Partial<Omit<ScanRecord, 'id'>>
): Promise<void> {
  await db.scans.update(id, updates);
}

export async function markScanAsEdited(id: string): Promise<void> {
  await db.scans.update(id, { edited: true });
}

// Delete
export async function deleteScan(id: string): Promise<void> {
  await db.scans.delete(id);
}

export async function deleteMultipleScans(ids: string[]): Promise<void> {
  await db.scans.bulkDelete(ids);
}

export async function deleteAllScans(): Promise<void> {
  await db.scans.clear();
}

// Cleanup
export async function cleanupOldScans(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const oldScans = await db.scans
    .where('timestamp')
    .below(cutoffDate)
    .toArray();
  
  if (oldScans.length > 0) {
    await db.scans.bulkDelete(oldScans.map((scan) => scan.id!));
  }
  
  return oldScans.length;
}

// Analytics helpers
export async function getTotalScansCount(): Promise<number> {
  return db.scans.count();
}

export async function getScansCountByDateRange(
  startDate: Date,
  endDate: Date
): Promise<number> {
  return db.scans
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .count();
}

export async function getTopProducts(limit: number = 10): Promise<Array<{ name: string; count: number }>> {
  const allScans = await db.scans.toArray();
  const productCounts = new Map<string, number>();
  
  allScans.forEach((scan) => {
    const productName = scan.ocrStructured.fields?.find(
      (f) => f.field.toLowerCase().includes('product') || f.field.toLowerCase().includes('name')
    )?.value;
    
    if (productName) {
      productCounts.set(productName, (productCounts.get(productName) || 0) + 1);
    }
  });
  
  return Array.from(productCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
```

### React Hooks

**src/hooks/useScans.ts**:
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';
import {
  getAllScans,
  getScanById,
  createScan,
  updateScan,
  deleteScan,
  searchScans,
  cleanupOldScans,
} from '@/db/queries';
import type { ScanRecord } from '@/db/schema';

export function useScans(options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp';
  order?: 'asc' | 'desc';
}) {
  const scans = useLiveQuery(
    () => getAllScans(options),
    [options?.limit, options?.offset, options?.sortBy, options?.order]
  );
  
  return scans;
}

export function useScan(id: string | undefined) {
  const scan = useLiveQuery(
    () => (id ? getScanById(id) : undefined),
    [id]
  );
  
  return scan;
}

export function useSearchScans(query: string) {
  const results = useLiveQuery(
    () => (query ? searchScans(query) : []),
    [query]
  );
  
  return results;
}

export function useScansCount() {
  const count = useLiveQuery(() => db.scans.count());
  return count;
}

// Mutation helpers (not reactive, use for actions)
export function useScanMutations() {
  return {
    createScan,
    updateScan,
    deleteScan,
    cleanupOldScans,
  };
}
```

### Quota Error Handling

**src/lib/db-utils.ts**:
```typescript
export function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    );
  }
  return false;
}

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
} | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }
  
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
  
  return { usage, quota, percentUsed };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

### Automatic Cleanup on App Start

**src/main.tsx** (update):
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { cleanupOldScans } from './db/queries'

// Run cleanup on app start
cleanupOldScans(90).then((deletedCount) => {
  if (deletedCount > 0) {
    console.log(`[DB Cleanup] Deleted ${deletedCount} scans older than 90 days`);
  }
}).catch((error) => {
  console.error('[DB Cleanup] Failed:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Validation

1. **Type safety**: All database operations must be type-safe (no `any`)
2. **Error handling**: Catch and handle IndexedDB errors (quota, not found, etc.)
3. **Cleanup**: Auto-delete scans older than 90 days on app start
4. **Search**: Case-insensitive search across raw text and structured fields
5. **Performance**: Use indexes for timestamp and edited fields

### Error Handling

- **Quota exceeded**: Detect via `isQuotaExceededError()`, prompt user to delete old scans
- **Not found**: Return `undefined` for missing records (do not throw)
- **Bulk operations**: If one item fails, continue with others (log errors)
- **Cleanup failure**: Log error but do not block app startup

---

## ACCEPTANCE CRITERIA

### AC-001: Create Scan
- **Given**: User has captured an image and received OCR results
- **When**: `createScan()` is called with scan data
- **Then**:
  - New scan record is added to IndexedDB
  - UUID is generated and returned
  - Record includes timestamp, imageBlob, ocrRaw, ocrStructured, tokenUsage

### AC-002: Read Scan
- **Given**: Scan with ID "abc-123" exists in database
- **When**: `getScanById("abc-123")` is called
- **Then**:
  - Scan record is returned with all fields
  - If ID does not exist, `undefined` is returned

### AC-003: List Scans
- **Given**: Database contains 100 scans
- **When**: `getAllScans({ limit: 20, offset: 0 })` is called
- **Then**:
  - 20 most recent scans are returned
  - Scans are sorted by timestamp (newest first)

### AC-004: Search Scans
- **Given**: Database contains scans with "Invoice #12345" in raw text
- **When**: `searchScans("12345")` is called
- **Then**:
  - All scans containing "12345" in raw text or structured fields are returned
  - Search is case-insensitive

### AC-005: Update Scan
- **Given**: Scan with ID "abc-123" exists
- **When**: `updateScan("abc-123", { edited: true })` is called
- **Then**:
  - Scan record is updated with `edited: true`
  - Other fields remain unchanged

### AC-006: Delete Scan
- **Given**: Scan with ID "abc-123" exists
- **When**: `deleteScan("abc-123")` is called
- **Then**:
  - Scan record is removed from database
  - Subsequent `getScanById("abc-123")` returns `undefined`

### AC-007: Cleanup Old Scans
- **Given**: Database contains scans from 100 days ago
- **When**: `cleanupOldScans(90)` is called
- **Then**:
  - Scans older than 90 days are deleted
  - Function returns count of deleted scans
  - Recent scans (< 90 days) are not affected

### AC-008: React Hooks
- **Given**: Component uses `useScans()` hook
- **When**: New scan is added to database
- **Then**:
  - Component re-renders with updated scan list
  - No manual refresh needed (live query)

### AC-009: Quota Error Handling
- **Given**: IndexedDB quota is exceeded
- **When**: `createScan()` is called
- **Then**:
  - `isQuotaExceededError()` returns true
  - Error is caught and handled gracefully
  - User is notified to delete old scans

### AC-010: Storage Estimate
- **Given**: App is running
- **When**: `getStorageEstimate()` is called
- **Then**:
  - Returns usage, quota, and percentUsed
  - Values are formatted as human-readable (e.g., "5.2 MB / 50 MB")

---

## CONSTRAINTS

### DO NOT:
- ❌ Use localStorage for scan data — must use IndexedDB
- ❌ Store uncompressed images — compress before storing (TIP-008)
- ❌ Implement sync to server — local-only for POC
- ❌ Add encryption — out of scope for POC
- ❌ Create migration system — single version schema for MVP
- ❌ Implement undo/redo — out of scope

### REUSE:
- ✅ Dexie.js for IndexedDB operations
- ✅ dexie-react-hooks for live queries
- ✅ Existing schema from TIP-002 (`src/db/schema.ts`)
- ✅ TypeScript strict mode for type safety

### SKIP (out of scope for TIP-004):
- ⏭️ Image compression (will be in TIP-008)
- ⏭️ Export to Excel (will be in TIP-012)
- ⏭️ Analytics caching (will be in TIP-015)
- ⏭️ Offline sync
- ⏭️ Data encryption

---

## COMPLETION CHECKLIST

- [ ] `src/db/queries.ts` created with all CRUD operations
- [ ] `src/hooks/useScans.ts` created with React hooks
- [ ] `src/lib/db-utils.ts` created with quota error handling
- [ ] `src/main.tsx` updated with automatic cleanup
- [ ] Create scan works (returns UUID)
- [ ] Read scan works (returns record or undefined)
- [ ] List scans works (pagination, sorting)
- [ ] Search scans works (case-insensitive, full-text)
- [ ] Update scan works (partial updates)
- [ ] Delete scan works (single and bulk)
- [ ] Cleanup old scans works (90-day policy)
- [ ] React hooks work (live queries)
- [ ] Quota error handling works
- [ ] Storage estimate works
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-004 | Generated: 2026-05-05 | Vibecode Kit v5.0*
