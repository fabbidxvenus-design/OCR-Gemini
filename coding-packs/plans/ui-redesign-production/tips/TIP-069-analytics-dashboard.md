# TIP-069: Analytics Dashboard

## Objective
Redesign Analytics as a mobile-first operational dashboard.

## Source Screen
- Stitch Analytics screen generated in project `17363451422652957148`
- Screen id: `9698637998e24c91a04e0177e157fb2e`

## Files
- `src/pages/AnalyticsPage.tsx`

## Requirements

### Header
- Title: "Phân tích"
- Date filter: "7 ngày qua" (or existing filter)

### KPI Cards
2×2 grid or vertical stack:
- "128 Lượt quét" (+12% indicator if trend available)
- "96.8% Thành công" (stable indicator)
- "1.4s Thời gian TB" (-0.2s indicator if trend available)
- "42.1k Token" (80% limit indicator if applicable)

### Chart Card
- Title: "Lượt quét theo ngày"
- Compact bar/line chart showing 7-day trend
- Mobile-optimized, not desktop-density chart

### Model/API Usage
- Card title: "Cấu hình mô hình AI"
- Model usage bars:
  - Gemini Pro: 68% with violet progress bar
  - Gemini Flash: 32% with teal progress bar
- API key references if available
- Footer action: "Quản lý API Keys"

### Alert Card
- Amber card: "2 hồ sơ cần kiểm tra" with chevron to navigate

## Acceptance Criteria
- Analytics uses mobile dashboard cards
- Charts are compact and production-styled
- Existing data fetching preserved
- Build passes
