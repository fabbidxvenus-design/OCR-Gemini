# TIP-040: Fix Multi-Select Excel Export Not Working on History Page

## HEADER
- TIP-ID: TIP-040
- Project: OCR Gemini Mobile Web
- Module: Export (src/pages/HistoryPage.tsx)
- Priority: P1
- Depends on: TIP-026 (Multi-select export)
- Estimated: S (1 hour)

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18 + TypeScript + Dexie (IndexedDB) + ExcelJS
- Key files to read first:
  - `src/pages/HistoryPage.tsx` (export trigger UI)
  - `src/hooks/useExport.ts` (export logic)
  - `src/hooks/useScans.ts` (data fetching)
  - `src/lib/excel.ts` (export implementation)

## TASK
Fix bug where clicking "Xuất Excel" button after selecting multiple scans in History page does nothing. No error, no loading state, no file download.

## SPECIFICATIONS

### Bug Analysis
The current flow in `HistoryPage.tsx`:
```typescript
const handleExportSelected = async () => {
  if (!scans || selectedIds.size === 0) return;
  const selectedScans = scans.filter(s => s.id && selectedIds.has(s.id));
  await exportMultiple(selectedScans);
};
```

**Possible root causes:**
1. `scans` might be `undefined` when `useScans` hasn't loaded yet
2. `selectedIds.has(s.id)` check fails because `s.id` could be `undefined` (TypeScript type issue)
3. The filter might return empty array if `id` comparison logic is wrong

### Debug Requirements
1. Add console.log to `handleExportSelected` to trace:
   - `scans` length
   - `selectedIds` size
   - filtered `selectedScans` length
2. Add loading/error state indicator so user knows something is happening

### Business Rules
1. When user clicks "Xuất Excel" with selections, show loading state immediately
2. Filter scans correctly using `selectedIds` Set
3. Handle case where `scans` is still loading (undefined)
4. Show error if export fails

### Error Handling
1. If `scans` is undefined/loading: show "Đang tải..." and wait
2. If `selectedScans` is empty: show "Không có scan nào được chọn"
3. If export fails: show error message

## ACCEPTANCE CRITERIA
- Given user is on History page with select mode active
- When user selects multiple scans and clicks "Xuất Excel"
- Then export should begin immediately and loading state shows

- Given user selects 3 scans and clicks export
- When the button is clicked
- Then a file containing all 3 scans should download

- Given there are no scans to select
- When user clicks "Xuất Excel"
- Then no action should happen (button should be disabled)

## CONSTRAINTS
- DO NOT: Add complex error handling that hides the bug
- DO NOT: Skip debugging and assume the issue
- REUSE: Existing `exportMultiple` from `useExport` hook
- SKIP: Multi-device testing (focus on verifying the fix works)

## FILES TO MODIFY
- `src/pages/HistoryPage.tsx` - Debug and fix export logic
- `src/hooks/useExport.ts` - Add loading state propagation (if needed)

## DEBUG STEPS
1. Add console.log before filter: `console.log('[History] Exporting:', selectedIds.size, 'scans')`
2. Check if `scans` is undefined vs empty array
3. Verify `selectedIds.has(s.id!)` works correctly
4. Add toast notification for success/failure