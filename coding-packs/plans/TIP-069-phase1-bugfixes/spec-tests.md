# SPEC: TIP-069 Phase 1 Critical Bugfixes

## Red Gate Evidence

These specs are derived from verified Phase 1 scan failures:
- ESLint currently reports 17 errors and 2 warnings.
- Browser QA currently fails `e2e/ocr-result.spec.ts` because headings `Thông tin chính` and `Thông tin khác` are missing.
- Silent failure scan reports empty localStorage catch blocks in `src/lib/localOcrScans.ts`.

## Behavioral Specs

### SPEC-001: Analytics hooks are stable
- Given `AnalyticsPage` renders in loading, empty, and populated states
- When React renders each state
- Then every hook executes unconditionally in the same order
- And ESLint reports no `rules-of-hooks` errors in `src/pages/AnalyticsPage.tsx`

### SPEC-002: Analytics API failures are visible
- Given `getApiKeyUsageStats()` rejects
- When `AnalyticsPage` loads
- Then the user can distinguish an API failure from genuinely empty stats
- And the page remains usable

### SPEC-003: Local OCR persistence failures are not silent
- Given localStorage contains corrupted OCR scan data
- When local OCR scans are read
- Then the app safely recovers without crashing
- And the failure path is observable through logging or returned error context

### SPEC-004: Local OCR write failures do not silently discard data
- Given localStorage throws quota/private-mode errors
- When local OCR scans are saved
- Then the save failure is not swallowed silently
- And existing data is not destructively cleared without a deliberate recovery path

### SPEC-005: ProtectedRoute render is pure
- Given `ProtectedRoute` checks session validity
- When it renders
- Then it does not call `Date.now()` or another impure time function during render
- And unauthenticated/expired sessions still redirect correctly

### SPEC-006: React effect lint issues are resolved
- Given `FieldRow`, `useMediaQuery`, and `useSettings` initialize state
- When ESLint runs
- Then no synchronous `setState` inside effect errors remain

### SPEC-007: TypeScript lint errors are resolved
- Given export/settings/auth code is linted
- When ESLint runs
- Then no reported explicit `any` errors remain
- And `scanFilters.ts` has no lexical declarations directly inside case blocks

### SPEC-008: OCR result sections are accessible to E2E
- Given the OCR result page displays structured OCR fields
- When browser QA queries by role heading
- Then `Thông tin chính` and `Thông tin khác` headings are present and accessible

## Verification Commands

```powershell
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
npx playwright test e2e/ocr-result.spec.ts
```

## Green Gate

All commands above pass, or any unavailable E2E infrastructure is documented with browser manual verification evidence.
