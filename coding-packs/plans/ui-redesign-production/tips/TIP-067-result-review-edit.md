# TIP-067: OCR Result Review & Edit Screens

## Objective
Redesign OCR result and edit experiences around structured field verification cards.

## Source Screen
- Stitch Result Review screen generated in project `17363451422652957148`
- Screen id: `dc0bf719691d43e7b50a61a4e8c01316`

## Files
- `src/pages/OCRResultPage.tsx`
- `src/pages/EditPage.tsx`
- Optional shared components:
  - `src/components/ocr/FieldReviewCard.tsx`
  - `src/components/ocr/ResultSummaryCard.tsx`

## Requirements

### Result Summary
- Title: "Kết quả OCR"
- Status pill: e.g. "Cần kiểm tra 2 trường" when low-confidence/missing fields exist
- Summary card with document name/id, processing time, model badge, confidence/status

### Field Cards
Each field should show:
- Label
- Value
- Confidence/status marker
- Edit affordance
- Low-confidence fields highlighted amber

### Actions
- Sticky bottom actions where appropriate:
  - Primary: "Lưu & xuất"
  - Secondary: "Chỉnh sửa"
  - Tertiary: "Chụp lại"

### Edit Page
- Use same field-card visual language
- Inputs should retain production card styling
- Save/cancel actions clear

## Acceptance Criteria
- OCR result page no longer displays raw/POC-looking extracted data
- Fields are reviewable and scannable
- Edit page is visually consistent
- Existing edit/save/export behavior preserved
- Build passes
