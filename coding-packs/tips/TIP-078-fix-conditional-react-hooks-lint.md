# TIP-078: Fix Conditional React Hooks Lint

## HEADER
- TIP-ID: TIP-078
- Project: OCR Gemini Mobile Web POC
- Module: React page lint / hook ordering
- Priority: P0
- Depends on: TIP-017, TIP-069, TIP-076, TIP-077
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web\.claude\worktrees\agent-a464625b5fc3fa41f`
- Tech stack: React 19.2.5, TypeScript 6.0.2, Vite 8.0.10, React Router DOM 7.14.2, Tailwind CSS 3.4.19, Zustand 5.0.13, Dexie 4.4.x, Playwright E2E. [SoT: `coding-packs/00-PROJECT-CONTEXT.md`]
- Key files to read first:
  - `src/pages/OCRResultPage.tsx`
  - `src/pages/AnalyticsPage.tsx`
  - `src/hooks/useScans.ts`
  - `src/lib/fieldCategories.ts`
- Patterns to follow:
  - React hooks must run before any conditional component return.
  - When a hook depends on async/live-query data that can be missing, use optional chaining and empty-array/default fallbacks inside the hook callback.
  - Preserve existing loading, missing-data, layout, action-bar, and navigation behavior.

## APPLICABLE STANDARDS
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — keep mobile-first page behavior intact while making hook-order-only fixes.

## TASK
Fix PHASE 1 ESLint `react-hooks/rules-of-hooks` failures caused by conditional `useMemo` calls in OCR result and analytics pages. Move hook declarations above all early returns and make the memoized calculations safe for missing scan/analytics data without changing page behavior.

## SPECIFICATIONS
### Business Rules
1. `src/pages/OCRResultPage.tsx` must not call `useMemo` after `if (isPendingMissing)` or `if (!scan)` returns.
2. `src/pages/AnalyticsPage.tsx` must not call any `useMemo` after loading/empty/error early returns.
3. Existing visible UI states must remain unchanged:
   - pending/missing scan message
   - loading skeletons
   - analytics empty/loading states
   - OCR result table and fixed action bar
4. Memoized computations must tolerate undefined data using optional chaining, nullish coalescing, or empty arrays.
5. Do not weaken lint rules or suppress hook lint errors.

### Validation
- Run `npx eslint src/pages/OCRResultPage.tsx src/pages/AnalyticsPage.tsx --max-warnings 0`.
- Run `npm run build`.
- If OCR result behavior is touched, run `npx playwright test e2e/ocr-result.spec.ts --reporter=list`.

### Error Handling
- If a memoized calculation needs data that is not available yet, return an empty/default computed structure and let existing early-return UI handle display.
- If lint still reports conditional hooks, inspect all hook calls and move every hook before the first possible return.
- If build fails outside these two files, report it separately and do not broaden this TIP without evidence.

## ACCEPTANCE CRITERIA
- Given `OCRResultPage` renders with no scan loaded When ESLint checks the file Then no conditional hook error is reported and the loading UI still renders.
- Given `OCRResultPage` renders with a missing pending scan When the component returns the missing-result state Then every hook has already been called in a stable order.
- Given `AnalyticsPage` renders loading or empty states When ESLint checks the file Then all `useMemo` calls are unconditional and hook order is stable.
- Given the focused validation commands run When the fix is complete Then `npm run build` passes and the focused ESLint command has 0 errors.
- Given OCR result E2E is run When the fix is complete Then `e2e/ocr-result.spec.ts` remains 9/9 passing.

## CONSTRAINTS
- DO NOT: disable ESLint rules, add `eslint-disable`, remove tests, change dependencies, or alter backend/API/data model behavior.
- DO NOT: change action-bar layout, table labels, analytics calculations, or route behavior except where required to safely move hooks.
- REUSE: existing `groupSizeQuantityFields`, `categorizeFields`, analytics calculations, UI components, and loading/empty states.
- SKIP: unrelated lint errors in hooks, stores, filters, auth, or E2E files; handle those in separate TIPs.

## Quality Gate: Self-Review
- Completeness: The TIP names the exact lint class, files, required hook-order pattern, validation commands, and constraints.
- Cross-reference: Consistent with project context, mobile-first UI standard, and current PHASE 1 lint evidence.
- Gaps: Full-repo lint has additional unrelated errors that are intentionally out of scope for this focused hook-order TIP.
- Action needed: Implement TIP-078 in target worktree, verify focused ESLint, build, and OCR result E2E.
