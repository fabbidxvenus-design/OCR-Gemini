# TIP-072: Fix OCR Result E2E Table Locators

## HEADER
- TIP-ID: TIP-072
- Project: OCR Gemini Mobile Web POC
- Module: OCR Result E2E Coverage
- Priority: P0
- Depends on: TIP-070, TIP-071
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Vitest + Playwright, as documented in `coding-packs/00-PROJECT-CONTEXT.md`.
- Key files to read first:
  - `e2e/ocr-result.spec.ts` — currently asserts field cards through `.rounded-2xl` selectors.
  - `src/pages/OCRResultPage.tsx` — renders OCR result detail through `ScanFieldsTable`.
  - `src/components/ui/ScanFieldsTable.tsx` — renders fixed scan fields as table rows plus AR section.
  - `src/components/ui/FieldRow.tsx` — row labels use Vietnamese fixed-field labels and values.
  - `src/lib/scanFields.ts` — canonical fixed fields and field matching.
- Patterns to follow:
  - Prefer accessible/user-visible locators (`getByText`, `getByRole`, table row filtering) over implementation-only style classes.
  - Keep test assertions aligned with current product UI; do not redesign the page to satisfy obsolete test locators.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — preserve existing mobile-first OCR result layout and avoid UI regressions.

## TASK
Fix the focused Playwright E2E failures in `e2e/ocr-result.spec.ts` caused by stale `.rounded-2xl` field-card locators. The OCR result page now renders fixed scan fields in `ScanFieldsTable`, so the E2E test must assert the table UI and actual visible field labels/values instead of expecting card markup.

## SPECIFICATIONS

### Business Rules
1. E2E assertions must validate current OCR result behavior, not obsolete card implementation details.
2. Contract fields such as `契約No.` and `CT No.` must be verified as mapped into the fixed Contract No row/value area, not into an old "Thông tin khác" card section.
3. Product fields must be verified through the visible table row label/value pair rendered by `FieldRow`.
4. Numeric or unknown fields should not be asserted through stale "other cards" unless current UI actually renders them in a visible section.
5. Do not change OCR field categorization logic unless the E2E fix proves a real product bug beyond locator mismatch.

### Validation
1. Run focused E2E: `npx playwright test e2e/ocr-result.spec.ts --reporter=line`.
2. Run `npm run build`.
3. Run `npx tsc --noEmit`.
4. Run `npx eslint --max-warnings 0 src/ e2e/ocr-result.spec.ts` if supported by project ESLint config; otherwise run `npx eslint --max-warnings 0 src/` and document the E2E lint limitation.
5. Run `npm exec vitest run` if code changes touch shared logic.

### Error Handling
1. If the page fails to load mocked scan data, keep the test failure explicit and inspect route mocks rather than hiding it behind broad timeouts.
2. If Playwright fails because the dev server cannot start, document the infrastructure error separately from assertion failures.
3. Do not skip or quarantine the failing tests unless there is a confirmed external infrastructure blocker.

## ACCEPTANCE CRITERIA
- Given `OCRResultPage` renders `ScanFieldsTable` When `e2e/ocr-result.spec.ts` runs Then it locates field labels/values through table-visible UI instead of `.rounded-2xl` cards.
- Given mocked fields include `契約No.` and `CT No.` When the OCR result page renders Then the E2E verifies the Contract No row contains a contract value and does not fail on stale "other" card assumptions.
- Given mocked product data includes `商品名 = Test Product` When the field rendering E2E runs Then it verifies the product row/value is visible in the current table UI.
- Given the focused OCR result E2E suite runs When assertions execute Then failures are no longer caused by card-vs-table locator mismatch.

## CONSTRAINTS
- DO NOT: redesign `OCRResultPage` or `ScanFieldsTable` just to satisfy old E2E selectors.
- DO NOT: change backend API contracts, add dependencies, or alter auth architecture.
- DO NOT: weaken assertions into generic page-load checks only.
- REUSE: existing Playwright auth seeding and API route mocks in `e2e/ocr-result.spec.ts`.
- SKIP: broad productization, visual redesign, and unrelated E2E assertion rewrites.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS — includes root cause, files, behavior, and validation.
- One cohesive implementation unit: PASS — focused E2E locator/assertion correction for OCR result table UI.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Applicable standards listed: PASS — UI/mobile-first stability context.
- Constraints prevent overreach: PASS — test alignment only, no page redesign.
- Known gaps: Focused E2E may still surface unrelated route/server issues; classify with evidence if encountered.
