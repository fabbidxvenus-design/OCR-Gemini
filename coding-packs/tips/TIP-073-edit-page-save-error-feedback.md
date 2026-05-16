# TIP-073: Edit Page Save Error Feedback

## HEADER
- TIP-ID: TIP-073
- Project: OCR Gemini Mobile Web POC
- Module: Edit Scan Save Flow
- Priority: P0
- Depends on: TIP-071
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, React Hook Form, Vitest + Testing Library.
- Key files to read first:
  - `src/pages/EditPage.tsx` — save handler currently awaits `updateScan()` and navigates without local error feedback on rejection.
  - `src/hooks/useScans.ts` — `updateScan()` can reject when backend/API update fails.
  - `src/components/ui/ErrorMessage.tsx` — existing accessible error component.
  - `src/__tests__/pages/EditPage.test.tsx` — page tests and mocked `updateScan()`.
- Patterns to follow:
  - Existing UI-facing Vietnamese error messages.
  - Existing `ErrorMessage` component for accessible blocking/in-page errors.
  - Keep successful save behavior unchanged.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — keep edit page mobile layout and fixed action bar stable.

## TASK
Add explicit user-visible error feedback when saving edits fails on `EditPage`. The page must not navigate away after `updateScan()` rejects, and it must expose an accessible Vietnamese error message with a retry path through the existing save action.

## SPECIFICATIONS

### Business Rules
1. Successful save still calls `updateScan(scanId, ...)` and navigates to `/ocr-result/:scanId`.
2. Failed save must keep the user on the edit page.
3. Failed save must render a user-facing Vietnamese error message.
4. Starting a new save attempt must clear the previous save error.
5. The save button should not allow accidental duplicate submits while a save is in progress.
6. Do not swallow the rejection silently.

### Validation
1. Add/update focused Vitest coverage in `src/__tests__/pages/EditPage.test.tsx` for save rejection.
2. Run `npm exec vitest run src/__tests__/pages/EditPage.test.tsx`.
3. Run `npm run build`.
4. Run `npx tsc --noEmit`.
5. Run `npx eslint --max-warnings 0 src/`.
6. Run `npm exec vitest run`.

### Error Handling
1. `updateScan()` rejection: set a Vietnamese error such as `Không thể lưu thay đổi. Vui lòng thử lại.` and do not navigate.
2. Retry: user can click Save again after correcting/trying again; the previous error clears at the start of that attempt.
3. Loading/missing scan state remains unchanged.

## ACCEPTANCE CRITERIA
- Given `updateScan()` resolves When the user clicks save Then `EditPage` navigates to `/ocr-result/:scanId` as before.
- Given `updateScan()` rejects When the user clicks save Then `EditPage` stays on the page and shows an accessible Vietnamese save error.
- Given a save error is visible When the user clicks save again Then the previous error clears before the new attempt.
- Given a save is in progress When the user presses Save Then duplicate submit is prevented by disabling or otherwise guarding the save button.

## CONSTRAINTS
- DO NOT: change backend API contracts, add dependencies, or alter scan storage architecture.
- DO NOT: redesign EditPage.
- DO NOT: change unrelated edit form behavior.
- REUSE: `ErrorMessage` or existing UI feedback components.
- SKIP: broader form validation and productization outside failed-save feedback.

## QUALITY GATE SELF-REVIEW
- TIP is self-contained: PASS — includes root cause, files, behavior, and validation.
- One cohesive implementation unit: PASS — failed save feedback for one page.
- Acceptance criteria use Given/When/Then: PASS.
- Files to modify are explicit: PASS.
- Applicable standards listed: PASS — UI stability context.
- Constraints prevent overreach: PASS — no API/storage redesign.
- Known gaps: Save failure UX may later need toast styling, but accessible inline feedback is sufficient for this PHASE 1 bugfix.
