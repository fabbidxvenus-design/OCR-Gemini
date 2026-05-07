# UI Specification: OCR Gemini Warehouse Redesign

> Vibecode Kit v5.0 — BƯỚC 5 (PEN-TO-MD)
> Project: OCR Gemini Mobile Web
> Source: `design/redesign.pen`
> Generated: 2026-05-06

---

## Visual Identity

### Design Tokens (Variables)
| Token | Type | Value | Usage |
|-------|------|-------|-------|
| `primary` | Color | `#2563EB` | Primary actions, selected states |
| `success` | Color | `#22C55E` | Verified fields, success states |
| `error` | Color | `#EF4444` | Error states, destructive actions |
| `warning-soft` | Color | `#FFFBEB` | Low confidence indicators |
| `slate-900` | Color | `#0F172A` | Dark mode text, headers |
| `slate-800` | Color | `#1E293B` | Secondary dark elements |
| `surface` | Color | `#F8FAFC` | Light mode background |
| `card` | Color | `#FFFFFF` | Card backgrounds |
| `border` | Color | `#E2E8F0` | Card borders |
| `text` | Color | `#111827` | Primary text |
| `muted` | Color | `#64748B` | Secondary text, timestamps |
| `font-heading` | String | `Funnel Sans` | Headings |
| `font-main` | String | `Geist` | Body text |

### Color Palette (Hex Values)
| Name | Hex | Usage |
|------|-----|-------|
| Blue 600 | `#2563EB` | Primary CTA |
| Green 600 | `#22C55E` | Success/Verified |
| Red 500 | `#EF4444` | Errors |
| Amber | `#FFFBEB` | Warning backgrounds |
| Slate 50 | `#F8FAFC` | Surface/Background |
| Slate 800 | `#1E293B` | Dark UI elements |
| Slate 900 | `#0F172A` | Dark backgrounds |
| Gray 100 | `#E2E8F0` | Borders |
| Gray 500 | `#64748B` | Muted text |

---

## Screens

### 1. Camera (05 Camera Variation - Cockpit)
**Screenshot**: `design/images/spec/deG0B.png`
**Layout Summary**: Full-screen dark camera viewfinder with HUD-style overlay. Instrument panel design with targeting HUD, capture readout, and floating controls.

**Key Components**:
- **Status Bar** (62px, top): Time/date display on dark semi-transparent bar
- **Top Rail** (64px, y:72): Dark instrument panel with Flash toggle, Gallery access
- **Targeting HUD** (276px, y:214): OCR targeting frame with blue border, corner radius 12px
- **Capture Readout** (74px, y:508): Dark rounded panel showing scan info
- **Capture Controls** (172px, y:646): Bottom floating panel with camera controls
- **Shutter Button**: Large circular capture button (centered)
- **Gallery/Upload**: Thumbnail preview button (left)
- **Camera Switch**: Toggle camera button (right)

**Touch Targets**: All buttons ≥ 48px height

---

### 2. History (06 History Variation - Cockpit)
**Screenshot**: `design/images/spec/Am55v.png`
**Layout Summary**: Dark mode list view with search, multi-select capability, and bottom action bar for batch operations.

**Key Components**:
- **Status Bar** (62px, top): Dark bar with time/indicators
- **Search Bar**: Input field with search icon, rounded corners
- **Select Toggle**: Checkbox icon button to enter select mode
- **List Items**: 
  - Thumbnail (left)
  - Title/SKU (bold)
  - Timestamp (muted text)
  - Chevron right arrow
- **Selection Checkbox**: Blue fill when selected
- **Bottom Bar** (96px): Navigation tabs (Camera, History, Analytics)

**Batch Export Flow**:
1. Tap Select button → Enter select mode
2. Tap items to select (blue border indicates selection)
3. Floating action bar appears with "X items selected" + Export Excel button

---

### 3. Detail (07 Detail Variation - Cockpit)
**Screenshot**: `design/images/spec/qUu1B.png`
**Layout Summary**: Light mode card-based layout showing OCR results with expandable sections and fixed bottom action bar.

**Key Components**:
- **Status Bar** (62px, top): Light status bar
- **Header**: Back button (left), Edit button (right)
- **Content Area** (variable height): 
  - **Image Preview**: 4:3 aspect ratio thumbnail
  - **Title Card**: Document type + timestamp
  - **Fields Card**: Structured OCR fields with label/value pairs
  - **Sizes Card**: Table view for size/quantity breakdown
  - **Raw Text**: Expandable section for original OCR text
- **Fixed Actions** (104px): Blur shadow, 3-column button layout
  - Edit (outline button)
  - Copy (outline button)  
  - Share/Export (primary fill)

**Confidence Indicators**:
- Verified fields: Green checkmark icon
- Low confidence: Amber background tint (`#FFFBEB`)

---

### 4. Analytics (08 Analytics Variation - Cockpit)
**Screenshot**: `design/images/spec/jmwiG.png`
**Layout Summary**: Dark mode dashboard with KPI cards, charts, and bottom navigation.

**Key Components**:
- **Status Bar** (62px, top): Dark bar with indicators
- **Header**: "Thống kê" title
- **Date Range Tabs**: 7 ngày, 30 ngày, 90 ngày, Tất cả
- **KPI Cards**:
  - Card 1: Icon + Label + Value (Total Scans)
  - Card 2: Icon + Label + Value (Total Cost)
- **Charts Section**: Bar chart for top products (Top 5)
- **Bottom Bar** (96px): Tab navigation

**Layout Specs**:
- Cards: White background, rounded corners (12px), subtle shadow
- Chart bars: Primary blue (`#2563EB`)
- Bottom padding for safe area

---

## Implementation Notes

### Layout Structure
```
App Shell (100vh)
├── Status Bar (62px, fixed top)
├── Main Content (flex-1, scrollable)
│   ├── Header (48px)
│   └── Content Area (variable)
└── Bottom Bar (96px, fixed bottom)
    └── Nav Tabs (3: Camera, History, Analytics)
```

### Component Specs

#### Cards
- Background: `$card` (#FFFFFF)
- Border: 1px `$border` (#E2E8F0)
- Border Radius: 12px
- Shadow: blur 18px, offset y -8px, color `#0F172A14`
- Padding: 16px

#### Buttons
- Height: 48px minimum (touch target)
- Border Radius: 12px (primary), 8px (secondary)
- Padding: 12px 16px
- Primary: `$primary` fill, white text
- Secondary: transparent fill, `$text` stroke

#### Input Fields
- Height: 48px
- Border: 1px `$border`
- Border Radius: 8px
- Focus Ring: 2px `$primary`

#### Bottom Action Bar
- Position: fixed bottom
- Background: `$card` with shadow
- Blur: 18px backdrop
- Height: 104px (includes padding)

### Animations
- Page transitions: 150ms ease-out
- Button press: scale(0.98)
- Card expand: 200ms ease-out
- Loading: 1s linear infinite spin

### Accessibility
- Color contrast: 4.5:1 minimum
- Touch targets: 44px minimum (48px recommended)
- Focus states: visible 2px ring
- Reduced motion: respect `prefers-reduced-motion`

---

## File Mapping (Source → Implementation)

| Screen | Component File | Page File |
|--------|----------------|-----------|
| Camera | `CameraView.tsx` | `OCRPage.tsx` |
| History | `HistoryCard.tsx` | `HistoryPage.tsx` |
| Detail | `ResultCard.tsx` | `OCRResultPage.tsx` |
| Analytics | `KPICard.tsx` | `AnalyticsPage.tsx` |

---

*UI Spec generated from Pencil design file*
