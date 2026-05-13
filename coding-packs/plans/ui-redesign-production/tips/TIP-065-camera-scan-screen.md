# TIP-065: Camera Scan Screen

## Objective
Redesign camera scanning experience as a production field-tool capture interface.

## Source Screen
- Stitch Camera Scan screen generated in project `17363451422652957148`
- Screen id from generation: `0b323b263d334df68298cafbdf3b6c02`

## Files
- `src/App.tsx` (`CameraPage`)
- `src/components/camera/CameraView.tsx`
- `src/components/camera/ImagePreview.tsx`

## Requirements

### Camera Stage
- Dark full-screen camera preview stage (`ink`/slate background)
- Top overlay:
  - title "Quét tài liệu"
  - API Online status pill
  - model chip (e.g. "Gemini Pro")
- Document guide rectangle with teal corner brackets
- Helper copy: "Đặt tài liệu trong khung"
- Hints: "Ánh sáng tốt", "Giữ máy ổn định"

### Controls
- Bottom thumb-zone controls:
  - gallery/import circular button
  - large center capture button with teal ring
  - flash toggle circular button
- Ensure 48px touch targets
- Preserve existing capture behavior

### Image Preview
- Update preview to match production review/capture styling
- Retake and confirm actions should be clear and thumb-zone friendly

## Acceptance Criteria
- Camera screen no longer uses generic white container for main capture UI
- Capture controls are production-grade and accessible
- Existing camera/capture behavior preserved
- Build passes
