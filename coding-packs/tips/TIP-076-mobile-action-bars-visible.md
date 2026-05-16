# TIP-076: Mobile Action Bars Visible

## HEADER
- TIP-ID: TIP-076
- Project: OCR Gemini Mobile Web POC
- Module: OCR result and history detail action bars
- Priority: P0
- Depends on: TIP-009, TIP-014, TIP-016, TIP-049
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: Authoritative stack from `coding-packs/product/tech-stack.md` if present; current scan reports React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Vitest, Testing Library, Playwright.
- Key files to read first:
  - `src/pages/OCRResultPage.tsx`
  - `src/pages/HistoryDetailPage.tsx`
  - `src/components/layout/Layout.tsx`
  - `src/components/layout/BottomNav.tsx`
  - `src/components/layout/Sidebar.tsx`
  - Existing E2E specs under `e2e/` that cover OCR result and history detail
- Patterns to follow:
  - Mobile-first layout from `coding-packs/standards/ui/mobile-first-responsive.md`
  - Runtime responsive behavior only when CSS cannot solve it, from `coding-packs/standards/ui/runtime-responsive-hooks.md`
  - Existing fixed action bar/button styling in OCR result and history detail pages

## APPLICABLE STANDARDS
Builder MUST conform to:
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — mobile base styles first; use `md:` only for tablet+ enhancements.
- [ui/runtime-responsive-hooks](../standards/ui/runtime-responsive-hooks.md) — prefer CSS responsive classes; use `useIsTablet()` only for behavior that cannot be expressed in CSS.

## TASK
Fix the mobile productization regression where fixed bottom action bars on OCR result and history detail pages do not expose core actions on mobile viewports below 768px. Make the actions visible, tappable, and accessible on mobile while preserving tablet/desktop sidebar spacing and avoiding duplicate bottom navigation.

## SPECIFICATIONS
### Business Rules
1. On `/ocr-result/:scanId`, mobile users must be able to see and tap the core actions: `Chụp`, `Sửa`, `Copy`, and `Chia sẻ`.
2. On `/history/:scanId`, mobile users must be able to see and tap the core actions: `Sửa`, `Xuất`, and `Xóa`.
3. The fixed action bar must be mobile-first: base classes support 320px-428px widths; `md:` classes may only enhance tablet/desktop placement.
4. Tablet and desktop layouts must retain sidebar-aware offset behavior where applicable, without clipping mobile actions.
5. The page-level action bar must not reintroduce duplicate app bottom navigation on result/detail pages that intentionally hide `BottomNav`.
6. Action buttons must meet mobile touch-target expectations from REQ-035: minimum 44px tap target, with visible focus states.
7. Existing action behavior must be preserved: retake/navigate, edit, copy, share, export, and delete confirmation must continue to call the existing handlers.
8. Do not change backend APIs, OCR data shape, scan storage, export logic, or navigation architecture.

### Validation
1. Verify at 320px, 375px, 768px, and 1024px widths that action bars are visible and not clipped.
2. Verify that every action button has an accessible name through visible text or `aria-label`.
3. Verify action bars do not overlap critical content in a way that hides the last table row or page metadata; add bottom padding only where needed.
4. Verify no duplicate mobile `BottomNav` appears on OCR result or history detail when those pages intentionally use their own action bar.
5. Verify the implementation does not rely on runtime viewport hooks unless CSS-only responsive classes are insufficient.

### Error Handling
1. Preserve existing error handling for copy/share/export/delete actions; do not introduce silent failures.
2. If an action is unavailable due to existing loading/error state, keep the current disabled or hidden behavior consistent with the page’s existing pattern.
3. Do not add broad new retry, auth, API, or storage error-handling behavior in this TIP.

## ACCEPTANCE CRITERIA
- Given a valid scan result at mobile width 375px, When the user opens `/ocr-result/:scanId`, Then the fixed action bar visibly exposes `Chụp`, `Sửa`, `Copy`, and `Chia sẻ` without horizontal clipping.
- Given a valid scan result at mobile width 320px, When the user tabs or taps through the fixed action bar, Then every action is reachable, has a minimum 44px tap target, and has an accessible name.
- Given a valid history detail page at mobile width 375px, When the user opens `/history/:scanId`, Then `Sửa`, `Xuất`, and `Xóa` are visible and tappable in the action area.
- Given tablet width 768px and desktop width 1024px, When the user opens OCR result and history detail pages, Then action bars remain aligned with the content/sidebar layout and are not clipped.
- Given OCR result and history detail pages, When rendering the full page, Then app `BottomNav` is not duplicated below the page-specific action bar.
- Given existing E2E coverage for OCR result/history detail, When relevant tests run, Then tests assert action visibility on mobile and pass.
- Given `npm run build`, `npx tsc --noEmit`, and the focused E2E specs, When verification runs after implementation, Then all checks pass or any pre-existing unrelated failures are explicitly documented with evidence.

## CONSTRAINTS
- DO NOT: Change backend/API contracts, OCR response parsing, scan data schema, auth flow, storage architecture, export service behavior, or add dependencies.
- DO NOT: Hide mobile actions behind desktop-only `md:`/`lg:` classes or require horizontal scrolling for primary actions.
- DO NOT: Reintroduce duplicate bottom navigation on result/detail pages.
- REUSE: Existing action handlers, existing button components/styles where practical, Tailwind responsive tokens, and current `Layout`/`BottomNav`/`Sidebar` patterns.
- REUSE: Existing Playwright setup and page mocks for OCR result/history detail verification.
- SKIP: Auth hydration race fixes, OCR field mapping fixes, broader accessibility sweep, typography redesign, and unrelated ESLint cleanup.

## QUALITY GATE SELF-REVIEW
- [x] TIP header complete with ID, project, module, priority, dependencies, estimate.
- [x] Context includes working dir, tech stack citation path, key files, and patterns to follow.
- [x] Task description is 2 sentences and scoped to mobile action bars.
- [x] Business rules are numbered and product/user focused.
- [x] Validation requirements cover mobile/tablet/desktop, accessibility, overlap, and duplicate nav.
- [x] Error handling is specified and constrained to existing action behavior.
- [x] Acceptance criteria are Given/When/Then and include mobile, tablet, desktop, E2E, and build checks.
- [x] Constraints include DO NOT / REUSE / SKIP sections.
- [x] Applicable Standards section lists matched UI standards.
- [x] Self-contained: builder can implement without clarifying questions.

Declared gaps: no UI-SPEC.md exists for this productization pass, so visual alignment must follow existing layout/components plus the mobile-first standards listed above.