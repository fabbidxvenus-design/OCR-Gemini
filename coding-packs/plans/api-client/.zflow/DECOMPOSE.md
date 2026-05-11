# DECOMPOSE — api-client

## Execution Order

[CORE] Execute in four waves to keep the API foundation stable before feature migrations and to avoid premature cleanup.

### Wave 1 — Foundation

#### TIP-055: API Client Foundation

Purpose: create typed API boundary for all later migration work.

Deliverables:
- `src/lib/apiClient.ts`
- `src/lib/apiTypes.ts`
- API base URL normalization and typed `ApiError`
- Helpers for JSON and blob responses
- Unit tests for client behavior

Blocks: TIP-056, TIP-057, TIP-058, TIP-059, TIP-060, TIP-061

### Wave 2 — Source-of-Truth Core

#### TIP-056: Auth Flow API Migration

Purpose: make backend session/auth source of truth.

Deliverables:
- `src/lib/authApi.ts`
- Updated auth store/session validation
- Updated login/register/forgot/logout flows
- Updated ProtectedRoute behavior
- Tests for login, unauthorized, expired session, offline behavior

#### TIP-057: Scan Storage API Migration

Purpose: make backend scan CRUD source of truth.

Deliverables:
- `src/lib/scansApi.ts`
- Updated `useScans` API-backed hooks/helpers
- Updated camera save/history/detail/edit consumers as needed
- Tests for list/detail/create/update/offline behavior

Parallelization: TIP-056 and TIP-057 can run after TIP-055, but both touch app route/data assumptions. Merge carefully.

### Wave 3 — Dependent Service Migrations

#### TIP-058: OCR Backend API Migration

Purpose: route OCR through backend `/ocr/process` and remove frontend OpenRouter dependency.

Depends on: TIP-055, TIP-057

Deliverables:
- `src/lib/ocrApi.ts` or backend-backed `src/lib/gemini.ts`
- Updated OCR call path in camera flow
- Env docs no longer require frontend OpenRouter keys
- Tests for OCR success/offline/model tier behavior

#### TIP-059: Settings and Analytics API Migration

Purpose: move settings and analytics source of truth to backend.

Depends on: TIP-055, TIP-057

Deliverables:
- `src/lib/settingsApi.ts`
- `src/lib/analyticsApi.ts`
- Updated SettingsPage/AnalyticsPage flows
- Tests for settings load/save, analytics range refetch, offline error

#### TIP-060: Export Backend API Migration

Purpose: move Excel workbook generation to backend while keeping frontend blob save/share UX.

Depends on: TIP-055, TIP-057

Deliverables:
- `src/lib/exportApi.ts`
- Updated `useExport`
- Blob save/share utility reuse or extraction
- Tests for single export, multi export, empty selection, offline, empty blob

Parallelization: TIP-058, TIP-059, and TIP-060 can run in parallel after TIP-057 if API contracts are stable.

### Wave 4 — Cutover and Regression

#### TIP-061: Local Persistence Cutover and Regression Cleanup

Purpose: remove stale frontend local-source behavior and verify all migrated flows.

Depends on: TIP-056, TIP-057, TIP-058, TIP-059, TIP-060

Deliverables:
- Removed/quarantined unused local auth/Dexie/OpenRouter/ExcelJS code where safe
- Updated tests to mock API modules
- Source search audit for `db.`, `localStorage`, `VITE_OPENROUTER_API_KEY`, `ExcelJS`
- `npm run build`, lint, tests
- Manual verification notes for backend running/stopped

## Coverage Matrix

| Requirement | TIP | Coverage |
|---|---|---|
| Central API client | TIP-055 | Full |
| Auth source-of-truth from backend | TIP-056 | Full |
| Scan CRUD through backend | TIP-057 | Full |
| OCR through backend | TIP-058 | Full |
| Settings through backend | TIP-059 | Full |
| Analytics through backend | TIP-059 | Full |
| Export through backend | TIP-060 | Full |
| No local/Dexie silent fallback | TIP-056, TIP-057, TIP-059, TIP-061 | Full |
| No frontend OpenRouter key dependency | TIP-058, TIP-061 | Full |
| Build/test regression | TIP-061 | Full |

## Continuous RRI Score

[DECISION] All included TIPs score >= 60 for implementation clarity based on explicit files, endpoint assumptions, validation, errors, constraints, and G/W/T acceptance criteria.

| TIP | Score | Notes |
|---|---:|---|
| TIP-055 | 88 | Strong foundation scope; backend assumptions minimal |
| TIP-056 | 76 | Auth payload details may differ, but behavior is clear |
| TIP-057 | 82 | Scan CRUD contract detailed; hook shape risk noted |
| TIP-058 | 74 | Upload format is uncertain; endpoint and behavior clear |
| TIP-059 | 72 | Analytics backend support may vary |
| TIP-060 | 76 | Export endpoint names may vary; blob behavior clear |
| TIP-061 | 86 | Strong verification/checklist scope |

## Execution Gaps to Track

- [GAP] Backend contract validation must happen before implementing each API module.
- [GAP] If backend is unavailable, implementation can still unit-test API client with mocks but cannot complete manual E2E verification.
- [GAP] Existing tests may need broad mock updates from Dexie to API modules.
- [GAP] Removing Dexie/ExcelJS dependencies should be deferred until imports and bundle usage are verified.
