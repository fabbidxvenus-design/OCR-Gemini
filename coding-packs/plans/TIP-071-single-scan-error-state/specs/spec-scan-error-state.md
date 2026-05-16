# SPEC: TIP-071 Single Scan Error State

## Behavioral Specs

### SPEC-001: useScan exposes error state
- Given `scansApi.getScan()` rejects
- When `useScan(scanId)` handles the rejection
- Then the hook returns `error` with a user-facing Vietnamese message and `isLoading` becomes false

### SPEC-002: Error clears when new load starts
- Given `useScan` is in error state
- When a new scan load begins (after mount or retry)
- Then `error` is cleared before loading starts

### SPEC-003: Local/pending missing scans do not set error
- Given a scan ID starts with `local-` or `pending-` but no local/pending scan exists
- When `useScan(scanId)` runs
- Then `isPendingMissing` is true and `error` remains null

### SPEC-004: OCR result page shows ErrorMessage on remote failure
- Given `useScan(scanId)` returns `error` truthy (not local/pending)
- When `OCRResultPage` renders
- Then the user sees an accessible `ErrorMessage` with retry action instead of an ambiguous blank/loading state

### SPEC-005: History detail page shows ErrorMessage on remote failure
- Given `useScan(scanId)` returns `error` truthy (not local/pending)
- When `HistoryDetailPage` renders
- Then the user sees an accessible `ErrorMessage` with retry/safe-nav action instead of indefinite `Đang tải...`

## Verification Commands

```powershell
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
npx playwright test e2e/ocr-result.spec.ts --reporter=line
```

## Green Gate

All commands pass, or unblocking infrastructure issues are documented with evidence.