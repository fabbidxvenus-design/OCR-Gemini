# TIP-066: OCR Processing Screen

## Objective
Replace spinner-only processing UI with a staged operational checklist.

## Source Screen
- Stitch Processing screen generated in project `17363451422652957148`
- Screen id: `37a58f153b264c3dbf7eb015e925bc94`

## Files
- `src/App.tsx` (`CameraPage` processing state)

## Requirements

### Processing UI
- Header: "Đang xử lý" with back affordance
- Document thumbnail preview
- AI metadata: model badge "Gemini Pro", estimated time "~3s"
- Staged checklist with 4 stages:
  1. "Tải ảnh lên" (completed: green checkmark)
  2. "Nhận dạng OCR" (in progress: teal spinner)
  3. "Chuẩn hóa trường dữ liệu" (pending: gray icon)
  4. "Lưu kết quả" (pending: gray icon)
- Cancel button "Hủy"
- Bottom nav visible

### Implementation
- Map existing `progress` state to checklist stages
- Use icons/checkmarks for stage status
- Preserve existing cancel/error behavior

## Acceptance Criteria
- Processing no longer shows spinner-only UI
- Staged checklist is visually clear
- Existing processing flow behavior preserved
- Build passes
