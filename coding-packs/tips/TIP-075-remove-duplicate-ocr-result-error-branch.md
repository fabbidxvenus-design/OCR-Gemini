# TIP-075: Remove Duplicate OCR Result Error Branch

## HEADER
- TIP-ID: TIP-075
- Project: OCR Gemini Mobile Web POC
- Module: OCR Result Error Rendering
- Priority: P1
- Depends on: TIP-071
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, Vitest.
- Key files to read first:
  - `src/pages/OCRResultPage.tsx` — contains two identical consecutive `if (error)` render branches after TIP-071.
  - `src/__tests__/pages/OCRResultPage.test.tsx` — existing error-state tests.
- Patterns to follow:
  - Keep the first `if (error)` branch and remove the unreachable duplicate.
  - Do not change user-facing copy or layout behavior.

## APPLICABLE STANDARDS
- None — code quality cleanup for an actual duplicate branch.

## TASK
Remove the duplicate consecutive `if (error)` branch in `OCRResultPage`. This is unreachable duplicate code introduced during error-state handling and should be cleaned without changing behavior.

## SPECIFICATIONS

### Business Rules
1. OCR result remote-load errors must still render exactly one `ErrorMessage` branch.
2. Existing loading, pending-missing, and successful result rendering must remain unchanged.
3. No user-facing copy changes.

### Validation
1. Run `npm exec vitest run src/__tests__/pages/OCRResultPage.test.tsx`.
2. Run `npm run build`.
3. Run `npx tsc --noEmit`.
4. Run `npx eslint --max-warnings 0 src/`.
5. Run `npm exec vitest run`.

### Error Handling
No error-handling behavior should change; duplicate code only.

## ACCEPTANCE CRITERIA
- Given `useScan()` returns `error` When `OCRResultPage` renders Then exactly one error branch handles the state.
- Given `OCRResultPage.tsx` is inspected When searching for consecutive `if (error)` blocks Then only one block remains.
- Given existing OCR result tests run When the duplicate is removed Then tests still pass.

## CONSTRAINTS
- DO NOT: change error message text or retry behavior.
- DO NOT: change success/loading/pending branches.
- DO NOT: refactor unrelated OCR result code.
- SKIP: broader UI cleanup or productization.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS.
- One cohesive implementation unit: PASS.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Constraints prevent overreach: PASS.
