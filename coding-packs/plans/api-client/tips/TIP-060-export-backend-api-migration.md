# TIP-060: Export Backend API Migration

## HEADER
- TIP-ID: TIP-060
- Project: ocr-mobile-web
- Module: export-api
- Priority: P1
- Depends on: TIP-055, TIP-057
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, ExcelJS currently runs in browser, backend API target `localhost:3001`
- Key files to read first:
  - `src/lib/apiClient.ts`
  - `src/lib/excel.ts`
  - `src/hooks/useExport.ts`
  - `src/lib/share.ts`
  - `src/hooks/useShare.ts`
  - `src/pages/HistoryPage.tsx`
  - `src/pages/HistoryDetailPage.tsx`
- Patterns to follow:
  - Existing export hook state shape (`isExporting`, `error`)
  - Existing mobile fallback chain for saving/sharing blobs
  - Existing multi-select export UX in HistoryPage

## APPLICABLE STANDARDS
Builder MUST conform to:
- [export/excel-mobile-fallback](../standards/export/excel-mobile-fallback.md) — preserve share/file-picker/download fallback chain
- [export/excel-multi-sheet-structure](../standards/export/excel-multi-sheet-structure.md) — preserve workbook structure if backend generates file
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — centralized API error mapping

## TASK
Move Excel workbook generation from browser-side ExcelJS to backend export endpoints where available, while preserving the existing frontend save/share behavior for the returned `.xlsx` blob.

## SPECIFICATIONS
### Business Rules
1. Single-scan export must call backend export endpoint instead of generating workbook in browser.
2. Multi-scan export must call backend export endpoint with selected scan IDs.
3. Frontend must receive an `.xlsx` blob and then use existing mobile save/share fallback behavior.
4. Browser-side ExcelJS can remain temporarily only if not imported by default route bundles after migration.
5. Export UX must remain unchanged: same buttons, loading state, success/error behavior.

### Files to Create
- `src/lib/exportApi.ts`

### Files to Modify
- `src/hooks/useExport.ts`
- `src/lib/excel.ts` or replace with blob-save utility if ExcelJS no longer needed in browser
- `src/pages/HistoryPage.tsx` if export payload changes from scan objects to scan IDs
- `src/pages/HistoryDetailPage.tsx` if export payload changes from scan object to scan ID

### Backend Endpoint Contract
Assume these endpoints unless backend differs:
- `GET /export/scans/:id.xlsx` → binary `.xlsx` blob
- `POST /export/scans.xlsx` with `{ ids: string[] }` → binary `.xlsx` blob

### Validation
1. Single export requires a valid scan id.
2. Multi-export requires at least one selected id.
3. Response `Content-Type` should be Excel MIME type when available.
4. Blob size must be greater than 0 before sharing/downloading.

### Error Handling
1. Backend offline: show existing export error message.
2. 404 scan missing: show `Không tìm thấy scan để xuất`.
3. Empty blob: show `File Excel trả về không hợp lệ`.
4. Share API cancellation must not be treated as failed export if download fallback succeeds.

## ACCEPTANCE CRITERIA
- Given user clicks export on a detail page When scan exists Then frontend calls `GET /export/scans/:id.xlsx` and downloads/shares returned blob.
- Given user selects multiple scans When export is clicked Then frontend calls `POST /export/scans.xlsx` with selected ids.
- Given backend returns `.xlsx` blob When export succeeds Then existing mobile fallback chain shares/saves/downloads the file.
- Given backend is offline When user exports Then UI shows export error and does not attempt browser ExcelJS generation as fallback.
- Given user cancels Web Share When fallback download succeeds Then export is treated as successful.
- Given no scans are selected When export button would run Then no API call is made.

## CONSTRAINTS
- DO NOT change export button placement or multi-select UX.
- DO NOT keep browser ExcelJS as hidden fallback after backend migration unless explicitly approved.
- DO NOT migrate scan CRUD or OCR here.
- REUSE existing blob save/share fallback logic from `src/lib/excel.ts` where possible.
- SKIP backend export implementation.

## QUALITY GATE SELF-REVIEW
- [x] TIP scopes backend export migration only.
- [x] Preserves mobile browser fallback behavior.
- [x] Acceptance criteria cover single, multi, offline, cancellation, and empty selection.
- Gap: backend export endpoint names may need alignment with actual service.
