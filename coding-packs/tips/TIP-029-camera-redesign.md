# TIP-029: Redesign Camera Page (HUD Style)

## HEADER
- **TIP-ID**: TIP-029
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Screens / Camera
- **Priority**: P0
- **Depends on**: TIP-028 (StatusBar component)
- **Estimated**: XL (4 hours)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/components/camera/CameraView.tsx`, `src/pages/OCRPage.tsx`
- **Reference**: `design/ui-spec.md` — Screen 1: Camera (05 Camera Variation - Cockpit)

## TASK
Redesign the Camera page to full-screen HUD-style viewfinder. Remove the awkward `position: relative` header. Add instrument panel design with targeting HUD, capture readout, and floating controls optimized for one-handed warehouse operation.

## SPECIFICATIONS

### Layout Structure
```
┌─────────────────────────────────────┐
│ StatusBar (62px, semi-transparent)  │  ← TIP-028
├─────────────────────────────────────┤
│ Top Rail (64px, dark instrument)    │  ← Flash toggle, Gallery
├─────────────────────────────────────┤
│                                     │
│   OCR Targeting HUD (blue border)   │  ← Centered targeting frame
│                                     │
├─────────────────────────────────────┤
│ Capture Readout (dark card)         │  ← Last scan info
├─────────────────────────────────────┤
│ Capture Controls (floating panel)   │  ← Gallery, Shutter, Switch
└─────────────────────────────────────┘
```

### Top Rail Component
- **Height**: 64px
- **Background**: `bg-slate-800`
- **Contents**:
  - Left: Flash toggle button (with active state indicator)
  - Right: Gallery access button (thumbnail preview)
- **Border radius**: 12px bottom corners
- **Margin**: 16px horizontal, 8px top

### Targeting HUD
- **Position**: Centered, 276px height
- **Border**: 2px `border-primary` (blue)
- **Border radius**: 12px
- **Background**: Semi-transparent dark overlay
- **Corner markers**: L-shaped corner accents (optional enhancement)
- **Placeholder text**: "Đặt tài liệu vào khung" (Vietnamese)

### Capture Readout Card
- **Background**: `bg-slate-800/80`
- **Border radius**: 12px
- **Padding**: 16px
- **Content**: Last scan timestamp, or "Chưa có kết quả" if empty

### Capture Controls Panel
- **Position**: Fixed bottom, 172px height
- **Background**: `bg-slate-900/90` with blur
- **Border radius**: 20px top corners
- **Layout**: 
  - Left (20%): Gallery thumbnail (or placeholder)
  - Center (60%): Large shutter button (64px diameter)
  - Right (20%): Camera switch button

### Shutter Button
- **Size**: 64px × 64px (primary action touch target)
- **Background**: White circle
- **Border**: 4px white ring
- **Active state**: Scale down to 0.95, slightly darker
- **Shadow**: `shadow-lg`

### Icons (Lucide)
- `Flash`, `FlashOff` — Flash toggle
- `Image`, `Camera` — Gallery
- `CameraSwitch` — Switch camera
- `Circle` — Shutter button (custom SVG)

## ACCEPTANCE CRITERIA
- Given Camera page When redesigned Then full-screen dark background (reduce glare)
- Given Camera page When redesigned Then HUD-style targeting frame with blue border
- Given Camera page When redesigned Then instrument panel design language for controls
- Given Camera page When redesigned Then large 64px shutter button (thumb-friendly)
- Given Camera page When redesigned Then no `position: relative` on header
- Given Camera page When redesigned Then StatusBar integrated from TIP-028
- Given Camera page When redesigned Then all touch targets ≥ 48px

## CONSTRAINTS
- **DO NOT**: Change camera capture logic or OCR flow
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles — Tailwind only
- **REUSE**: Keep existing camera logic, only change UI layer

## FILES TO MODIFY
- `src/components/camera/CameraView.tsx` — HUD-style redesign
- `src/pages/OCRPage.tsx` — Page wrapper with StatusBar integration

---

*TIP-029 | Screens | P0 | 4h | Depends on TIP-028*