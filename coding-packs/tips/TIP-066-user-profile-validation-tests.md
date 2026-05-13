# TIP-066: User Profile Validation and Automated Tests

## HEADER
- TIP-ID: TIP-066
- Project: ocr-mobile-web
- Module: user-profile-tests
- Priority: P1
- Depends on: TIP-063, TIP-064, TIP-065
- Estimated: M

## CONTEXT
- Frontend dir: `D:\scripts\HLVN\ocr-mobile-web`
- Backend dir: `D:\scripts\HLVN\HLVN-serverless`
- Dependencies: TIP-063 backend API, TIP-064 frontend contract/store, TIP-065 Profile UI.
- Key files to read first:
  - Frontend: `src/pages/ProfilePage.tsx`, `src/components/layout/Header.tsx`, `src/lib/authApi.ts`, `src/store/authStore.ts`
  - Backend: `app/api/auth/me/route.ts`, `lib/users/service.ts`, `lib/users/repository.ts`
  - Existing tests: `src/__tests__/**/*`, `D:\scripts\HLVN\HLVN-serverless\tests\api\auth.test.ts`
- Patterns to follow:
  - Vitest + Testing Library for frontend behavior.
  - Vitest API route tests with mocked backend dependencies for serverless routes.

## APPLICABLE STANDARDS
- none

## TASK
Add automated test coverage for the Profile feature across backend route validation, frontend contract/store behavior, and UI form behavior. This TIP should primarily write tests and make only minimal fixes needed to satisfy the intended behavior.

## SPECIFICATIONS
### Business Rules
1. Backend tests must cover `GET /api/auth/me` expanded profile response.
2. Backend tests must cover valid `PATCH /api/auth/me` update.
3. Backend tests must cover invalid phone, over-limit description, unauthenticated update, and unknown/internal error sanitization.
4. Frontend tests must cover profile schema parsing with null/missing optional fields.
5. Frontend tests must cover payload normalization from empty strings to null.
6. Store tests must cover `updateUserProfile` replacing user while preserving tokens/expiry.
7. UI tests must cover Header avatar navigation and Profile form validation/save/reset happy path.

### Validation
- Test frontend and backend validation limits from TIP-063/TIP-064:
  - displayName 80
  - description 280
  - phone 32 + allowed characters
  - jobTitle 80
  - department 80
  - company 120
  - avatarUrl 4096 + https/data-image only

### Error Handling
1. Assert backend validation errors use the standard API envelope.
2. Assert frontend keeps form values after API failure.
3. Assert auth failure path does not overwrite profile state.

## ACCEPTANCE CRITERIA
- Given backend profile route tests run When profile payload is valid Then tests assert updated profile envelope.
- Given backend profile route tests run When phone is invalid Then tests assert 400 `VALIDATION_ERROR`.
- Given frontend schema tests run When optional profile fields are null/missing Then parsing succeeds.
- Given store tests run When `updateUserProfile` executes Then tokens are preserved.
- Given Profile UI test runs When invalid phone is entered Then no API call is made and validation appears.
- Given Profile UI test runs When valid data is saved Then API mock is called and success state/store update occurs.
- Given all relevant commands run When test TIP is complete Then frontend build/typecheck and backend typecheck pass.

## CONSTRAINTS
- DO NOT: broaden Profile feature scope.
- DO NOT: rewrite unrelated auth tests.
- DO NOT: silence real failures by weakening assertions.
- REUSE: existing test utilities/patterns where present.
- SKIP: manual browser testing and screenshot/a11y checks; those belong to TIP-067.

## FILE OWNERSHIP
Test agent owns:
- Frontend tests under `src/__tests__/`.
- Backend tests under `D:\scripts\HLVN\HLVN-serverless\tests\api\`.
- Minimal source edits only when tests reveal a direct mismatch with TIP-063..065.

## QUALITY GATE: /vibecode:tip Self-Review
- Completeness: PASS — backend, contract/store, UI behavior, validation, and error cases are covered.
- Multi-agent boundary: PASS — test agent owns tests and only minimal corrective source edits.
- Gaps declared: PASS — browser/a11y verification delegated to TIP-067.
