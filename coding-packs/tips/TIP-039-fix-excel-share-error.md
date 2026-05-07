# TIP-039: Fix Excel Export Share Error on Mobile

## HEADER
- TIP-ID: TIP-039
- Project: OCR Gemini Mobile Web
- Module: Export (src/lib/excel.ts)
- Priority: P1
- Depends on: TIP-012 (Excel export)
- Estimated: S (1 hour)

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18 + TypeScript + Vite + ExcelJS + Web Share API
- Key files to read first:
  - `src/lib/excel.ts` (export logic)
  - `src/pages/HistoryDetailPage.tsx` (export trigger)
- Patterns to follow: Mobile-first, graceful error handling

## TASK
Fix bug where clicking "Xuất Excel" on mobile shows a "Permission denied" error alert even though the file still downloads successfully. The error occurs in the Web Share API flow, but the fallback download still works.

## SPECIFICATIONS

### Business Rules
1. On mobile (iOS/Android), when `navigator.share` fails with "Permission denied":
   - Do NOT show error alert to user
   - Fallback silently to download method
2. File should download regardless of share API availability
3. No popup should appear if share fails but download succeeds

### Error Handling
1. **Share API "Permission denied" error**: Catch and silently fallback to download
2. **User cancelled share**: Also fallback silently (AbortError)
3. **File Picker cancelled**: Fallback silently to download
4. **Only report errors to user if ALL methods fail**

### Root Cause Analysis
The current code at `src/lib/excel.ts` line 48-49:
```typescript
} catch (err) {
  // User cancelled or error
  if ((err as Error).name !== 'AbortError') {
    console.error('[Share] Share failed:', err);
    alert(`Lỗi chia sẻ: ${(err as Error).message}`);  // <-- BUG: Shows alert
  }
}
```
The `alert()` is shown for ALL share errors including "Permission denied", even though the file still downloads via fallback.

## ACCEPTANCE CRITERIA
- Given user clicks "Xuất Excel" on mobile with share API available
- When share API returns "Permission denied" error
- Then NO alert should appear, file should download silently

- Given user clicks "Xuất Excel" on mobile with share API available
- When user cancels share dialog
- Then NO alert should appear, file should download silently

- Given user clicks "Xuất Excel" on any platform
- When all share methods fail
- Then show appropriate error message

## CONSTRAINTS
- DO NOT: Show alert for recoverable errors (share failed but download works)
- REUSE: Existing download fallback logic
- SKIP: Testing on all mobile browsers (focus on most common)

## FILES TO MODIFY
- `src/lib/excel.ts` - Fix error handling in `shareFile()` function