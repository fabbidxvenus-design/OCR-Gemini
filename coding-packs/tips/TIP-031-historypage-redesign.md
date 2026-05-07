# TIP-031: Redesign HistoryPage (Multi-Select + Batch Export)

## HEADER
- **TIP-ID**: TIP-031
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Screens / History
- **Priority**: P0
- **Depends on**: TIP-030 (HistoryCard component)
- **Estimated**: XL (4 hours)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x, Zustand 5.x
- **Key files to read first**: `src/pages/HistoryPage.tsx`, `src/components/history/HistoryCard.tsx`
- **Reference**: `design/ui-spec.md` — Screen 2: History (06 History Variation - Cockpit)

## TASK
Redesign HistoryPage to support multi-select mode with floating batch export bar. Fix the issue where "Xuất Excel" was on single-result page instead of batch-friendly location. Add search and select toggle functionality.

## SPECIFICATIONS

### Page Layout
```
┌─────────────────────────────────────┐
│ StatusBar (dark)                    │
├─────────────────────────────────────┤
│ [Search...]              [Select]  │  ← Search + Select toggle
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐      │
│ │ HistoryCard (normal)       │      │
│ └─────────────────────────────┘      │
│ ┌─────────────────────────────┐      │
│ │ HistoryCard (selected)     │      │  ← Blue border when selected
│ └─────────────────────────────┘      │
├─────────────────────────────────────┤
│ (Floating bar appears when selected)│
│ ┌─────────────────────────────┐      │
│ │ 1 scan(s) │ [Xuất Excel]  │      │  ← Blue bar, fixed bottom
│ └─────────────────────────────┘      │
├─────────────────────────────────────┤
│ BottomNav                           │
└─────────────────────────────────────┘
```

### Search Bar
- **Position**: Below header, sticky
- **Background**: `bg-slate-800` (dark mode)
- **Border radius**: 12px
- **Height**: 48px
- **Icon**: Magnifying glass (Lucide `Search`)
- **Placeholder**: "Tìm kiếm..." (Search...)
- **Margin**: 16px horizontal

### Select Toggle
- **Position**: Right side of search row
- **Icon**: CheckSquare (Lucide)
- **Size**: 48px × 48px
- **Active state**: `bg-primary text-white`

### Floating Export Bar
- **Position**: Fixed bottom, above BottomNav
- **Height**: 96px (including safe area)
- **Background**: `bg-primary text-white` (blue bar)
- **Border radius**: 20px top corners
- **Content**:
  - Left: Selection count ("X scan(s) selected")
  - Right: Export Excel button with `FileSpreadsheet` icon
- **Animation**: Slide up when items selected, slide down when deselected
- **Shadow**: `shadow-xl`

### Batch Export Flow
1. Tap "Select" button → Enter select mode
2. Tap items to select → Blue border indicates selection
3. Floating bar appears with count + Export button
4. Tap "Xuất Excel" → Export all selected to Excel file
5. Tap "Cancel" or deselect all → Floating bar dismisses

## ACCEPTANCE CRITERIA
- Given HistoryPage When not in select mode Then shows normal card list
- Given HistoryPage When tap Select button Then enters multi-select mode
- Given HistoryPage When in select mode Then checkboxes visible on all cards
- Given HistoryPage When item selected Then card shows blue border
- Given HistoryPage When items selected Then floating export bar appears
- Given HistoryPage When tap Export Excel Then exports all selected items
- Given HistoryPage When tap Cancel Then exits select mode
- Given HistoryPage When search Then filters list in real-time
- Given HistoryPage When no results Then shows empty state

## CONSTRAINTS
- **DO NOT**: Change Excel export logic (keep existing implementation)
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles
- **REUSE**: Use HistoryCard from TIP-030

## FILES TO MODIFY
- `src/pages/HistoryPage.tsx` — Add multi-select + floating bar

---

*TIP-031 | Screens | P0 | 4h | Depends on TIP-030*