# Phase 01: TIP-073 Implementation Plan

## Goal

Add explicit failed-save feedback to `EditPage` so rejected `updateScan()` calls do not silently fail or navigate away without user-visible state.

## Context

`src/pages/EditPage.tsx` currently builds the edited OCR payload, awaits `updateScan(scanId, ...)`, and immediately navigates to `/ocr-result/:scanId`. If `updateScan()` rejects, the submit promise rejects and the user gets no clear in-page feedback. The fix should keep the form state intact, display an accessible Vietnamese error, clear it before retry, and preserve the successful save path.

## Implementation Steps

1. **Update tests first in `src/__tests__/pages/EditPage.test.tsx`**:
   - Import mocked `updateScan` where needed.
   - Add a test where `updateScan` rejects.
   - Click Save and assert:
     - no navigation to `/ocr-result/scan-1` occurred;
     - a Vietnamese error message is visible, ideally via `role="alert"` or visible text.
   - Add or adjust test coverage showing successful save still navigates.

2. **Update `src/pages/EditPage.tsx`**:
   - Add local `saveError: string | null` state.
   - Add local `isSaving` state or use an equivalent guard to prevent duplicate submits.
   - In `onSubmit`, clear `saveError` before calling `updateScan`.
   - Wrap `await updateScan(...)` in `try/catch/finally`.
   - On success, navigate exactly as before.
   - On failure, set `saveError` to `Không thể lưu thay đổi. Vui lòng thử lại.` and keep the user on the edit page.
   - Render the error in the form using existing accessible UI (`ErrorMessage` preferred) without redesigning the page.
   - Disable the Save button while `isSaving` is true.

3. **Run verification**:
   ```powershell
   npm exec vitest run src/__tests__/pages/EditPage.test.tsx
   npm run build
   npx tsc --noEmit
   npx eslint --max-warnings 0 src/
   npm exec vitest run
   ```

4. **Review**:
   - Run TypeScript/code review on the changed files.
   - Fix CRITICAL/HIGH issues only; keep scope narrow.

## Constraints

- `gsd-executor` is the only code writer.
- Do not redesign EditPage.
- Do not change backend/API contracts.
- Do not add dependencies.
- Do not alter unrelated edit form normalization behavior.
- Preserve successful save navigation.

## Success

Failed save now produces visible accessible feedback, user remains on edit page, retry clears prior error, successful save remains unchanged, and verification commands pass.
