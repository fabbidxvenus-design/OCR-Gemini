# TIP-025: Fix Header + Action Buttons UI

## HEADER
- TIP-ID: TIP-025
- Project: OCR Gemini Mobile Web
- Module: UI/Fixes
- Priority: P2
- Depends on: TIP-023
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + Tailwind CSS
- Key files to read first:
  - `src/components/layout/Header.tsx` (has relative positioning issue)
  - `src/pages/HistoryDetailPage.tsx` (action buttons at lines ~265-285)

## APPLICABLE STANDARDS
- none

## TASK
Fix two UI issues on mobile:
1. Header layout is not optimal (needs cleaner fixed positioning)
2. Action buttons "Sửa, Xuất, Xóa" in HistoryDetailPage look poor (floating, inconsistent)

## SPECIFICATIONS

### Issue 1: Header Layout
**Current (problematic):**
```tsx
<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 safe-area-top">
```

**Problem:**
- `z-40` is arbitrary, should use consistent z-index
- Safe area handling may not be optimal

**Fix:**
```tsx
<header className="sticky top-0 z-50 bg-card border-b border-card-border safe-area-top">
  <div className="flex items-center justify-between h-14 px-4">
    ...
  </div>
</header>
```
- Use `sticky` instead of `fixed` for better scroll behavior
- Clean z-index with `z-50`
- Use design token colors

### Issue 2: Action Buttons in HistoryDetailPage
**Current (lines ~265-285):**
```tsx
<div className="fixed bottom-20 left-0 right-0 p-4 bg-card border-t border-card-border safe-area-bottom">
  <div className="flex gap-2">
    <button onClick={handleEdit} className="flex-1 ... bg-card border-2 border-primary text-primary ...">
      Sửa
    </button>
    <button onClick={handleExport} ... className="flex-1 ... bg-primary text-white ...">
      Xuất
    </button>
    <button onClick={handleDelete} className="w-14 ... bg-error/10 border-2 border-error text-error ...">
      Xóa
    </button>
  </div>
</div>
```

**Problem:**
- Delete button is a small square (w-14) - bad UX
- Buttons have inconsistent border styles
- Too much visual weight

**Fix (Option A - Clean 2-row layout):**
```tsx
{/* Main Actions */}
<div className="flex gap-3 mb-3">
  <button
    onClick={handleEdit}
    className="flex-1 flex items-center justify-center gap-2 bg-card border-2 border-card-border text-text-primary py-3.5 rounded-xl font-semibold hover:bg-surface transition-colors active:scale-[0.98]"
  >
    <Edit className="w-5 h-5" />
    Sửa
  </button>
  <button
    onClick={handleExport}
    disabled={isExporting}
    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-[0.98]"
  >
    {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
    Xuất Excel
  </button>
</div>

{/* Secondary Action - Delete */}
<button
  onClick={handleDelete}
  className="w-full flex items-center justify-center gap-2 bg-error/10 text-error py-3 rounded-xl font-medium hover:bg-error/15 transition-colors"
>
  <Trash2 className="w-4 h-4" />
  <span className="text-sm">Xóa scan</span>
</button>
```

**Key changes:**
- Remove fixed positioning (let it scroll naturally)
- Use full-width buttons in content area
- Delete as secondary action below
- Remove `border-2` from edit button (too heavy)
- Consistent rounded-xl

**Option B - Sticky Bottom Bar (if prefer fixed):**
Keep fixed but redesign:
```tsx
<div className="fixed bottom-20 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-card-border safe-area-bottom">
  <div className="flex gap-2">
    <button onClick={handleEdit} className="flex-1 bg-card border border-card-border text-text-primary py-3 rounded-xl font-medium hover:bg-surface">
      <Edit className="w-4 h-4 mx-auto mb-1" />
      <span className="text-xs">Sửa</span>
    </button>
    <button onClick={handleExport} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium">
      <Download className="w-4 h-4 mx-auto mb-1" />
      <span className="text-xs">Xuất</span>
    </button>
    <button onClick={handleDelete} className="bg-error/10 text-error py-3 px-4 rounded-xl font-medium">
      <Trash2 className="w-4 h-4 mx-auto mb-1" />
      <span className="text-xs">Xóa</span>
    </button>
  </div>
</div>
```

## ACCEPTANCE CRITERIA
- Given **HistoryDetailPage on mobile** When **User views page** Then **Action buttons look clean and touch-friendly**
- Given **Header** When **Page scrolls** Then **Header stays at top with proper styling**
- Given **Build** When **Run** Then **Pass without errors**

## CONSTRAINTS
- DO NOT: Change functionality (only UI fixes)
- REUSE: Keep existing design tokens from tailwind.config.js
- SKIP: Other pages (only fix HistoryDetailPage actions + Header)

## FILES TO MODIFY

1. **src/components/layout/Header.tsx**
   - Change to sticky positioning
   - Use design token colors

2. **src/pages/HistoryDetailPage.tsx**
   - Redesign action buttons section (lines ~265-285)
   - Option A: Move to content area (recommended)
   - Option B: Keep fixed but with better styling