# Phase 01: TIP-071 Implementation Plan

## Goal

Add explicit error state to `useScan()` and render user-visible `ErrorMessage` on `OCRResultPage` and `HistoryDetailPage` when remote single-scan API calls fail. Follow existing `useScansState` error pattern and `ErrorMessage` UI.

## Context

Root cause: `useScan()` in `src/hooks/useScans.ts` catches `scansApi.getScan()` errors, logs them, then only sets `scan` to undefined — no `error` field exposed. Affected pages render ambiguous empty/indefinite-loading states. The fix must add `error` to the hook's return interface and use it in the two page components.

## Implementation Steps

1. **Update `src/hooks/useScans.ts`**:
   - Add `error: string | null` to `UseScanResult` interface.
   - Add `useState<string | null>(null)` for `error` alongside existing states.
   - In `loadScan()`: on `catch`, set `error` to a Vietnamese user message AND set `scan` to undefined.
   - Clear `error` at the start of a new load attempt (before `setIsLoading(true)`).
   - Local/pending scan branches must NOT set `error` — only remote API failures.

2. **Update `src/pages/OCRResultPage.tsx`**:
   - Destructure `error` from `useScan(scanId)`.
   - Add `ErrorMessage` rendering before the skeleton/loading states, inside the Layout, with retry action calling `window.location.reload()`.
   - Keep existing `isPendingMissing` branch above the error branch so local scan misses remain distinct.

3. **Update `src/pages/HistoryDetailPage.tsx`**:
   - Destructure `error` from `useScan(scanId)`.
   - Add `ErrorMessage` rendering when `error` is truthy and `!isLoading`, with retry calling `window.location.reload()` and safe fallback via `navigate('/history')`.

4. **Run verification**:
   ```powershell
   npm run build
   npx tsc --noEmit
   npx eslint --max-warnings 0 src/
   npm exec vitest run
   npx playwright test e2e/ocr-result.spec.ts --reporter=line
   ```

5. **If build/type/lint fails**: fix incrementally. If reviewer finds issues, gsd-executor continues fixing until green.

## Constraints

- `gsd-executor` is the only code writer.
- Do not change backend API contracts.
- Do not add dependencies.
- Do not alter auth architecture.
- Do not add console.log.
- Do not change unrelated E2E assertions.
- Preserve existing skeleton loading states and local/pending scan behavior.

## Success

All 5 verification commands pass. Remote scan load failure now renders `ErrorMessage` on both affected pages. Local/pending scan misses remain unchanged.