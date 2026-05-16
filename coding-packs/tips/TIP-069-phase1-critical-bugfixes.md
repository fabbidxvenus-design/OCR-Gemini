# TIP-069: Phase 1 Critical Bugfixes

## HEADER
- TIP-ID: TIP-069
- Project: OCR Gemini Mobile Web POC
- Module: Phase 1 Bugfix / Runtime Correctness / Error Handling
- Priority: P0
- Depends on: TIP-017, TIP-038, TIP-068
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Dexie 4.4.x, React Hook Form, Vitest + Testing Library + Playwright, as documented in `coding-packs/00-PROJECT-CONTEXT.md`.
- Key files to read first:
  - `src/pages/AnalyticsPage.tsx`
  - `src/lib/localOcrScans.ts`
  - `src/components/layout/ProtectedRoute.tsx`
  - `src/components/ui/FieldRow.tsx`
  - `src/hooks/useMediaQuery.ts`
  - `src/hooks/useSettings.ts`
  - `src/hooks/useScans.ts`
  - `src/lib/scanFilters.ts`
  - `src/hooks/useExport.ts`
  - `src/store/authStore.ts`
  - `src/pages/OCRResultPage.tsx`
  - `e2e/ocr-result.spec.ts`
- Patterns to follow:
  - Keep React hooks unconditionally ordered before any early return.
  - Preserve immutable scan update patterns through existing helpers.
  - Surface user-facing failures through existing toast/error UI where the page already has feedback patterns.
  - Fix lint/runtime issues with minimal local changes; do not refactor app architecture.

## APPLICABLE STANDARDS
- [api/json-extraction](../standards/api/json-extraction.md) — safe parsing/fallback principle for external API data handling and error surfacing.
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — immutable scan updates through existing persistence helpers.

## TASK
Fix the verified Phase 1 critical bugs found by automated scans and browser QA. The implementation must make ESLint pass for the reported files, prevent silent local OCR persistence data loss, and restore OCR result page section headings expected by E2E without introducing new dependencies or architectural rewrites.

## SPECIFICATIONS

### Business Rules
1. Analytics must not call hooks conditionally. All `useMemo`/hook calls in `AnalyticsPage.tsx` must execute in a stable order on every render.
2. Analytics stats loading failures must not be silently converted into an indistinguishable empty state. The page must expose a visible error state or existing toast/error message while preserving a safe fallback UI.
3. Local OCR scan persistence must not silently swallow localStorage quota, corruption, or private-mode failures. Failures must be logged or surfaced through a reusable, testable mechanism and must avoid destructive clearing unless recovery is intentional and visible to the caller.
4. `ProtectedRoute.tsx` must not call impure functions such as `Date.now()` during render. Time/session validation must be moved into state/effect, memo-safe logic, or a store-level helper that does not violate React compiler rules.
5. Components/hooks flagged for synchronous `setState` inside effects must be rewritten to use safe initialization patterns or guarded async/effect updates that satisfy the React hooks linter.
6. TypeScript files must remove reported `any` usage by replacing it with `unknown`, typed callback signatures, or project domain types.
7. `scanFilters.ts` switch cases with lexical declarations must be block-scoped.
8. `OCRResultPage.tsx` must render accessible section headings for `Thông tin chính` and `Thông tin khác` when OCR fields are shown, matching the browser QA expectation.
9. Existing camera, OCR result, edit, save, history, export, and auth flows must keep current behavior unless directly required by these fixes.

### Validation
1. Run `npm run build` successfully.
2. Run `npx tsc --noEmit` successfully.
3. Run `npx eslint --max-warnings 0 src/` successfully, or if the repo lint entrypoint differs, run the closest equivalent and document any non-target pre-existing issue.
4. Run focused tests for affected pages/hooks, including `EditPage`, `OCRResultPage`, and `AnalyticsPage` if present.
5. Run the relevant E2E spec that previously failed: `e2e/ocr-result.spec.ts`, or manually verify that headings `Thông tin chính` and `Thông tin khác` exist on the OCR result page if E2E infrastructure is unavailable.

### Error Handling
1. localStorage read corruption should recover to a safe empty list only after recording the failure and without throwing during app boot.
2. localStorage write quota/private-mode failure should preserve in-memory flow where possible and return/throw enough context for caller feedback; it must not silently delete all persisted local scans without visibility.
3. Analytics stats failure should show user-facing feedback and keep the page usable.
4. Existing OCR/edit save errors must continue to show user-facing Vietnamese messages.

## ACCEPTANCE CRITERIA
- Given `AnalyticsPage` renders with no scan data or failed API stats When the page loads Then React hooks execute in the same order and no rules-of-hooks lint error is reported.
- Given `getApiKeyUsageStats()` rejects When `AnalyticsPage` loads Then the user sees an error/fallback state that distinguishes failure from genuinely empty stats.
- Given localStorage contains corrupted local OCR scan data When local scan history is read Then the app recovers safely and the failure is not silently swallowed.
- Given localStorage throws quota/private-mode errors When a local OCR scan is saved Then the failure is logged or surfaced and existing data is not destructively cleared without an intentional recovery path.
- Given an unauthenticated or expired session route check When `ProtectedRoute` renders Then it does not call `Date.now()` during render and still redirects correctly.
- Given `FieldRow`, `useMediaQuery`, and `useSettings` initialize state When ESLint runs Then no synchronous setState-in-effect errors remain.
- Given export/settings/auth code is linted When ESLint runs Then no reported explicit `any` errors remain.
- Given history sorting/filtering runs through `scanFilters.ts` When ESLint runs Then no lexical declaration in case block errors remain.
- Given the OCR result page has main and other OCR fields When browser QA queries headings Then accessible headings `Thông tin chính` and `Thông tin khác` are present.
- Given all Phase 1 fixes are applied When build/type/lint/tests run Then all verification commands pass.

## CONSTRAINTS
- DO NOT: add dependencies, change OCR model behavior, redesign pages, alter backend API contracts, or perform destructive persistence cleanup without explicit recovery behavior.
- DO NOT: use multiple writer agents for implementation. `gsd-executor` must be the sole code writer for this TIP.
- DO NOT: hide lint errors by disabling rules, adding broad `eslint-disable`, or replacing meaningful errors with unused placeholders.
- DO NOT: introduce `console.log` debug output. Use existing error/toast patterns or typed error propagation.
- REUSE: existing `Toast`, page error-state patterns, `Layout`, `PrimaryButton`, `ScanFieldsTable`, `FieldRow`, and scan persistence helpers.
- REUSE: existing tests under `src/__tests__` and E2E specs under `e2e/`.
- SKIP: broad architecture cleanup, dependency upgrades, CSP/security-header work, and productization polish not tied to the verified Phase 1 bugs.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS — includes evidence, files, behavior, validation commands, and constraints.
- One cohesive implementation unit: PASS — Phase 1 verified bugfix sweep focused on runtime correctness, lint correctness, and silent failure handling.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Applicable standards listed: PASS — matched API error-handling context and scan immutability.
- Constraints prevent overreach: PASS — no architecture/dependency changes and single writer enforced.
- Known gaps: This TIP intentionally groups multiple lint/silent-failure fixes because the active autonomous Phase 1 scan surfaced them as one blocking quality gate. If implementation reveals an unrelated large refactor is required, split that finding into a later TIP instead of expanding this scope.
