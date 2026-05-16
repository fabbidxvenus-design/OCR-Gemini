# TIP-079: Fix Remaining PHASE 1 Lint Errors

## HEADER
- TIP-ID: TIP-079
- Project: OCR Gemini Mobile Web POC
- Module: Lint cleanup for hooks, stores, utilities, and E2E
- Priority: P0
- Depends on: TIP-078
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web\.claude\worktrees\agent-a464625b5fc3fa41f`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Dexie 4.4.x, Playwright E2E. [SoT: `coding-packs/00-PROJECT-CONTEXT.md`]
- Key files to read first:
  - `e2e/profile.spec.ts`
  - `src/components/layout/ProtectedRoute.tsx`
  - `src/hooks/useCamera.ts`
  - `src/hooks/useExport.ts`
  - `src/hooks/useMediaQuery.ts`
  - `src/hooks/useScans.ts`
  - `src/hooks/useSettings.ts`
  - `src/lib/scanFilters.ts`
  - `src/store/authStore.ts`
- Patterns to follow:
  - Prefer type-safe `unknown` error narrowing over `any`.
  - Avoid impure calls like `Date.now()` during render; derive time through state/effect or store checks.
  - Avoid synchronous setState directly in effect bodies by using lazy state initialization or asynchronous callback boundaries.
  - Wrap `switch` case lexical declarations in braces.

## APPLICABLE STANDARDS
- [ui/runtime-responsive-hooks](../standards/ui/runtime-responsive-hooks.md) — keep responsive hooks stable and browser-safe.
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — do not regress mobile-first layout while fixing lint.

## TASK
Resolve remaining PHASE 1 ESLint errors after TIP-078 without changing product behavior. Apply minimal, focused fixes to lint violations in E2E tests, layout/session validation, hooks, stores, and scan filter utilities, then verify full lint/build/focused E2E.

## SPECIFICATIONS
### Business Rules
1. `e2e/profile.spec.ts` must not define unused helpers.
2. `ProtectedRoute` must not call `Date.now()` directly during render.
3. `useExport`, `useSettings`, and `authStore` must remove `any` from caught errors by narrowing `unknown` safely.
4. `useMediaQuery` must not synchronously set state in an effect body; initialize from current `matchMedia` state where safe and subscribe for future changes.
5. `useSettings` must avoid direct synchronous state update calls triggered by the effect lint rule while keeping settings load-on-mount behavior.
6. `useScans` must not bind unused caught errors.
7. `scanFilters` must wrap `case 'fields_count'` declarations in a block.
8. Do not suppress lint rules with comments unless a React Hook Form compiler warning is proven unavoidable and scoped.

### Validation
- Run `npx eslint src/ e2e/ --max-warnings 0`.
- Run `npm run build`.
- Run `npx playwright test e2e/ocr-result.spec.ts --reporter=list` to guard the recently fixed result flow.

### Error Handling
- Use a local `getErrorMessage(error: unknown, fallback: string)` style helper only where it reduces repetition in the same file.
- Preserve user-facing Vietnamese error strings.
- Preserve session-expired logout behavior when API errors indicate 401/AUTH_FAILED.

## ACCEPTANCE CRITERIA
- Given the full source and E2E tree When ESLint runs with `--max-warnings 0` Then it exits with 0 errors and 0 warnings, or any remaining warning is explicitly documented as outside this TIP with evidence.
- Given a protected route renders When session expiry is checked Then render remains pure and expired sessions still navigate to `/login`.
- Given export/settings/auth API calls throw unknown errors When handlers catch them Then UI state is updated with the same user-facing messages without `any`.
- Given history sorting by field count When `scanFilters` runs Then sort order is unchanged and `no-case-declarations` is fixed.
- Given the OCR result focused E2E runs When lint fixes are complete Then all 9 OCR result tests still pass.

## CONSTRAINTS
- DO NOT: change dependencies, backend/API contracts, authentication UX, route names, OCR result UI, or analytics calculations.
- DO NOT: broadly refactor hooks or stores beyond the lint findings.
- REUSE: existing API types, store methods, error copy, and helper patterns.
- SKIP: performance optimization, bundle splitting, visual redesign, or productization changes not required for lint correctness.

## Quality Gate: Self-Review
- Completeness: Captures every currently reported PHASE 1 full-lint error cluster after TIP-078.
- Cross-reference: Consistent with project context, responsive hook standards, and current ESLint evidence.
- Gaps: React Hook Form `incompatible-library` warning in `EditPage` may require a scoped disable or API adjustment; builder must verify whether it remains under `--max-warnings 0`.
- Action needed: Implement minimal lint fixes in target worktree, then run full lint, build, and focused OCR result E2E.
