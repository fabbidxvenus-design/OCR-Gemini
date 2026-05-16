# Phase 01: TIP-075 Implementation Plan

## Goal

Remove the duplicate consecutive `if (error)` branch in `src/pages/OCRResultPage.tsx` without changing behavior.

## Context

`OCRResultPage.tsx` currently has two identical `if (error)` return branches at lines 72 and 85. The second branch is unreachable and duplicate. Keep one branch and remove the other.

## Implementation Steps

1. **Update `src/pages/OCRResultPage.tsx`**:
   - Remove the second duplicate `if (error)` block only.
   - Preserve message, title, retry action, and `autoFocus` in the remaining branch.

2. **Run verification**:
   ```powershell
   npm exec vitest run src/__tests__/pages/OCRResultPage.test.tsx
   npm run build
   npx tsc --noEmit
   npx eslint --max-warnings 0 src/
   npm exec vitest run
   ```

3. **Review**:
   - Quick diff review to confirm only duplicate code was removed.

## Constraints

- `gsd-executor` is the only code writer.
- Do not change user-visible copy.
- Do not refactor unrelated code.
- Do not touch tests unless needed by verification failure.

## Success

Only one `if (error)` branch remains and verification commands pass.
