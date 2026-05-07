# TIP-026: Move Excel Export to History (Multi-Select)

## HEADER
- TIP-ID: TIP-026
- Project: OCR Gemini Mobile Web
- Module: Export/History
- Priority: P2
- Depends on: TIP-013
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + Tailwind CSS + Dexie.js
- Key files to read first:
  - `src/pages/OCRResultPage.tsx` (has export button to remove)
  - `src/pages/HistoryDetailPage.tsx` (has export button to remove)
  - `src/pages/HistoryPage.tsx` (add multi-select export here)
  - `src/hooks/useExport.ts` (export logic)

## APPLICABLE STANDARDS
- none

## TASK
Xuất Excel chỉ hợp lý khi export NHIỀU items cùng lúc. Cần:
1. Xóa nút "Xuất Excel" khỏi OCRResultPage và HistoryDetailPage
2. Thêm multi-select + export vào HistoryPage

## SPECIFICATIONS

### Remove Export from Result Pages

**1. OCRResultPage.tsx:**
- Remove `handleExport` function
- Remove `useExport` hook import
- Remove export button from action bar
- Keep only: [Sao chép] [Chia sẻ] [Sửa]

**2. HistoryDetailPage.tsx:**
- Remove `handleExport` function
- Remove `useExport` hook import
- Remove export button from action bar
- Keep only: [Sửa] [Xóa scan]

### Add Multi-Select Export to HistoryPage

**New Flow:**
```
┌─────────────────────────────┐
│ □ Scan 1    05/05  INVOICE  │
│ □ Scan 2    04/05  LABEL    │
│ ■ Scan 3    03/05  ORDER    │  ← Selected
│ □ Scan 4    02/05  INVOICE  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ [Chọn tất cả] [Bỏ chọn]    │  ← Selection controls
└─────────────────────────────┘
┌─────────────────────────────┐
│ [Xuất Excel] (2 items)     │  ← Only show when selected > 0
└─────────────────────────────┘
```

**Implementation:**

```tsx
// HistoryPage.tsx - Add state
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [isSelectMode, setIsSelectMode] = useState(false);

// Toggle select mode
const toggleSelectMode = () => {
  setIsSelectMode(!isSelectMode);
  setSelectedIds(new Set());
};

// Toggle item selection
const toggleSelect = (id: string) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedIds(newSelected);
};

// Select all
const selectAll = () => {
  if (scans) {
    setSelectedIds(new Set(scans.map(s => s.id)));
  }
};

// Export selected
const exportSelected = async () => {
  if (!scans || selectedIds.size === 0) return;

  const selectedScans = scans.filter(s => selectedIds.has(s.id!));
  await exportScans(selectedScans); // Batch export
};
```

**UI Changes:**
1. Add checkbox to each scan card (when select mode on)
2. Add floating action bar at bottom when items selected:
   ```tsx
   {selectedIds.size > 0 && (
     <div className="fixed bottom-20 left-0 right-0 p-4 bg-primary text-white">
       <div className="flex items-center justify-between">
         <span>{selectedIds.size} items selected</span>
         <button onClick={exportSelected}>Xuất Excel</button>
       </div>
     </div>
   )}
   ```

### Update Export Hook

**src/hooks/useExport.ts:**
```tsx
// Already exists: exportScan(scan) for single
// Add: exportScans(scans: ScanRecord[]) for batch
```

## ACCEPTANCE CRITERIA

### AC-001: Export removed from result page
- Given **User on OCRResultPage**
- When **User looks at action buttons**
- Then **No "Xuất" button visible**

### AC-002: Export removed from detail page
- Given **User on HistoryDetailPage**
- When **User looks at action buttons**
- Then **Only [Sửa] and [Xóa] buttons visible**

### AC-003: Multi-select enabled
- Given **User on HistoryPage**
- When **User taps select button**
- Then **Checkboxes appear on scan cards**

### AC-004: Selection count shown
- Given **3 items selected**
- When **User sees selection bar**
- Then **"3 items selected" displayed**

### AC-005: Export enabled with selection
- Given **2+ items selected**
- When **User taps "Xuất Excel"**
- Then **Excel downloads with all selected scans**

## CONSTRAINTS
- DO NOT: Change export logic (reuse existing useExport hook)
- DO NOT: Add date range filter (only multi-select)
- REUSE: useExport hook, exportScans function
- SKIP: Analytics page export (out of scope)

## FILES TO MODIFY

1. **src/pages/OCRResultPage.tsx** - Remove export button
2. **src/pages/HistoryDetailPage.tsx** - Remove export button
3. **src/pages/HistoryPage.tsx** - Add multi-select + export
4. **src/hooks/useExport.ts** - Add batch export function

## ESTIMATED HOURS
- Remove from 2 pages: 0.5h
- Add multi-select UI: 3h
- Batch export logic: 1h
- Testing: 0.5h
- **Total: ~5h (M)**