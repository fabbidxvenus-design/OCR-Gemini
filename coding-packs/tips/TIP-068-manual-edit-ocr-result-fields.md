# TIP-068: Manual Edit OCR Result Fields After Failed Recognition

## HEADER
- TIP-ID: TIP-068
- Project: OCR Gemini Mobile Web POC
- Module: OCR Result / Editing
- Priority: P0
- Depends on: TIP-009, TIP-010, TIP-038, TIP-041
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Dexie 4.4.x, Vitest + Testing Library, as scanned in `coding-packs/00-PROJECT-CONTEXT.md`.
- Key files to read first:
  - `src/pages/OCRResultPage.tsx`
  - `src/pages/EditPage.tsx`
  - `src/pages/HistoryDetailPage.tsx`
  - `src/components/ui/ScanFieldsTable.tsx`
  - `src/components/ui/FieldRow.tsx`
  - `src/components/ui/FieldsStatusBar.tsx`
  - `src/components/ui/ARSection.tsx`
  - `src/lib/scanFields.ts`
  - `src/hooks/useScans.ts`
  - `src/db/schema.ts`
  - `src/__tests__/pages/OCRResultPage.test.tsx`
  - `src/__tests__/pages/HistoryDetailPage.test.tsx`
- Patterns to follow:
  - Result/detail pages are read-oriented and navigate to `/edit/:scanId` for manual correction.
  - Persist scan changes through existing scan update helpers; do not mutate `ScanRecord` objects in place.
  - Use mobile-first fixed bottom actions with safe-area aware spacing and visible focus states.

## APPLICABLE STANDARDS
Builder MUST conform to:
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — mobile-first layout, 375px base, tablet+ progressive enhancement.
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — immutable `ScanRecord` updates through Dexie helpers.

## TASK
Implement a reliable manual correction path for OCR results when OCR fails to recognize one or more required business fields. The OCR result page must make it obvious that users can tap `Sửa`, manually fill missing/incorrect fields on the edit page, save, and return to the result page with corrected data persisted.

This TIP does not change the OCR model or backend prompt. It normalizes the UI/editing contract so missing OCR fields are still editable and saved consistently.

## SPECIFICATIONS

### Business Rules
1. Required business fields must always be available for manual correction even if OCR does not detect them:
   - `Barcode`
   - `Lot No.`
   - `Product Name`
   - `Quantity`
   - `Contract No.`
2. Raw OCR / AR text must remain visible and editable or reviewable according to the existing EditPage/AR section pattern.
3. On `OCRResultPage`, if any required field is missing or empty, show a review state and make `Sửa` the primary recovery action for correction.
4. On `/edit/:scanId`, missing required fields must appear as editable inputs with an empty value rather than disappearing from the form.
5. Saving the edit must persist the corrected `ocrStructured` data and set `edited: true`.
6. After save, the user must return to `/ocr-result/:scanId` or the appropriate detail/result route and see the corrected field values immediately.
7. History detail must render the same normalized field set so saved corrections are visible later.
8. Do not treat missing OCR fields as a fatal OCR failure if a scan record exists; this is a review/edit workflow.

### Validation
1. On save, all five required fields must exist in the saved structured data.
2. Required fields may initially be empty after OCR, but the edit UI must label them as missing/needs review.
3. If validation currently blocks empty required values, it must block only final save from EditPage and show inline field-level messages.
4. `Quantity` must accept the existing app's quantity format. Do not introduce stricter format validation unless already present.
5. Preserve unknown/extra OCR fields by appending them after the five required fields or under the existing `other` grouping.
6. Preserve raw OCR text and notes when saving corrected structured fields.

### Error Handling
1. If scan data is still loading, show the existing skeleton/loading UI; do not render partial edit controls that cannot save.
2. If scan ID is missing or no scan exists, show the existing not-found/error UI with a route back to camera/history.
3. If save fails, show a user-facing toast and keep the user on the edit page with their entered values intact.
4. If the user cancels with unsaved changes, use the existing unsaved-change confirmation pattern.
5. Do not silently discard fields that were added manually or returned by OCR but are not part of the five required fields.

## ACCEPTANCE CRITERIA
- Given OCR returns only `Barcode` and raw OCR text, When the user opens `Kết quả OCR`, Then the page shows a review/needs-check state and the user can tap `Sửa`.
- Given a scan is missing `Lot No.`, `Product Name`, `Quantity`, and `Contract No.`, When the user opens `/edit/:scanId`, Then all five required fields are visible as editable inputs, with missing fields empty and marked for review.
- Given the user fills missing required fields on the edit page, When the user taps `Lưu`, Then the scan record is updated immutably, `edited` is set to true, and the user is returned to the result page.
- Given the user saved corrected data, When `OCRResultPage` reloads, Then corrected values appear in the field table and the missing-field count decreases.
- Given corrected data is saved, When the user opens `HistoryDetailPage` for the scan, Then the corrected values appear there too.
- Given OCR returns extra fields not in the five required fields, When the user saves manual corrections, Then extra fields are preserved and still displayed in the appropriate existing section.
- Given save fails due to storage/update error, When the user taps `Lưu`, Then a toast explains the save failed and the form values remain visible.
- Given an iPhone 14/mobile viewport, When the result page renders, Then the fixed bottom actions including `Sửa` remain visible, tappable, and not hidden behind the bottom nav/home indicator.

## CONSTRAINTS
- DO NOT: Change OCR provider, model tier selection, or OpenRouter integration.
- DO NOT: Require OCR to return all five fields before creating or saving a scan.
- DO NOT: Drop raw OCR text, notes, extra fields, image data, token usage, or model tier when saving manual edits.
- DO NOT: Mutate `scan.ocrStructured.fields` in place.
- DO NOT: Add a backend or migration for this TIP.
- DO NOT: Hide the edit action just because OCR output is incomplete.
- REUSE: Existing `/edit/:scanId` route and EditPage save flow.
- REUSE: Existing `ScanFieldsTable`, `FieldRow`, `FieldsStatusBar`, `ARSection`, `scanFields` helpers, and field categorization utilities where applicable.
- REUSE: Existing `updateScan`/scan persistence helpers from `useScans` or repository layer.
- SKIP: OCR prompt tuning, real field-detection improvements, Excel export changes, bulk edit, undo/redo, and multi-user sync.

## IMPLEMENTATION NOTES
1. Prefer a single normalization helper in `src/lib/scanFields.ts`, for example `normalizeEditableScanFields(fields, rawText?)`, that returns the five required fields in stable order plus any extra OCR fields.
2. Use that helper in both display and edit surfaces to avoid result/edit/history disagreement.
3. Ensure the helper is pure and returns new arrays/objects.
4. Add or update tests for missing-field OCR responses, manual save, and result/detail display after correction.
5. Re-run focused tests for OCR result, edit page, and history detail, then run `npm run build`.

## QUALITY GATE
- Self-contained: PASS — files, rules, validation, and acceptance scenarios are specified.
- Buildable scope: PASS — one cohesive UI/editing contract change; no backend/provider changes.
- Standards matched: PASS — UI mobile-first and scan immutability standards included.
- Acceptance coverage: PASS — covers missing OCR fields, manual correction, save, result reload, history detail, mobile action visibility, and save failure.
- Known gaps: Existing code may already partially implement `scanFields` helpers; builder must inspect current implementation before adding new abstractions to avoid duplication.
