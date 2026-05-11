# SPEC — api-client

## Overview

[CORE] The api-client plan migrates frontend source-of-truth behavior to local backend API endpoints at `localhost:3001`. Existing UI/routes should remain stable while auth, scan CRUD, OCR, settings/analytics, and export flows move behind typed API boundaries.

## Red Gate Strategy

[DECISION] During implementation, each TIP must add or update tests before/with code changes so the expected API-backed behavior is captured. This plan does not implement tests yet.

## Given / When / Then Specs

### TIP-055 — API Client Foundation

- Given `VITE_API_BASE_URL` is unset When the API client initializes Then it uses `http://localhost:3001`.
- Given `VITE_API_BASE_URL=http://localhost:3001/` When the client builds a URL Then the final URL does not contain a double slash before the path.
- Given backend returns 200 JSON When `apiGet<T>()` is called Then it returns typed data.
- Given backend returns 204 When `apiDelete()` is called Then it resolves without JSON parsing.
- Given backend is offline When any API helper is called Then it throws typed `ApiError` with status `0`.
- Given backend returns 500 with `{ message: "boom" }` When API helper receives it Then it throws `ApiError` with message `boom`.

### TIP-056 — Auth Flow API Migration

- Given backend auth API is running When user logs in with valid credentials Then frontend navigates to protected app route.
- Given backend returns 401 When user attempts login Then login page displays a user-friendly error and does not authenticate.
- Given user is authenticated When `ProtectedRoute` checks session Then it allows access only if backend session is valid.
- Given backend session expired When user opens `/history` Then user is redirected to `/login`.
- Given user clicks logout in Header or Sidebar When logout completes Then frontend clears auth state and navigates to `/login`.
- Given backend is offline When user attempts login Then UI shows API connection error and does not fall back to local PIN auth.

### TIP-057 — Scan Storage API Migration

- Given backend has scans When user opens History Then scan list is fetched from `GET /scans` and displayed.
- Given user opens scan detail When scan exists Then frontend fetches `GET /scans/:id` and renders the same UI as before.
- Given camera OCR completes When app saves scan Then frontend calls `POST /scans` and navigates to the returned scan id.
- Given user edits structured fields When save succeeds Then frontend calls `PATCH /scans/:id` and updated data appears in detail/history.
- Given backend returns 404 for detail When page loads Then UI handles missing scan gracefully.
- Given backend is offline When History loads Then UI shows a user-friendly error and does not read Dexie as fallback.

### TIP-058 — OCR Backend API Migration

- Given user confirms an image When OCR starts Then frontend calls `POST /ocr/process` on `localhost:3001`.
- Given backend returns structured OCR When request succeeds Then scan is saved through TIP-057 scan API with returned OCR data.
- Given backend returns token usage When scan is saved Then history/analytics can show cost and API key index as before.
- Given backend is offline When user confirms image Then CameraPage shows connection error and retry option.
- Given frontend env contains no OpenRouter keys When app builds Then OCR flow still works through backend.
- Given model tier is set to `high` When OCR request is sent Then request includes `modelTier: 'high'`.

### TIP-059 — Settings and Analytics API Migration

- Given backend has selected model tier When SettingsPage loads Then the current tier is fetched from `/settings`.
- Given user changes model tier When save succeeds Then frontend calls `PATCH /settings` and UI reflects saved value.
- Given AnalyticsPage opens with 30d selected When data loads Then frontend calls `/analytics?range=30d`.
- Given user selects 7d When range changes Then frontend refetches analytics for `7d`.
- Given backend returns top products When AnalyticsPage renders Then top products list matches backend response.
- Given backend is offline When AnalyticsPage loads Then UI shows an error/empty state and does not use Dexie fallback.

### TIP-060 — Export Backend API Migration

- Given user clicks export on a detail page When scan exists Then frontend calls `GET /export/scans/:id.xlsx` and downloads/shares returned blob.
- Given user selects multiple scans When export is clicked Then frontend calls `POST /export/scans.xlsx` with selected ids.
- Given backend returns `.xlsx` blob When export succeeds Then existing mobile fallback chain shares/saves/downloads the file.
- Given backend is offline When user exports Then UI shows export error and does not attempt browser ExcelJS generation as fallback.
- Given user cancels Web Share When fallback download succeeds Then export is treated as successful.
- Given no scans are selected When export button would run Then no API call is made.

### TIP-061 — Local Persistence Cutover and Regression Cleanup

- Given source search after migration When checking for `VITE_OPENROUTER_API_KEY` Then no frontend runtime dependency remains.
- Given source search after migration When checking scan/auth/settings flows Then Dexie is not used as source of truth.
- Given backend is running When user logs in, scans, edits, views history, views analytics, changes settings, and exports Then all flows call `localhost:3001` APIs and work end-to-end.
- Given backend is stopped When user opens protected/data routes Then UI shows connection/session errors and does not fall back to stale local data.
- Given `npm run build` is executed Then TypeScript and Vite build pass.
- Given test suite is executed Then migrated tests pass with API mocks.

## Verification Requirements

- [CORE] Unit tests for `apiClient` URL normalization, JSON parsing, 204 handling, network failure, and backend error mapping.
- [CORE] Component/page tests updated to mock API modules rather than Dexie for migrated flows.
- [CORE] Regression checks: build, lint, tests.
- [CORE] Manual browser verification with backend running and stopped.
- [CORE] Source search confirms no runtime frontend OpenRouter key dependency after cutover.

## Non-Goals

- [DECISION] Do not implement backend endpoints in this plan.
- [DECISION] Do not redesign UI.
- [DECISION] Do not change route paths.
- [DECISION] Do not keep Dexie/localStorage as silent fallback after corresponding migration TIPs.
