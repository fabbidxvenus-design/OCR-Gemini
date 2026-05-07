# TIP-034: Redesign AnalyticsPage (Dark Mode + Date Tabs)

## HEADER
- **TIP-ID**: TIP-034
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Screens / Analytics
- **Priority**: P0
- **Depends on**: TIP-033 (KPICard component)
- **Estimated**: M (2 hours)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x, Zustand 5.x
- **Key files to read first**: `src/pages/AnalyticsPage.tsx`, `src/components/analytics/KPICard.tsx`
- **Reference**: `design/ui-spec.md` — Screen 4: Analytics (08 Analytics Variation - Cockpit)

## TASK
Redesign AnalyticsPage to dark mode dashboard with date range filter tabs. Remove the "Độ tin cậy TB" KPI as it's not useful. Add 2 KPI cards (Total Scans, Total Cost) and a bar chart for top products.

## SPECIFICATIONS

### Page Layout
```
┌─────────────────────────────────────┐
│ StatusBar (dark)                    │
├─────────────────────────────────────┤
│ Thống kê                           │  ← Header title
├─────────────────────────────────────┤
│ [7 ngày] [30 ngày] [90 ngày] [Tất] │  ← Date range tabs
├─────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐ │
│ │ 📊 Total Scans│ │ │ 💰 Total Cost│ │
│ │     1,240    │ │ │    $1.25    │ │  ← KPICards
│ └───────────────┘ └───────────────┘ │
│                                     │
│ TOP 5 SẢN PHẨM                      │
│ ┌─────────────────────────────┐     │
│ │ Áo phông M         ████ 30 │     │
│ │ Quần jeans L       ███  25 │     │  ← Bar chart
│ │ Váy hoa nhí        ██   18 │     │
│ └─────────────────────────────┘     │
├─────────────────────────────────────┤
│ BottomNav                           │
└─────────────────────────────────────┘
```

### Theme
- **Background**: `bg-slate-900` (#0F172A) — dark mode
- **Cards**: `bg-card` (#FFFFFF) — white on dark
- **Text on dark**: White/gray text colors

### Date Range Tabs
- **Style**: Segmented control / pill tabs
- **Options**: "7 ngày", "30 ngày", "90 ngày", "Tất cả"
- **Active state**: `bg-primary text-white`
- **Inactive state**: `bg-slate-800 text-muted`
- **Border radius**: 8px
- **Height**: 40px
- **Margin**: 16px horizontal

### KPI Cards Row
- **Layout**: 2 columns, equal width
- **Gap**: 12px between cards
- **Margin**: 16px horizontal

### Bar Chart (Top 5 Products)
- **Section header**: "TOP 5 SẢN PHẨM" (uppercase, muted)
- **Chart type**: Horizontal bar chart
- **Bars**: Primary blue (`bg-primary`), rounded ends
- **Max bar width**: Fits container
- **Labels**: Product name left, count right
- **Animation**: Optional subtle animation on mount

### REMOVED ELEMENTS
- ❌ "Độ tin cậy TB" KPI (not useful metric)
- ❌ Any confidence badges

## ACCEPTANCE CRITERIA
- Given AnalyticsPage When rendered Then dark mode background
- Given AnalyticsPage When rendered Then date range tabs with selection
- Given AnalyticsPage When tab changed Then data updates accordingly
- Given AnalyticsPage When rendered Then shows 2 KPI cards (Total Scans, Total Cost)
- Given AnalyticsPage When rendered Then bar chart for top 5 products
- Given AnalyticsPage When rendered Then NO "Độ tin cậy TB" metric
- Given AnalyticsPage When rendered Then bottom navigation visible

## CONSTRAINTS
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles
- **DO NOT**: Change analytics data logic
- **REUSE**: KPICard from TIP-033

## FILES TO MODIFY
- `src/pages/AnalyticsPage.tsx` — Dark mode redesign with date tabs

---

*TIP-034 | Screens | P0 | 2h | Depends on TIP-033*