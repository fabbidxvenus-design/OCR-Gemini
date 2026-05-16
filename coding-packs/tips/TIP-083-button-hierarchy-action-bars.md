# TIP-083: Button Hierarchy Differentiation in Action Bars

## Metadata
| Field | Value |
|-------|-------|
| **TIP** | TIP-083 |
| **Author** | Claude (auto-generated from PHASE 2 visual audit) |
| **Created** | 2026-05-17 |
| **Type** | Productization / Visual Polish |
| **Priority** | P1 |
| **Estimated Hours** | 1 |
| **Status** | READY |

## Problem Statement

The action bars in `OCRResultPage.tsx` (4 buttons) and `HistoryDetailPage.tsx` (3 buttons) use uniform `PrimaryButton` styling. The primary action ("Chia sẻ" / "Chia sẻ" in OCRResultPage; "Xuất" in HistoryDetailPage) should stand out visually from secondary actions ("Chụp", "Sửa", "Copy" / "Sửa", "Xóa").

**Current behavior**: All buttons look identical in size, weight, and prominence.

**Expected behavior**: Primary action button uses filled/highlighted style; secondary actions use subdued text/icon-only or outlined style. Visual hierarchy guides users to the most important action.

## Fix Pattern

Replace uniform `PrimaryButton` usage with a differentiated hierarchy:

### OCRResultPage (4 buttons) — change retake, edit, copy to icon-label:
```typescript
// Secondary: subdued, icon + label, no filled background
<button onClick={handleRetake} className="flex flex-col items-center gap-1 rounded-xl p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  <Camera className="h-5 w-5" />
  <span className="text-caption font-medium">Chụp</span>
</button>
// ... similar for edit, copy

// Primary: filled, stands out
<PrimaryButton className="px-2" onClick={handleShare} disabled={isSharing}>
  <Share2 className="mr-1.5 h-5 w-5" />
  Chia sẻ
</PrimaryButton>
```

### HistoryDetailPage (3 buttons) — differentiate export and delete:
```typescript
// Export: secondary outline style
<button onClick={handleExport} className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card p-3 text-small font-semibold text-text-primary transition-colors hover:bg-surface active:scale-[0.98]">
  <Download className="h-5 w-5" /> Xuất
</button>

// Delete: danger style with error color
<button onClick={handleDelete} className="flex items-center justify-center gap-2 rounded-xl border border-error/30 bg-error-light p-3 text-small font-semibold text-error transition-colors hover:bg-error/10 active:scale-[0.98]">
  <Trash2 className="h-5 w-5" /> Xóa
</button>

// Edit: secondary outline style
<button onClick={handleEdit} className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card p-3 text-small font-semibold text-text-primary transition-colors hover:bg-surface active:scale-[0.98]">
  <Edit className="h-5 w-5" /> Sửa
</button>
```

## Implementation Steps

### Step 1: Update OCRResultPage action bar
1. Read `src/pages/OCRResultPage.tsx`
2. Replace 3 `PrimaryButton variant="secondary"` with `button` elements using flex-col icon-label layout
3. Keep 1 `PrimaryButton` (primary, filled) for "Chia sẻ"

### Step 2: Update HistoryDetailPage action bar
1. Read `src/pages/HistoryDetailPage.tsx`
2. Remove unused `PrimaryButton` import
3. Replace all 3 `PrimaryButton` with `button` elements with appropriate styles
4. Export gets secondary outline style; Delete gets danger style; Edit gets secondary style

### Step 3: Verify
- `npm run lint` — no errors (unused import must be removed)
- `npm run build` — passes
- Manual visual check at mobile viewport (390px) — primary action stands out

## Files to Modify

- `src/pages/OCRResultPage.tsx`
- `src/pages/HistoryDetailPage.tsx`

## Constraints

- DO NOT change functionality or callbacks
- DO NOT remove existing hover/focus/active states
- DO NOT change touch targets below 44px
- Primary action must remain accessible with keyboard and screen readers
- Reuse existing design tokens: `border-card-border`, `bg-surface`, `bg-error-light`, `border-error/30`