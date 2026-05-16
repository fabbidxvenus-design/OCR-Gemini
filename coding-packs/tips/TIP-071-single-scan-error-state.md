# TIP-071: Single Scan Error State Handling

## HEADER
- TIP-ID: TIP-071
- Project: OCR Gemini Mobile Web POC
- Module: Single Scan Loading / Error Handling
- Priority: P0
- Depends on: TIP-017, TIP-069
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Vitest + Testing Library + Playwright, as documented in `coding-packs/00-PROJECT-CONTEXT.md`.
- Key files to read first:
  - `src/hooks/useScans.ts` — `useScan()` currently logs single-scan API failures and only returns `scan: undefined`.
  - `src/pages/OCRResultPage.tsx` — renders OCR result detail and already uses `ErrorMessage` for pending local scan misses.
  - `src/pages/HistoryDetailPage.tsx` — renders scan detail and currently falls back to indefinite `Đang tải...` when `scan` is undefined.
  - `src/components/ui/ErrorMessage.tsx` — reusable accessible retry/error component.
  - Existing tests under `src/__tests__/pages/` for page loading/error states.
- Patterns to follow:
  - Follow `useScansState()` in `src/hooks/useScans.ts`: expose `error: string | null`, clear it before loading, set a user-facing Vietnamese message on failure.
  - Use existing `ErrorMessage` with `autoFocus` for blocking page errors.
  - Keep page navigation retry simple: retry should either reload the current route or navigate back to a safe route (`/history` or `/camera`) depending on page context.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — use existing mobile-first layout and accessible error component patterns.
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — do not mutate scan records while handling errors.

## TASK
Add explicit error state handling for single-scan loading failures. `useScan()` must distinguish loading, missing pending/local scans, and remote API failures, and OCR result/history detail pages must render a user-visible error state instead of an ambiguous empty/loading state.

## SPECIFICATIONS

### Business Rules
1. `useScan()` must return an `error: string | null` field in `UseScanResult`.
2. Remote `scansApi.getScan()` failures must set a user-facing Vietnamese error message and clear `scan`.
3. Starting a new single-scan load must clear the previous error.
4. Local/pending missing scans must keep using `isPendingMissing` semantics and must not be misclassified as remote API errors.
5. `OCRResultPage` must render `ErrorMessage` when `useScan()` returns `error`, with a retry action that reloads or retries the current result route.
6. `HistoryDetailPage` must render `ErrorMessage` when `useScan()` returns `error`, with a safe action back to history or retry.
7. Existing successful scan rendering, local pending scan behavior, and skeleton loading states must remain unchanged.

### Validation
1. Run `npm run build` successfully.
2. Run `npx tsc --noEmit` successfully.
3. Run `npx eslint --max-warnings 0 src/` successfully.
4. Run `npm exec vitest run` successfully.
5. Add or update focused tests proving remote single-scan failure displays `ErrorMessage` on OCR result and history detail pages if practical; otherwise document why existing test harness prevents it.
6. Run focused E2E if relevant: `npx playwright test e2e/ocr-result.spec.ts --reporter=line` and confirm this change does not regress categorization behavior.

### Error Handling
1. Remote API failure: log detailed developer context, set `error` to a Vietnamese user-facing message, set `scan` to undefined, and stop loading.
2. Missing local/pending scan: keep existing not-found behavior through `isPendingMissing` and no remote error.
3. No auth token: do not throw in render; keep `scan` undefined and expose an appropriate error only if a remote scan load was attempted and failed.

## ACCEPTANCE CRITERIA
- Given `scansApi.getScan()` rejects When `useScan(scanId)` runs Then the hook returns `error` with a user-facing message and `isLoading` becomes false.
- Given OCR result route loads a remote scan and the API rejects When the page renders Then the user sees an accessible `ErrorMessage` instead of an indefinite loading/blank state.
- Given history detail route loads a remote scan and the API rejects When the page renders Then the user sees an accessible `ErrorMessage` instead of `Đang tải...` forever.
- Given a local or pending scan is missing When `useScan()` runs Then the existing `isPendingMissing` behavior remains unchanged.
- Given a successful remote scan load When the page renders Then existing OCR result and history detail UI remain unchanged.

## CONSTRAINTS
- DO NOT: change backend API contracts, add dependencies, alter auth architecture, or redesign OCR/history pages.
- DO NOT: swallow errors silently or replace errors with indefinite loading states.
- DO NOT: change E2E assertions unrelated to this bug.
- REUSE: `ErrorMessage`, existing skeleton components, existing `useScansState` error-state pattern.
- SKIP: broader scan CRUD refactors, retry libraries, offline queueing, or productization polish outside this failure state.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS — includes root cause, files, behavior, and validation.
- One cohesive implementation unit: PASS — single-scan error state and affected page rendering.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Applicable standards listed: PASS — UI error state and scan immutability context.
- Constraints prevent overreach: PASS — no API, dependency, or architecture change.
- Known gaps: Existing tests may need harness adjustments for API rejection; builder must add focused tests where practical or document blocker evidence.
