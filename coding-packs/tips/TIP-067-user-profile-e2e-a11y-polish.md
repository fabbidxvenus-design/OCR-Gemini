# TIP-067: User Profile E2E, Accessibility, and Polish

## HEADER
- TIP-ID: TIP-067
- Project: ocr-mobile-web
- Module: user-profile-e2e-a11y
- Priority: P1
- Depends on: TIP-066
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Backend dir: `D:\scripts\HLVN\HLVN-serverless`
- Dependencies: TIP-063..066 implemented and automated tests passing.
- Key files to read first:
  - `src/pages/ProfilePage.tsx`
  - `src/components/layout/Header.tsx`
  - Existing Playwright config/tests: `playwright.config.ts`, `e2e/**/*`
  - `coding-packs/standards/ui/mobile-first-responsive.md`
- Agent expectation:
  - Use `@e2e-runner` for browser workflow checks.
  - Use `@a11y-architect` for WCAG/touch/focus review.
  - Use `@typescript-reviewer` if polish changes touch TypeScript.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — verify mobile/tablet responsive behavior.
- [ui/runtime-responsive-hooks](../standards/ui/runtime-responsive-hooks.md) — verify runtime responsive logic is not overused.

## TASK
Verify the Profile feature end-to-end and polish UI/accessibility issues found during verification. This includes browser testing of Header avatar navigation, profile edit/save/reset, validation errors, responsive layout, keyboard focus, and touch target quality.

## SPECIFICATIONS
### Business Rules
1. Start or reuse frontend dev server and backend dev server as needed.
2. Test Profile at minimum viewport widths: 320, 375, 768, 1024.
3. Verify Header avatar remains visible and does not crowd logout/API status controls.
4. Verify Profile form is usable with keyboard only.
5. Verify save success updates Header identity without full page reload.
6. Verify reset restores persisted profile values.
7. Verify invalid inputs show clear Vietnamese feedback.
8. Capture screenshots/artifacts if E2E framework supports them.

### Validation
- Confirm visible validation messages for invalid phone and over-limit description.
- Confirm no horizontal scroll at 320px.
- Confirm all touch targets are at least 44px.

### Error Handling
1. Test backend/API unavailable or mocked network failure if practical; UI must show a friendly Vietnamese error and keep form values.
2. Test unauthorized/profile session expired behavior if practical; app should route to login or show existing auth failure behavior.

## ACCEPTANCE CRITERIA
- Given a logged-in user When they click Header avatar Then `/profile` opens in browser.
- Given valid profile edits When saved through browser Then success feedback appears and Header identity updates.
- Given invalid phone When saving through browser Then inline validation appears and no successful save feedback is shown.
- Given 320px viewport When Profile is viewed Then there is no horizontal overflow and action buttons remain reachable above bottom nav/safe area.
- Given keyboard-only navigation When tabbing from Header to form actions Then every interactive element has visible focus.
- Given `@a11y-architect` reviews Profile When review completes Then no critical/high WCAG 2.2 issues remain.
- Given build/test/e2e checks complete When TIP is done Then final report lists pass/fail, artifacts, and any deferred low-priority issues.

## CONSTRAINTS
- DO NOT: add new Profile product scope.
- DO NOT: rewrite backend or frontend architecture during polish.
- DO NOT: hide accessibility failures without fixing or explicitly documenting deferral.
- REUSE: existing E2E config, app layout, UI tokens.
- SKIP: binary avatar upload, account deletion, email/password changes.

## FILE OWNERSHIP
Verification/polish agent may edit:
- `src/pages/ProfilePage.tsx`
- `src/components/layout/Header.tsx`
- E2E tests/artifacts under `e2e/` if needed.

## QUALITY GATE: /vibecode:tip Self-Review
- Completeness: PASS — E2E, responsiveness, keyboard, a11y, and polish checks are explicit.
- Multi-agent boundary: PASS — verification happens after implementation/test TIPs and uses specialist agents.
- Gaps declared: PASS — only practical API-unavailable/session-expired checks are required; any untestable environment limitation must be reported.
