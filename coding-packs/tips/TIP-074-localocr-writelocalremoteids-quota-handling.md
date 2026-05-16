# TIP-074: localOcrScans writeLocalRemoteIds Quota Error Handling

## HEADER
- TIP-ID: TIP-074
- Project: OCR Gemini Mobile Web POC
- Module: Local Scan Persistence
- Priority: P0
- Depends on: TIP-057
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vitest + Testing Library.
- Key files to read first:
  - `src/lib/localOcrScans.ts` — `writeLocalRemoteIds()` at line 65 wraps a bare `localStorage.setItem()` without try/catch.
  - `src/hooks/useScans.ts` — `setLocalOcrScanRemoteId()` calls `writeLocalRemoteIds()` from `localOcrScans.ts`.
- Patterns to follow:
  - The sibling `writeLocalScans()` already demonstrates a fallback pattern with try/catch and console.warn for quota errors.
  - Use the same pattern for `writeLocalRemoteIds()`.

## APPLICABLE STANDARDS
- None explicitly — local storage error handling pattern already established.

## TASK
Wrap `writeLocalRemoteIds()` in `src/lib/localOcrScans.ts` with try/catch to prevent unhandled `QuotaExceededError` or `NS_ERROR_DOM_QUOTA_REACHED` exceptions when localStorage is full. Follow the existing `writeLocalScans()` fallback pattern.

## SPECIFICATIONS

### Business Rules
1. `writeLocalRemoteIds()` must not throw when localStorage is full.
2. On quota error, log a developer-facing warning and return silently — do not propagate.
3. The read side (`readLocalRemoteIds()`) already handles parse errors gracefully with try/catch.
4. No functional behavior change for the normal (non-quota) path.

### Validation
1. Run `npm run build`.
2. Run `npx tsc --noEmit`.
3. Run `npx eslint --max-warnings 0 src/`.
4. Run `npm exec vitest run`.
5. Verify no regression in scan list/history functionality.

### Error Handling
1. localStorage quota exceeded on write: catch exception, log a warning, return gracefully.
2. localStorage not available: treat as quota error — catch, log, return.

## ACCEPTANCE CRITERIA
- Given `writeLocalRemoteIds()` is called when localStorage is not full When the call happens Then behavior is unchanged.
- Given `writeLocalRemoteIds()` is called when localStorage is full When the call happens Then no unhandled exception propagates and the function returns normally.
- Given the existing `writeLocalScans()` error-handling pattern When applying to `writeLocalRemoteIds()` Then the pattern is consistent across both write functions.

## CONSTRAINTS
- DO NOT: change read-side error handling.
- DO NOT: add dependencies.
- DO NOT: change functional behavior for the non-error path.
- SKIP: broader localStorage refactoring, quota monitoring, or user-facing quota warnings.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS — root cause, file, pattern, and validation.
- One cohesive implementation unit: PASS — single function error handling.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Constraints prevent overreach: PASS.
- Known gaps: None.