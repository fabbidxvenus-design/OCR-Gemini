# TIP-063: User Profile Backend Schema and API

## HEADER
- TIP-ID: TIP-063
- Project: ocr-mobile-web
- Module: user-profile-backend
- Priority: P1
- Depends on: TIP-062
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\HLVN-serverless`
- Frontend dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: Next.js API routes, TypeScript, Supabase service-role repository layer, API response envelope via `ok/fail`.
- Key files to read first:
  - `types/user.ts`
  - `lib/users/repository.ts`
  - `lib/users/service.ts`
  - `lib/auth/session.ts`
  - `app/api/auth/me/route.ts`
  - `supabase/migrations/001_init_schema.sql`
  - `lib/api/errors.ts`, `lib/api/response.ts`, `lib/api/validation.ts`
- Patterns to follow:
  - Repository handles Supabase rows and mapping.
  - Service layer owns business validation.
  - Routes return canonical `{ success, data/error, code }` envelopes.

## APPLICABLE STANDARDS
- none

## TASK
Extend backend user profile persistence and current-user API. Add profile columns to the `users` table through a new migration, expand `UserProfile`, and implement authenticated `GET/PATCH /api/auth/me` support for editable profile fields.

## SPECIFICATIONS
### Business Rules
1. Create a new Supabase migration; do not edit `001_init_schema.sql`.
2. Add nullable columns to `users`:
   - `display_name TEXT`
   - `description TEXT`
   - `phone TEXT`
   - `job_title TEXT`
   - `department TEXT`
   - `company TEXT`
   - `avatar_url TEXT`
3. Update backend `UserProfile` type with camelCase optional nullable fields.
4. Update repository row mapper to map snake_case DB columns to camelCase API fields.
5. Add repository/service method to update only current user's editable profile fields.
6. Implement or extend `PATCH /api/auth/me` to require bearer auth and update only the authenticated user's own profile.
7. `GET /api/auth/me` must return the expanded profile shape.
8. Empty strings should be normalized to `null` before persistence.

### Validation
1. `displayName`: max 80 chars.
2. `description`: max 280 chars.
3. `phone`: max 32 chars; pattern `^[0-9+\-()\s]*$` when non-empty.
4. `jobTitle`: max 80 chars.
5. `department`: max 80 chars.
6. `company`: max 120 chars.
7. `avatarUrl`: max 4096 chars; must be empty, `https://...`, or `data:image/...`.
8. Reject unknown editable fields only if existing route conventions already reject them; otherwise ignore unknowns safely.

### Error Handling
1. Missing/invalid bearer token returns existing auth error envelope/status.
2. Validation errors return `VALIDATION_ERROR` with safe message.
3. Missing user returns `NOT_FOUND`.
4. Unexpected Supabase errors are sanitized through `toApiError`/`InternalError`; do not leak raw SQL/provider messages.

## ACCEPTANCE CRITERIA
- Given an authenticated user When `GET /api/auth/me` is called Then the response includes expanded profile fields.
- Given valid profile payload When `PATCH /api/auth/me` is called Then the users row is updated and expanded profile is returned.
- Given empty string fields When saving Then the persisted/API value is `null`.
- Given invalid phone When saving Then API returns 400 `VALIDATION_ERROR`.
- Given unauthenticated request When saving Then API returns auth failure and does not update any row.
- Given an unexpected database error When saving Then API returns sanitized internal error.
- Given backend typecheck/tests run When implementation is done Then they pass.

## CONSTRAINTS
- DO NOT: add binary avatar upload or Supabase Storage.
- DO NOT: allow users to update email, role, id, createdAt, updatedAt, or lastLogin.
- DO NOT: edit historical migrations.
- REUSE: existing auth/session helpers, response envelope, `ApiError` classes, repository/service layering.
- SKIP: admin profile management UI.

## FILE OWNERSHIP
Backend agent owns:
- `D:\scripts\HLVN\HLVN-serverless\supabase\migrations\00X_user_profile_fields.sql`
- `D:\scripts\HLVN\HLVN-serverless\types\user.ts`
- `D:\scripts\HLVN\HLVN-serverless\lib\users\repository.ts`
- `D:\scripts\HLVN\HLVN-serverless\lib\users\service.ts`
- `D:\scripts\HLVN\HLVN-serverless\app\api\auth\me\route.ts`
- Backend tests for auth/profile route.

## QUALITY GATE: /vibecode:tip Self-Review
- Completeness: PASS — schema, API, validation, errors, and file ownership are explicit.
- Multi-agent boundary: PASS — backend-only ownership avoids frontend conflicts.
- Gaps declared: PASS — binary avatar upload is explicitly deferred.
