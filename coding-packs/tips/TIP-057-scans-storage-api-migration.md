# TIP-057: Scan Storage API Migration

## HEADER
- TIP-ID: TIP-057
- Project: ocr-mobile-web
- Module: scans-api
- Priority: P0
- Depends on: TIP-055
- Estimated: L

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, Dexie currently used for local scan storage, backend API target `localhost:3001`
- Key files to read first:
  - `src/lib/apiClient.ts`
  - `src/hooks/useScans.ts`
  - `src/db/schema.ts`
  - `src/App.tsx`
  - `src/pages/HistoryPage.tsx`
  - `src/pages/HistoryDetailPage.tsx`
  - `src/pages/EditPage.tsx`
  - `src/pages/OCRResultPage.tsx`
  - `src/lib/scanFilters.ts`
  - `src/lib/scanDisplayName.ts`
- Patterns to follow:
  - Existing `useScans`, `useScan`, `createScan`, `updateScan`, `deleteScan` public API shape where practical
  - Existing `ScanRecord` type semantics
  - Existing immutable update behavior

## APPLICABLE STANDARDS
Builder MUST conform to:
- [database/dexie-live-queries](../standards/database/dexie-live-queries.md) — current Dexie behavior to replace with API-backed reactivity
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — preserve immutable scan update semantics
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — centralized API error mapping

## TASK
Replace scan CRUD reads/writes from Dexie with backend API calls to `localhost:3001`. Preserve the existing frontend hook/function API as much as possible so pages require minimal changes.

## SPECIFICATIONS
### Business Rules
1. Scan list/detail must load from backend API, not `db.scans`.
2. Creating a scan after OCR must call backend `POST /scans`.
3. Editing scan fields/raw text must call backend update endpoint.
4. Deleting scans must call backend delete endpoint.
5. History search/filter/sort may remain client-side after fetching, unless backend supports query params.
6. Existing display logic (`scanDisplayName`, `filterAndSortScans`) must continue to work.

### Files to Create
- `src/lib/scansApi.ts`

### Files to Modify
- `src/hooks/useScans.ts`
- `src/App.tsx`
- `src/pages/HistoryPage.tsx` if hook return shape changes
- `src/pages/HistoryDetailPage.tsx` if hook return shape changes
- `src/pages/EditPage.tsx` if update function shape changes
- `src/pages/OCRResultPage.tsx` if scan detail shape changes

### Backend Endpoint Contract
Assume these endpoints unless backend differs:
- `GET /scans?limit=100&order=desc` → `ScanRecord[]`
- `GET /scans/:id` → `ScanRecord`
- `POST /scans` → `{ id: string }` or full `ScanRecord`
- `PATCH /scans/:id` → updated `ScanRecord`
- `DELETE /scans/:id` → `204`
- `POST /scans/cleanup` → `{ deletedCount: number }`
- `GET /scans/stats/api-keys` → `{ key1Count, key2Count, key1Cost, key2Cost }`

### Validation
1. Convert backend timestamp strings to `Date` objects if UI expects `Date`.
2. Ensure `imageDataUrl`, `ocrStructured`, `tokenUsage`, `apiKeyIndex`, and `edited` are present before rendering.
3. Update payloads must be partial and must not mutate existing scan objects.
4. Empty results must return `[]`, not `undefined`, after loading completes.

### Error Handling
1. Backend offline: pages show existing loading/error UI instead of blank screens.
2. 404 for scan detail: navigate back to `/history` or show not-found message.
3. Update failure: keep user edits in form state and show error.
4. Delete failure: do not remove item optimistically unless rollback is implemented.

## ACCEPTANCE CRITERIA
- Given backend has scans When user opens History Then scan list is fetched from `GET /scans` and displayed.
- Given user opens scan detail When scan exists Then frontend fetches `GET /scans/:id` and renders the same UI as before.
- Given camera OCR completes When app saves scan Then frontend calls `POST /scans` and navigates to the returned scan id.
- Given user edits structured fields When save succeeds Then frontend calls `PATCH /scans/:id` and updated data appears in detail/history.
- Given backend returns 404 for detail When page loads Then UI handles missing scan gracefully.
- Given backend is offline When History loads Then UI shows a user-friendly error and does not read Dexie as fallback.

## CONSTRAINTS
- DO NOT keep Dexie as fallback for scan CRUD after this TIP.
- DO NOT change `ScanRecord` semantics unless all page usages are updated.
- DO NOT implement OCR API migration here; `createScan` may still receive OCR output from existing OCR flow.
- REUSE `scanDisplayName` and `filterAndSortScans`.
- SKIP analytics/settings/export migration.

## QUALITY GATE SELF-REVIEW
- [x] TIP focuses on scan storage migration only.
- [x] Dexie replacement behavior is explicit.
- [x] Endpoint contract and data conversion requirements are clear.
- [x] Acceptance criteria cover list/detail/create/update/error paths.
- Gap: if backend supports server-side filtering, builder may optionally wire query params but must preserve current UI behavior.
