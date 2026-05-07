# Design Brief: OCR Gemini Mobile Web Redesign

> Vibecode Kit v5.0 — BƯỚC 4 (DESIGN)
> Project: OCR Gemini Mobile Web
> Path: D:/scripts/ocr_gemini/.coding_space/coding-packs/design/design-brief.md

---

## 1. Context & Objectives
- **Product**: OCR Gemini Mobile Web (Warehouse Edition)
- **Problem**: Current UI is functional but lacks professional polish and mobile-first optimization (headers, action placement, touch targets).
- **Goal**: Redesign for a "One-Tap" warehouse workflow. High contrast, low cognitive load, and optimized for batch operations.

## 2. UI/UX Strategy (Based on Research)
- **High-Contrast Slate**: Use `Slate 50` background with `Slate 900` text to reduce glare and improve readability.
- **Thumb-Zone Optimization**: All primary actions (Capture, Save, Export) must be in the bottom 30% of the screen.
- **Confidence Visualization**: Replaced explicit "High/Medium/Low" badges with subtle background highlights (`bg-amber-50` for fields requiring review).
- **Batch Export Flow**: Persistent bottom bar in History page that appears only when items are selected.

## 3. Screen Mockups (ASCII)

### Screen A: Camera View (Scanner)
```text
+-----------------------------------+
| [X] Close           [Flash] [Gal] |
|                                   |
|          [ Viewfinder ]           |
|      (Auto-detect document)       |
|                                   |
|                                   |
|      [Gallery]  (( O ))  [Switch] |
+-----------------------------------+
```

### Screen B: History List (Batch Select)
```text
+-----------------------------------+
| [🔍 Search SKU...]         [Select] |
|-----------------------------------|
| [ ] SKU: ABC-123       [Date] [>] |
| [ ] SKU: XYZ-789       [Date] [>] |
| [X] SKU: DEF-456       [Date] [>] |
|-----------------------------------|
|      [ 1 item selected ] [Export] | (Floating Bottom Bar)
| [Camera]    [History]    [Stats]  | (Nav)
+-----------------------------------+
```

### Screen C: Result Detail (AI Verified)
```text
+-----------------------------------+
| [<] Back                 [Edit]   |
|-----------------------------------|
|      [ Photo Thumbnail ]          |
|-----------------------------------|
|  Order ID: #ORD-2026              |
|  SKU: SKU-12345 (Verified)        |
|  Qty: [ 50 ]                      |
|-----------------------------------|
| [Copy]    [Share]    [Excel]      |
+-----------------------------------+
```

## 4. Design Tokens (VISION v5.2)
- **Colors**:
  - Primary: `#2563EB` (Blue 600)
  - Surface: `#F8FAFC` (Slate 50)
  - Card: `#FFFFFF`
  - Border: `#E2E8F0`
- **Typography**: Inter / System Sans-serif. 
  - Title: 20px Bold. 
  - Body: 16px Regular.
- **Radius**: `rounded-xl` (12px) for cards, `rounded-full` for action buttons.
- **Touch Targets**: Minimum 48px height for all interactive elements.

## 5. Required Icons (Lucide)
- `Camera`, `History`, `BarChart3`, `FileSpreadsheet`, `CheckCircle2`, `AlertCircle`, `Search`, `Edit3`, `ChevronRight`.
