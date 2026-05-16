# Phase 01: TIP-074 Implementation Plan

## Goal

Wrap `writeLocalRemoteIds()` in `src/lib/localOcrScans.ts` with try/catch to prevent unhandled `QuotaExceededError` exceptions when localStorage is full.

## Context

`writeLocalRemoteIds()` at line 65 of `src/lib/localOcrScans.ts` calls `localStorage.setItem()` without try/catch. The sibling `writeLocalScans()` already has robust try/catch with fallback and warning logs. `writeLocalRemoteIds()` should match.

## Implementation Steps

1. **Update `src/lib/localOcrScans.ts`**:
   - Wrap the `localStorage.setItem()` call inside `writeLocalRemoteIds()` with try/catch.
   - On catch, log a developer-facing warning: `'[LocalOcrScans] Failed to persist remote-id map; storage may be full:'` plus the error.
   - Return gracefully — do not throw, do not call removeItem.

2. **Run verification**:
   ```powershell
   npm run build
   npx tsc --noEmit
   npx eslint --max-warnings 0 src/
   npm exec vitest run
   ```

3. **Review**: Quick code review on the single-line change.

## Constraints

- Do not change read-side behavior.
- Do not alter `writeLocalScans()`.
- Do not add new dependencies.
- Do not change functional behavior for non-error path.

## Success

`writeLocalRemoteIds()` no longer throws on quota error, and all verification commands pass.