# TIP-056: Auth Flow API Migration

## HEADER
- TIP-ID: TIP-056
- Project: ocr-mobile-web
- Module: auth-api
- Priority: P0
- Depends on: TIP-055
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, Zustand, React Router 7, local backend API at `localhost:3001`
- Key files to read first:
  - `src/lib/apiClient.ts`
  - `src/store/authStore.ts`
  - `src/lib/auth.ts`
  - `src/components/layout/ProtectedRoute.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/pages/LoginPage.tsx`
  - `src/pages/RegisterPage.tsx`
  - `src/pages/ForgotPasswordPage.tsx`
- Patterns to follow:
  - Existing Zustand store API shape
  - Existing route guard behavior
  - Existing Vietnamese validation/error copy

## APPLICABLE STANDARDS
Builder MUST conform to:
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — centralize boundary errors through API client
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — preserve immutable state updates

## TASK
Migrate authentication from local PIN/localStorage-only behavior to the local backend API. Zustand may still hold in-memory UI auth state, but source-of-truth session validation must come from `localhost:3001` instead of localStorage/Dexie auth records.

## SPECIFICATIONS
### Business Rules
1. Login/register/forgot-password pages must call backend auth endpoints instead of `src/lib/auth.ts` local PIN helpers.
2. `ProtectedRoute` must validate current session through backend or a token/session returned by backend.
3. Logout must notify backend if endpoint exists, then clear frontend auth state and navigate to `/login`.
4. Header and Sidebar logout behavior must be consistent.
5. Auth state persisted in localStorage must not be the sole source of truth after migration.

### Files to Create
- `src/lib/authApi.ts`

### Files to Modify
- `src/store/authStore.ts`
- `src/components/layout/ProtectedRoute.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/ForgotPasswordPage.tsx`

### Backend Endpoint Contract
Assume these endpoints unless backend differs:
- `POST /auth/login` → `{ user, token?, expiresAt? }`
- `POST /auth/register` → `{ user, token?, expiresAt? }`
- `POST /auth/logout` → `204`
- `GET /auth/session` → `{ authenticated: boolean, user?, expiresAt? }`
- `POST /auth/forgot-password` → `{ success: boolean }`

### Validation
1. Login input must preserve existing client-side validation before API call.
2. Register input must preserve existing validation before API call.
3. Empty or expired backend session must redirect to `/login`.
4. Token/session data from backend must be narrowed before storing in Zustand.

### Error Handling
1. Backend offline: show user-safe message `Không thể kết nối API local`.
2. 401/403: clear auth state and redirect to `/login`.
3. Validation errors from backend: display backend message if safe; otherwise use existing Vietnamese generic error.
4. Logout failure: still clear local UI state, but show a non-blocking toast/error if pattern exists.

## ACCEPTANCE CRITERIA
- Given backend auth API is running When user logs in with valid credentials Then frontend navigates to protected app route.
- Given backend returns 401 When user attempts login Then login page displays a user-friendly error and does not authenticate.
- Given user is authenticated When `ProtectedRoute` checks session Then it allows access only if backend session is valid.
- Given backend session expired When user opens `/history` Then user is redirected to `/login`.
- Given user clicks logout in Header or Sidebar When logout completes Then frontend clears auth state and navigates to `/login`.
- Given backend is offline When user attempts login Then UI shows API connection error and does not fall back to local PIN auth.

## CONSTRAINTS
- DO NOT keep `localStorage` as auth source of truth.
- DO NOT remove old `src/lib/auth.ts` unless all imports are migrated and build proves unused.
- DO NOT change route paths.
- REUSE existing pages and UI components.
- SKIP scan/history/OCR/export migration; handled by later TIPs.

## QUALITY GATE SELF-REVIEW
- [x] TIP isolates auth migration only.
- [x] Backend endpoint assumptions are explicit.
- [x] Acceptance criteria cover success, failure, expiry, and logout.
- [x] Explicitly prevents fallback to local auth.
- Gap: exact backend auth payload may require adjustment during implementation.
