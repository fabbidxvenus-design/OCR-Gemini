# TIP-077: OCR Result E2E Table Locators

## HEADER
- TIP-ID: TIP-077
- Project: OCR Gemini Mobile Web POC
- Module: OCR result Playwright E2E
- Priority: P0
- Depends on: TIP-009, TIP-038, TIP-070, TIP-072, TIP-076
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Playwright E2E. [SoT: `coding-packs/00-PROJECT-CONTEXT.md`]
- Key files to read first:
  - `e2e/ocr-result.spec.ts`
  - `src/pages/OCRResultPage.tsx`
  - `src/components/ui/ScanFieldsTable.tsx`
  - `src/components/ui/FieldRow.tsx`
  - `src/lib/scanFields.ts`
  - `src/lib/fieldCategories.ts`
- Patterns to follow:
  - Current OCR result UI renders `ScanFieldsTable` fixed rows, not legacy `Thông tin chính` / `Thông tin khác` field-card sections.
  - Existing route mocking in `e2e/ocr-result.spec.ts` should use `**/api/scans**` with URL-based dispatch for both scan list and scan detail endpoints.
  - Use role/text/table-row assertions that match user-visible labels instead of brittle implementation-only card selectors.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — verify mobile-first behavior across mobile, tablet, and desktop Playwright projects.

## TASK
Update `e2e/ocr-result.spec.ts` so the OCR result E2E tests assert the current table-based UI instead of stale legacy field-card sections. The production app already builds and the unit categorization test proves `契約No.` and `CT No.` classify as main fields; the failing E2E selectors are outdated and must be rewritten to match `ScanFieldsTable` rows and fixed bottom action buttons.

## SPECIFICATIONS
### Business Rules
1. Keep the existing categorization unit-level test coverage for Japanese and contract field variants.
2. Replace assertions that depend on legacy section headings (`Thông tin chính`, `Thông tin khác`) or `.rounded-2xl` field cards.
3. Assert current fixed scan-field table rows are visible using labels from `src/lib/scanFields.ts`:
   - `Mã vạch`
   - `Tên/Mã sản phẩm`
   - `Số lượng (Qty/Size)`
   - `Contract No. (Số HĐ)`
4. Assert mocked OCR values render in the expected rows:
   - product value `Widget A`
   - contract value `CONT-001`
   - product value `Test Product` in the second E2E case
5. Assert OCR result action buttons remain visible and accessible by name across Playwright projects:
   - `Chụp`
   - `Sửa`
   - `Copy`
   - `Chia sẻ`
6. Preserve the existing mobile/tablet/desktop Playwright project coverage.
7. Do not change production source code for this TIP unless the test reveals a new app bug with clear evidence after selector updates.

### Validation
- Run `npm run build` before E2E to confirm production code still compiles.
- Run `npx playwright test e2e/ocr-result.spec.ts --reporter=list`.
- Expected result: all 9 focused tests pass across `mobile`, `tablet`, and `desktop`.
- If failures remain, inspect Playwright error context and update only the stale test selector or mock setup that is proven wrong.

### Error Handling
- If `/api/scans` mocks do not intercept the detail endpoint, keep the `**/api/scans**` route and dispatch by URL path instead of adding arbitrary waits.
- If a row is not found, assert against `table tbody tr` with `filter({ hasText: ... })` rather than broad page text that can match unrelated content.
- If Playwright fails because the dev server is unavailable, use the project’s Playwright config/webServer behavior or start the dev server on the configured port; do not change app routing.

## ACCEPTANCE CRITERIA
- Given a mocked OCR scan containing `商品名`, `サイズ`, `数量`, `契約No.`, and `CT No.` When `/ocr-result/:scanId` loads Then `ScanFieldsTable` rows for product, quantity, and contract are visible and the contract row contains `CONT-001`.
- Given the OCR result page renders on mobile, tablet, and desktop When the focused Playwright spec runs Then the action buttons `Chụp`, `Sửa`, `Copy`, and `Chia sẻ` are visible by accessible name.
- Given the current table-based UI When `e2e/ocr-result.spec.ts` runs Then no assertion relies on `Thông tin chính`, `Thông tin khác`, or `.rounded-2xl` field-card selectors.
- Given the updated tests When `npx playwright test e2e/ocr-result.spec.ts --reporter=list` completes Then all 9 tests pass across configured projects.

## CONSTRAINTS
- DO NOT: change backend/API behavior, OCR parsing, field categorization logic, dependencies, routing, or production UI layout for this stale-selector fix.
- DO NOT: add arbitrary sleeps or brittle CSS-only selectors when a semantic role/text/table-row locator is available.
- DO NOT: remove coverage for Japanese contract field variants.
- REUSE: existing `ScanFieldsTable` labels from `src/lib/scanFields.ts`, current Playwright route mock pattern, and existing auth seeding helper.
- SKIP: broad E2E suite rewrites, visual redesign, and new test infrastructure.

## Quality Gate: Self-Review
- Completeness: 12/12 `/vibecode:tip` checklist items passed.
- Cross-reference: Consistent with `coding-packs/00-PROJECT-CONTEXT.md`, `coding-packs/01-REQUIREMENTS-MATRIX.md`, `coding-packs/02-TASK-GRAPH.md`, and UI standard `coding-packs/standards/ui/mobile-first-responsive.md`.
- Gaps: None.
- Action needed: Implement TIP-077, then verify build plus focused Playwright spec.
