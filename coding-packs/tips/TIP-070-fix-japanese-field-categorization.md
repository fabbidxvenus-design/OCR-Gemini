# TIP-070: Fix Japanese Contract Field Categorization

## HEADER
- TIP-ID: TIP-070
- Project: OCR Gemini Mobile Web POC
- Module: Field Categorization Bugfix / E2E Regression Fix
- Priority: P0
- Depends on: TIP-038
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Vitest + Testing Library + Playwright, as documented in `coding-packs/00-PROJECT-CONTEXT.md`.
- Key files to read first:
  - `src/lib/fieldCategories.ts` — field categorization patterns and `MAIN_FIELD_PATTERNS`
  - `src/components/ui/ScanFieldsTable.tsx` — uses categorization to render main vs other sections
  - `e2e/ocr-result.spec.ts` — failing E2E tests for field categorization
  - `e2e/screenshots/ocr-result-repro.png` — screenshot proof of bug
- Patterns to follow:
  - Match existing regex pattern style in `MAIN_FIELD_PATTERNS` and `OTHER_FIELD_PATTERNS`.
  - Keep categorization logic in `fieldCategories.ts`; do not duplicate logic in UI components.
  - E2E tests should pass after fix without changing test assertions.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — mobile-first responsive layout pattern.
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — scan record update patterns.

[Or "none" if no standards index or none applicable]

## TASK
Fix the OCR result field categorization so that Japanese contract fields "契約No." and "CT No." are correctly categorized as "Thông tin chính" (main) instead of "Thông tin khác" (other). The root cause is missing regex patterns in `fieldCategories.ts` that should match these exact field names. Existing E2E tests in `e2e/ocr-result.spec.ts` fail across all viewports (mobile/tablet/desktop) due to this categorization error.

## SPECIFICATIONS

### Business Rules
1. Japanese contract number fields "契約No." and "CT No." (with capital N, with/without period) must be categorized as "main" and appear in the "Thông tin chính" section.
2. The fix must add missing regex patterns to `MAIN_FIELD_PATTERNS` in `src/lib/fieldCategories.ts`.
3. The fix must not change existing categorization for other fields (barcode, lotNo, productName, quantity, contractNo patterns).
4. The fix must handle both with and without period variants: "契約No.", "契約No", "CT No.", "CT No".
5. The fix must be case-insensitive to handle "契約no.", "CT NO.", etc.

### Validation
1. Run `npm run build` successfully.
2. Run `npx tsc --noEmit` successfully.
3. Run `npx eslint --max-warnings 0 src/` successfully.
4. Run focused E2E spec: `npx playwright test e2e/ocr-result.spec.ts --reporter=line` and confirm the field categorization tests pass on all viewports.
5. Run unit tests for `fieldCategories` if they exist: `npm exec vitest run src/__tests__/lib/fieldCategories.test.ts` or similar.

### Error Handling
1. If existing categorization tests exist, ensure they still pass after the fix.
2. No user-facing error messages needed — this is a silent categorization correctness fix.

## ACCEPTANCE CRITERIA
- Given the OCR result page renders a scan with fields "契約No." and "CT No." When the page displays field sections Then both fields appear in the "Thông tin chính" section, not "Thông tin khác".
- Given the OCR result page renders with all existing field patterns (barcode, lotNo, productName, quantity, contractNo) When the page displays field sections Then existing categorization behavior is unchanged.
- Given all field categorization fixes are applied When build/type/lint/E2E tests run Then all verification commands pass on all viewports.
- Given the fix handles case variants "契約No.", "契約no.", "CT No.", "CT NO." When categorization runs Then all variants are correctly identified as main fields.
- Given the fix handles both period and no-period variants "契約No.", "契約No" and "CT No.", "CT No" When categorization runs Then all variants are correctly identified as main fields.

## CONSTRAINTS
- DO NOT: add new dependencies, change OCR model behavior, redesign UI pages, or alter backend API contracts.
- DO NOT: use multiple writer agents. `gsd-executor` must be the sole code writer for this TIP.
- DO NOT: change E2E test assertions — fix the implementation to match existing test expectations.
- DO NOT: introduce `console.log` debug output.
- REUSE: existing regex pattern style from `MAIN_FIELD_PATTERNS` and `OTHER_FIELD_PATTERNS`.
- REUSE: existing Playwright E2E specs under `e2e/`.
- SKIP: broad architecture cleanup, dependency upgrades, and productization polish not tied to this categorization bug.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS — includes evidence, file paths, root cause, behavior, and validation commands.
- One cohesive implementation unit: PASS — single regex pattern fix in `fieldCategories.ts`.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Applicable standards listed: PASS — matched mobile-first and scan immutability context.
- Constraints prevent overreach: PASS — single file change, no architecture changes.
- Known gaps: None — root cause is clear (missing regex patterns), fix is minimal, tests already exist to verify behavior.