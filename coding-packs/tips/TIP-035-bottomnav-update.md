# TIP-035: Update BottomNav Styling

## HEADER
- **TIP-ID**: TIP-035
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Polish / Navigation
- **Priority**: P0
- **Depends on**: TIP-027 (Tailwind design tokens)
- **Estimated**: S (1 hour)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/components/layout/BottomNav.tsx`
- **Reference**: `00-PROJECT-CONTEXT-REDESIGN.md` — Navigation Pattern

## TASK
Update BottomNav styling to match the new design system. Apply consistent visual language across navigation tabs. Ensure proper active/inactive states with primary blue accent.

## SPECIFICATIONS

### Navigation Layout
```
┌─────────────────────────────────────┐
│           Main Content              │
│                                     │
├─────────────────────────────────────┤
│  📷      📋      📊      ⚙️        │  ← 4 tabs (or 3)
│  Scan  Lịch sử  Thống kê  Settings │
│                                     │
│  [ Safe area bottom padding: 20px ] │
└─────────────────────────────────────┘
```

### Visual States

#### Active State
- **Icon**: Primary blue (`text-primary`)
- **Text**: Primary blue (`text-primary`)
- **Background**: Light blue tint (`bg-primary/10`)
- **Dot indicator**: Blue dot below icon (optional)

#### Inactive State
- **Icon**: Muted gray (`text-muted`)
- **Text**: Muted gray (`text-muted`)

### Layout Specs
- **Position**: Fixed bottom
- **Height**: 56px content + 20px safe area = 76px total
- **Background**: `bg-white` with top shadow
- **Tabs**: Equal width distribution
- **Icon size**: 24px
- **Text size**: 12px
- **Touch target**: Entire tab area (minimum 56px height)

### Icons (Lucide)
- `Camera` — Camera tab
- `History` — History tab
- `BarChart3` — Analytics tab
- `Settings` — Settings tab (if applicable)

## ACCEPTANCE CRITERIA
- Given BottomNav When rendered Then shows navigation tabs
- Given BottomNav When tab active Then icon and text turn primary blue
- Given BottomNav When tab inactive Then icon and text are muted gray
- Given BottomNav When rendered Then safe area padding applied
- Given BottomNav When rendered Then all touch targets ≥ 48px

## CONSTRAINTS
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles
- **DO NOT**: Change navigation routing logic
- **REUSE**: Keep existing routing functionality

## FILES TO MODIFY
- `src/components/layout/BottomNav.tsx` — Update styling only

---

*TIP-035 | Polish | P0 | 1h | Depends on TIP-027*