# TIP-030: Create HistoryCard Component

## HEADER
- **TIP-ID**: TIP-030
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Components / HistoryCard
- **Priority**: P0
- **Depends on**: TIP-027 (Tailwind design tokens)
- **Estimated**: M (2 hours)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/components/history/HistoryCard.tsx` (new), `design/ui-spec.md`
- **Reference**: `00-PROJECT-CONTEXT-REDESIGN.md` — Screen 2: History (Batch Select)

## TASK
Create a new `HistoryCard` component for displaying scan history items. This component supports multi-select mode with checkbox toggle. Used in HistoryPage for both normal and select modes.

## SPECIFICATIONS

### Component Props
```typescript
interface HistoryCardProps {
  id: string;
  title: string;
  timestamp: Date | string;
  thumbnailUrl?: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}
```

### Component Structure
```
┌─────────────────────────────────────┐
│ ☐ │ [img] │ SKU/Title    │   ›    │  ← Normal mode
│           │ 2 ngày trước │         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ☑ │ [img] │ SKU/Title    │   ›    │  ← Selected (blue border)
│           │ 2 ngày trước │         │
└─────────────────────────────────────┘
```

### Visual States

#### Normal State
- **Background**: `bg-card` (#FFFFFF)
- **Border**: 1px `border-border` (#E2E8F0)
- **Border radius**: 12px
- **Shadow**: `shadow-[0_8px_18px_-8px_rgba(15,23,42,0.08)]`
- **Padding**: 12px
- **Checkbox**: Empty circle, `text-muted`

#### Selected State
- **Border**: 2px `border-primary` (#2563EB)
- **Background**: Light blue tint `bg-primary/5`
- **Checkbox**: Filled circle, `bg-primary text-white`

### Content Layout
- **Checkbox**: 24px × 24px, left side (hidden in normal mode)
- **Thumbnail**: 48px × 48px, rounded-lg, `object-cover`
- **Text content**:
  - Title: `font-semibold text-text`, single line truncate
  - Timestamp: `text-sm text-muted`
- **Chevron**: Right arrow icon, `text-muted`

### Touch Target
- **Entire card**: Minimum height 72px
- **Checkbox**: 44px × 44px tap area
- **Click target**: Entire card clickable, separate from checkbox

## ACCEPTANCE CRITERIA
- Given HistoryCard When rendered normally Then shows title, timestamp, thumbnail
- Given HistoryCard When in select mode Then shows checkbox on left
- Given HistoryCard When selected Then blue border + blue checkbox fill
- Given HistoryCard When clicked Then onClick callback fires
- Given HistoryCard When checkbox tapped Then onSelect callback fires (not onClick)
- Given HistoryCard When timestamp is shown Then formatted as relative time ("2 ngày trước")
- Given HistoryCard When title is long Then truncated with ellipsis

## CONSTRAINTS
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles
- **DO NOT**: Include export functionality (that's in HistoryPage)
- **REUSE**: Use existing date formatting utilities if available

## FILES TO CREATE
- `src/components/history/HistoryCard.tsx` — New HistoryCard component

## FILES TO READ
- `src/lib/dateUtils.ts` or similar for date formatting patterns

---

*TIP-030 | Components | P0 | 2h | Depends on TIP-027*