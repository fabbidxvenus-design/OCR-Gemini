# TIP-068: History & Detail Screens

## Objective
Redesign History and History Detail screens as mobile-first operational record views.

## Source Screen
- Stitch History screen generated in project `17363451422652957148`
- Screen id: `06fa1786a57a4d139e0924fb7a19e597`

## Files
- `src/pages/HistoryPage.tsx`
- `src/pages/HistoryDetailPage.tsx`

## Requirements

### History
- Header: "Lịch sử quét" with API online indicator
- Search field: "Tìm hồ sơ, tên, số giấy tờ"
- Filter chips:
  - "Tất cả"
  - "Cần kiểm tra"
  - "Đã xuất"
  - "Lỗi"
- Scan record cards with:
  - title/name
  - timestamp
  - status chip
  - model chip
  - edited/exported chips
  - metadata row (confidence, processing time, token usage if available)
- Floating/primary action: "Quét mới"
- Empty state card for no scans

### History Detail
- Follow Result Review visual pattern
- Summary card + field cards + export/edit actions

## Acceptance Criteria
- History is card-based and mobile-friendly
- Search/filter controls are visually production-ready
- Empty/loading/error states remain clear
- Existing data fetching and navigation preserved
- Build passes
