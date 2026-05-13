# TIP-064: User Profile Frontend Contract and Store Sync

## HEADER
- TIP-ID: TIP-064
- Project: ocr-mobile-web
- Module: user-profile-frontend-contract
- Priority: P1
- Depends on: TIP-063
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Backend dependency: TIP-063 defines expanded `GET/PATCH /api/auth/me` contract.
- Tech stack: React + TypeScript + Zod + Zustand + `apiClient`.
- Key files to read first:
  - `src/lib/authApi.ts`
  - `src/lib/apiClient.ts`
  - `src/lib/apiTypes.ts`
  - `src/store/authStore.ts`
  - `src/pages/RegisterPage.tsx`, `src/pages/LoginPage.tsx` for auth state usage patterns.
- Patterns to follow:
  - Zod response schemas sit beside API functions in `authApi.ts`.
  - Auth session state is persisted via Zustand middleware.
  - State updates must be immutable.

## APPLICABLE STANDARDS
- none

## TASK
Add the frontend typed profile contract and auth-store synchronization needed by the Profile UI. This TIP must not build the Profile page; it only prepares schemas, API methods, payload types, normalization helpers, and store actions.

## SPECIFICATIONS
### Business Rules
1. Extend `UserProfileSchema` with profile fields from TIP-063:
   - `displayName`, `description`, `phone`, `jobTitle`, `department`, `company`, `avatarUrl` as optional nullable strings.
2. Export `UpdateProfileInput` or equivalent type for editable fields only.
3. Add `UpdateProfileSchema` if useful for frontend pre-submit validation; keep rules aligned with TIP-063.
4. Add `authApi.updateProfile(accessToken, payload)` calling `PATCH /api/auth/me` with schema validation against expanded `UserProfileSchema`.
5. Add `authApi.getSession` compatibility with expanded profile response.
6. Add `updateUserProfile(profile: UserProfile)` action to `useAuthStore`.
7. `updateUserProfile` must preserve `isAuthenticated`, tokens, and expiry, changing only `user`.
8. Add a normalization helper that trims strings and converts empty editable fields to `null` before API submission.

### Validation
1. Match TIP-063 limits exactly.
2. Do not validate read-only fields in update payload.
3. Do not allow role/email/id fields into `updateProfile` payload type.

### Error Handling
1. Let `ApiError` bubble to UI; do not swallow API errors in `authApi`.
2. If schema validation fails, rely on existing `apiClient` behavior and do not mutate store.

## ACCEPTANCE CRITERIA
- Given `UserProfileSchema` parses backend profile data When optional fields are absent or null Then parsing succeeds.
- Given `authApi.updateProfile` receives a payload When it calls API Then only editable fields are sent.
- Given update API returns an expanded user When `updateUserProfile` is called Then persisted auth store user is replaced immutably.
- Given tokens exist When profile updates Then `accessToken`, `refreshToken`, and `expiresAt` remain unchanged.
- Given frontend typecheck runs When implementation is done Then it passes.

## CONSTRAINTS
- DO NOT: create or modify Profile UI in this TIP.
- DO NOT: add local-only persistence outside auth store.
- DO NOT: use `any`; use explicit interfaces/types.
- REUSE: `apiClient.patch`, existing `AuthSessionSchema`, existing Zustand store structure.
- SKIP: route/header/page tests; those belong to TIP-065/TIP-066.

## FILE OWNERSHIP
Frontend contract agent owns:
- `src/lib/authApi.ts`
- `src/store/authStore.ts`
- Optional `src/lib/profileValidation.ts`
- Focused unit tests for normalization/store behavior if introduced.

## QUALITY GATE: /vibecode:tip Self-Review
- Completeness: PASS — schemas, API method, store action, validation alignment, and ownership are explicit.
- Multi-agent boundary: PASS — no UI files owned here.
- Gaps declared: PASS — UI implementation intentionally deferred to TIP-065.
