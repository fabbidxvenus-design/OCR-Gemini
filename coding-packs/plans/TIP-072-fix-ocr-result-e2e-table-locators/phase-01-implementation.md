# Phase 01: TIP-072 Implementation Plan

## Goal

Fix the focused OCR result Playwright E2E failures caused by stale `.rounded-2xl` card selectors. Align `e2e/ocr-result.spec.ts` with the current `ScanFieldsTable` table-row UI without changing product UI or OCR logic unless a real non-test bug is proven.

## Context

Root cause: `OCRResultPage` renders OCR fields through `ScanFieldsTable` and `FieldRow`, which produce `<table><tbody><tr>...` rows with Vietnamese fixed-field labels. The E2E test still expects old field cards under headings such as `Thông tin chính` / `Thông tin khác` and locates `.rounded-2xl` cards, causing false failures unrelated to TIP-070/TIP-071 behavior.

## Implementation Steps

1. **Update `e2e/ocr-result.spec.ts` only**:
   - Replace `.rounded-2xl` card counting in the first E2E with assertions against the current table UI.
   - Use robust locators around visible row text, such as row filtering by `Hợp đồng` / `Tên sản phẩm` labels and expected values.
   - Preserve the existing auth seeding and route mocks.
   - Keep assertions meaningful: verify mapped contract/product values are visible, not just that the page loads.

2. **First E2E behavior**:
   - Remove assumptions that `Thông tin chính`, `Thông tin khác`, `p.text-caption`, and card counts exist.
   - Assert that the page displays core fixed-field labels from `ScanFieldsTable`.
   - Assert a contract value from mocked `契約No.` / `CT No.` is visible in the Contract No row area.
   - If duplicate mapped fields resolve to the first matching value, assert that behavior explicitly and do not require all duplicate source fields to render.

3. **Second E2E behavior**:
   - Replace `page.locator('.rounded-2xl').filter({ hasText: 'Test Product' })` with a table-row-visible assertion for `Tên sản phẩm` / `Test Product`.
   - Remove confidence badge assertions if confidence is not visible in current `FieldRow` UI.

4. **Run verification**:
   ```powershell
   npx playwright test e2e/ocr-result.spec.ts --reporter=line
   npm run build
   npx tsc --noEmit
   npx eslint --max-warnings 0 src/
   npm exec vitest run
   ```
   If E2E still fails for unrelated routing/server/auth issues, document evidence and keep the test-locator fix narrow.

5. **Review**:
   - Run a TypeScript/JavaScript code review on the diff.
   - Fix only HIGH/CRITICAL review findings in scope.

## Constraints

- `gsd-executor` is the only code writer.
- Do not redesign `OCRResultPage`, `ScanFieldsTable`, or `FieldRow` for this TIP.
- Do not add dependencies.
- Do not weaken E2E to generic page-load-only assertions.
- Do not change unrelated E2E files.
- Preserve TIP-070 field categorization behavior and TIP-071 error-state behavior.

## Success

Focused OCR result E2E no longer fails because of card-vs-table locator mismatch, and build/type/lint/vitest remain green or any remaining E2E infrastructure blocker is documented with evidence.
