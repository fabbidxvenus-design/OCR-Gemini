# TIP-032: Redesign OCRResultPage (Light Mode Cards)

## HEADER
- **TIP-ID**: TIP-032
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Screens / Detail
- **Priority**: P0
- **Depends on**: TIP-027 (Tailwind design tokens)
- **Estimated**: M (2 hours)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/pages/OCRResultPage.tsx`, `src/components/ocr/ResultCard.tsx`
- **Reference**: `design/ui-spec.md` — Screen 3: Detail (07 Detail Variation - Cockpit)

## TASK
Redesign OCRResultPage to light mode cards with fixed bottom action bar. This is the Detail screen for viewing scan results. Optimize for readability (light mode) with card-based structure. Add fixed bottom actions (Edit, Copy, Share).

## SPECIFICATIONS

### Page Layout
```
┌─────────────────────────────────────┐
│ StatusBar (light mode)              │
├─────────────────────────────────────┤
│ [<] Kết quả OCR           [Sửa]     │  ← Back + Edit buttons
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐     │
│ │     [ Scan Image ]         │     │  ← 4:3 aspect ratio
│ └─────────────────────────────┘     │
│                                     │
│ ┌─────────────────────────────┐     │
│ │ 📄 Hóa đơn #12345          │     │  ← Title card
│ │     Hôm nay, 10:30          │     │
│ └─────────────────────────────┘     │
│                                     │
│ ┌─────────────────────────────┐     │
│ │ THÔNG TIN                  │     │  ← Section header
│ │ ─────────────────────────── │     │
│ │ Số hóa đơn          12345  │     │
│ │ Ngày              15/01/24 │     │
│ │ Tổng cộng    1,500,000 đ   │     │  ← Success green if verified
│ └─────────────────────────────┘     │
│                                     │
│ ┌─────────────────────────────┐      │
│ │ BẢNG SIZE                  │     │  ← Optional size table
│ └─────────────────────────────┘      │
├─────────────────────────────────────┤
│ [Sửa]      [Sao chép]    [Chia sẻ]  │  ← Fixed bottom actions
└─────────────────────────────────────┘
```

### Theme
- **Background**: `bg-surface` (#F8FAFC) — light mode
- **Cards**: `bg-card` (#FFFFFF) with border
- **Text**: `text-text` (#111827) for readability

### Image Preview Card
- **Aspect ratio**: 4:3
- **Border radius**: 12px
- **Click behavior**: Expand to full-screen viewer
- **Shadow**: Standard card shadow

### Title Card
- **Icon**: Document icon (Lucide `FileText`)
- **Title**: Document type + ID
- **Timestamp**: Relative time formatted

### Fields Card
- **Section header**: Uppercase, smaller font, `text-muted`
- **Field layout**: Label left, Value right
- **Verified fields**: Green checkmark icon + `text-success`
- **Low confidence fields**: Amber background tint (`bg-warning` / #FFFBEB)
- **No confidence badges**: Use subtle background hints instead

### Size Table Card (if applicable)
- **Header**: Uppercase section title
- **Columns**: Size | Quantity
- **Rows**: Data rows with alternating backgrounds

### Fixed Bottom Actions
- **Position**: Fixed bottom, 104px height
- **Background**: `bg-white` with shadow + blur
- **Layout**: 3 equal columns
- **Buttons**:
  - Edit (Sửa): Outline style, `border-border`
  - Copy (Sao chép): Outline style, `border-border`
  - Share/Export: Primary fill, `bg-primary text-white`
- **Touch targets**: 48px height minimum

## ACCEPTANCE CRITERIA
- Given OCRResultPage When rendered Then light mode background for readability
- Given OCRResultPage When rendered Then card-based structure
- Given OCRResultPage When rendered Then fixed bottom action bar
- Given OCRResultPage When verified field Then shows green checkmark
- Given OCRResultPage When low confidence field Then amber background hint
- Given OCRResultPage When rendered Then NO confidence badges ("Cao/Trung bình/Thấp")
- Given OCRResultPage When action buttons Then all ≥ 48px touch targets

## CONSTRAINTS
- **DO NOT**: Change OCR result data structure
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles
- **REUSE**: Keep existing OCR result rendering logic

## FILES TO MODIFY
- `src/pages/OCRResultPage.tsx` — Light mode redesign with fixed actions

---

*TIP-032 | Screens | P0 | 2h | Depends on TIP-027*