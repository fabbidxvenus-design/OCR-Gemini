# Vision Document: OCR Gemini UI/UX Redesign

> Vibecode Kit v5.0 — BƯỚC 3 (VISION) — Redesign Focus
> Project: OCR Gemini Mobile Web
> Date: 2026-05-06
> Scope: Visual Redesign (UI/UX only, core architecture unchanged)

---

## PROJECT CONTEXT

**Base Project**: OCR Gemini Mobile Web POC (existing codebase)
**Redesign Scope**: Visual UI/UX layer only — no architectural changes
**Research**: `research/ui-redesign-research.md` + `design/ui-spec.md`

---

## PROJECT TYPE: Pattern F — Enterprise Module Redesign

> **Rule**: REUSE FROM SCAN: Auth/roles + Layout/nav + UI components + API patterns + DB connection
> **Rule**: BUILD NEW: UI Redesign only

---

## PROBLEM STATEMENT

### Current UI Issues (from Research + TIPs)

| Issue | Severity | Source |
|-------|----------|--------|
| Header `position: relative` causing unwanted scroll behavior | HIGH | TIP-025 |
| Export button was on single-result page (not batch-friendly) | HIGH | TIP-026 |
| Confidence badges (Cao/Trung bình/Thấp) were distracting | MEDIUM | TIP-023 |
| Analytics KPI showing "Độ tin cậy TB" (not useful) | MEDIUM | TIP-023 |
| UI looks like early prototype, lacks professional polish | MEDIUM | Research |

### Root Cause
- Prototype-first development → functional but not production-ready UI
- No design system → inconsistent spacing, colors, typography
- Mobile-first not fully realized → touch targets, scroll behavior issues

---

## REDESIGN VISION

### Theme: "Cockpit Warehouse Edition"

A **high-contrast, industrial-grade** interface optimized for warehouse workers using phones in variable lighting conditions (bright daylight, dim storage areas).

**Design Philosophy**:
1. **Industrial utility** — Clean, fast, no-nonsense interface
2. **One-tap workflow** — Minimize steps to complete any action
3. **Thumb-zone optimization** — Primary actions in bottom 30% of screen
4. **Visual confidence** — AI uncertain fields use subtle hints, not badges

### Target Screens

| Screen | Current State | Redesign Goal |
|--------|--------------|---------------|
| **Camera** | Basic viewfinder | Full-screen HUD-style viewfinder with floating controls |
| **History** | List with select | Multi-select with floating batch export bar |
| **Detail** | Card-based results | Light mode cards with fixed bottom actions |
| **Analytics** | Basic KPIs | Dark mode dashboard with date range filter |

### Visual Direction

**Primary Theme**: Dark mode "Cockpit" for Camera + History + Analytics
**Secondary Theme**: Light mode for Detail/Edit screens (better for reading data)

**Color Psychology**:
| Color | Hex | Usage | Psychology |
|-------|-----|-------|------------|
| Primary Blue | `#2563EB` | CTAs, selection | Trust, action, professional |
| Success Green | `#22C55E` | Verified fields | Confirmation, accuracy |
| Warning Amber | `#FFFBEB` | Low confidence bg | Attention without alarm |
| Surface Dark | `#0F172A` | Dark mode background | Focus, reduce glare |
| Surface Light | `#F8FAFC` | Light mode background | Clean, readable |

**Typography**:
- **Heading Font**: Funnel Sans (geometric, industrial feel)
- **Body Font**: Geist (modern, highly legible on mobile)
- **Rationale**: Pairing reinforces the "warehouse tool" aesthetic

### Design Tokens (from Pencil Design)

```
PRIMARY:     #2563EB  (Blue 600)
SUCCESS:     #22C55E  (Green 600)
ERROR:       #EF4444  (Red 500)
WARNING:     #FFFBEB  (Amber soft background)
SLATE-900:   #0F172A  (Dark backgrounds)
SLATE-800:   #1E293B  (Secondary dark elements)
SURFACE:     #F8FAFC  (Light mode background)
CARD:        #FFFFFF  (Card backgrounds)
BORDER:      #E2E8F0  (Card borders)
TEXT:        #111827  (Primary text)
MUTED:       #64748B  (Secondary text)
```

---

## UI COMPONENT SPECS

### Touch Targets
- Minimum: **44px** (Apple HIG)
- Recommended: **48px** (warehouse gloves)
- Primary buttons: **56px** (FAB-style capture button)

### Cards
- Background: `#FFFFFF`
- Border: 1px `#E2E8F0`
- Border Radius: **12px**
- Shadow: blur 18px, offset y -8px, color `#0F172A14`
- Padding: 16px

### Buttons
- Height: **48px minimum**
- Border Radius: 12px (primary), 8px (secondary)
- Primary: Blue fill, white text
- Secondary: Transparent fill, stroke border

### Bottom Action Bar
- Position: **fixed bottom**
- Background: White with shadow
- Backdrop blur: 18px
- Height: 104px (includes safe area padding)

### Status Bar
- Height: 62px (standard mobile status bar)
- Semi-transparent on dark backgrounds
- Time/date display left, indicators right

---

## SCREEN-BY-SCREEN REDESIGN

### Screen 1: Camera View (Viewfinder)

```
┌─────────────────────────────────────┐
│ Status Bar (dark, 62px)             │  ← Semi-transparent
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐     │
│ │ Top Rail (instrument panel) │     │  ← Dark, 64px
│ │ [Flash]          [Gallery] │     │
│ └─────────────────────────────┘     │
│                                     │
│     ┌───────────────────────┐       │
│     │   OCR Targeting HUD   │       │  ← Blue border, 12px radius
│     │                       │       │
│     │   "Place document     │       │
│     │    here" overlay      │       │
│     │                       │       │
│     └───────────────────────┘       │
│                                     │
│     ┌───────────────────────┐       │
│     │   Capture Readout    │       │  ← Dark card, 12px radius
│     │   [last scan info]   │       │
│     └───────────────────────┘       │
│                                     │
│     ┌───────────────────────┐       │
│     │  Capture Controls    │       │  ← Dark floating panel
│     │ [Gal]  (( O )) [Sw]   │       │  ← 64px shutter button
│     └───────────────────────┘       │
└─────────────────────────────────────┘
```

**Key Changes**:
- Full-screen dark background (reduce glare)
- HUD-style targeting frame (blue border)
- Instrument panel design language
- Large 64px shutter button (thumb-friendly)

### Screen 2: History (Batch Select)

```
┌─────────────────────────────────────┐
│ Status Bar (dark)                   │
├─────────────────────────────────────┤
│ [Search...]                [Select] │  ← Search + toggle
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐      │
│ │ ☐ │ [img] │ SKU-123       │› │      │  ← Normal card
│ │         │ 2 ngày trước    │      │
│ └─────────────────────────────┘      │
│ ┌─────────────────────────────┐      │
│ │ ☑ │ [img] │ SKU-456       │› │      │  ← Selected (blue border)
│ │         │ 1 ngày trước     │      │
│ └─────────────────────────────┘      │
├─────────────────────────────────────┤
│                                     │
│  (Floating bar when selected)       │
│  ┌─────────────────────────────┐     │
│  │ 1 scan(s) │ [Xuất Excel]  │     │  ← Blue bar, fixed bottom
│  └─────────────────────────────┘     │
├─────────────────────────────────────┤
│ [Camera]  [History●]  [Analytics]   │  ← Bottom nav
└─────────────────────────────────────┘
```

**Key Changes**:
- Multi-select mode with checkboxes
- Selection count in floating bar
- "Xuất Excel" (Export Excel) prominent CTA
- Dark mode background

### Screen 3: Detail (Light Mode)

```
┌─────────────────────────────────────┐
│ Status Bar (light)                  │
├─────────────────────────────────────┤
│ [<] Kết quả OCR           [Sửa]     │  ← Back + Edit
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐      │
│ │     [ Scan Image ]         │      │  ← 4:3 aspect ratio
│ │         (click to          │      │
│ │          expand)           │      │
│ └─────────────────────────────┘      │
│                                     │
│ ┌─────────────────────────────┐     │
│ │ 📄 Hóa đơn #12345          │     │  ← Title card
│ │     Hôm nay, 10:30          │     │
│ └─────────────────────────────┘      │
│                                     │
│ ┌─────────────────────────────┐      │
│ │ THÔNG TIN                  │     │  ← Section header
│ │ ─────────────────────────── │     │
│ │ Số hóa đơn          12345  │     │
│ │ Ngày              15/01/24 │     │
│ │ Tổng cộng    1,500,000 đ   │     │  ← Success green if verified
│ └─────────────────────────────┘     │
│                                     │
│ ┌─────────────────────────────┐      │
│ │ BẢNG SIZE                  │     │
│ │ ─────────────────────────── │     │
│ │ Size      │ Số lượng        │     │
│ │ S        │  10             │     │
│ │ M        │  25             │     │
│ └─────────────────────────────┘     │
├─────────────────────────────────────┤
│ [Sửa]      [Sao chép]    [Chia sẻ] │  ← Fixed bottom actions
└─────────────────────────────────────┘
```

**Key Changes**:
- Light mode for readability
- Fixed bottom action bar (Edit, Copy, Share)
- Card-based structure
- No confidence badges
- Section headers uppercase, smaller font

### Screen 4: Analytics (Dark Mode)

```
┌─────────────────────────────────────┐
│ Status Bar (dark)                   │
├─────────────────────────────────────┤
│ Thống kê                           │
│                                     │
│ [7 ngày] [30 ngày] [90 ngày] [Tất] │  ← Date range tabs
├─────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐ │
│ │ 📊 Total Scans│ │ │ 💰 Total Cost│ │
│ │     1,240    │ │ │    $1.25    │ │  ← KPI cards
│ └───────────────┘ └───────────────┘ │
│                                     │
│ TOP 5 SẢN PHẨM                      │
│ ┌─────────────────────────────┐     │
│ │ Áo phông M         ████ 30 │     │
│ │ Quần jeans L       ███  25 │     │
│ │ Váy hoa nhí        ██   18 │     │  ← Bar chart
│ └─────────────────────────────┘     │
├─────────────────────────────────────┤
│ [Camera]  [History]  [Analytics●]   │  ← Bottom nav
└─────────────────────────────────────┘
```

**Key Changes**:
- Dark mode dashboard
- Date range tabs
- 2 KPI cards only (Total Scans, Total Cost)
- Bar chart for top products
- **REMOVED**: "Độ tin cậy TB" KPI

---

## NAVIGATION PATTERN

### Bottom Navigation (Fixed)
```
┌─────────────────────────────────────┐
│           Main Content              │
│                                     │
├─────────────────────────────────────┤
│  📷      📋      📊      ⚙️        │  ← 4 tabs
│  Scan  Lịch sử  Thống kê  Settings  │
│                                     │
│  [ Safe area bottom padding: 20px ] │
└─────────────────────────────────────┘
```

**Active State**: Primary blue icon + text
**Inactive State**: Gray icon + text
**Height**: 56px content + 20px safe area = 76px total

---

## ANIMATION & INTERACTION

| Interaction | Animation |
|-------------|-----------|
| Page transitions | 150ms ease-out |
| Button press | scale(0.98) on active |
| Card tap | Subtle highlight bg |
| Checkbox toggle | Smooth check animation |
| Loading states | Skeleton cards or spinner |
| Toast notifications | 300ms ease-out fade in |

---

## ACCESSIBILITY

| Requirement | Target |
|-------------|--------|
| Color contrast | 4.5:1 minimum (AA) |
| Touch targets | 44px minimum, 48px recommended |
| Focus states | Visible 2px ring |
| Screen reader | Proper ARIA labels |
| Reduced motion | Respect `prefers-reduced-motion` |

---

## MVP SCOPE (UI Redesign Only)

### ✅ IN Scope
| Domain | Changes | Priority |
|--------|---------|----------|
| Camera View | Full-screen HUD, floating controls | P0 |
| History | Multi-select, batch export bar | P0 |
| Detail | Light mode cards, fixed actions | P0 |
| Analytics | Dark mode, date tabs, remove badge | P0 |
| Navigation | Bottom nav styling | P0 |
| Design System | Tokens, typography, spacing | P0 |

### ❌ OUT of Scope
| Domain | Reason |
|--------|--------|
| Auth flow | Already functional |
| OCR logic | Unchanged |
| Data layer | Unchanged |
| New features | Redesign only |

---

## KEY DECISIONS

| # | Decision | Rationale |
|---|----------|-----------|
| RD-001 | Dark mode "Cockpit" theme | Reduce glare, professional warehouse tool aesthetic |
| RD-002 | Light mode for Detail/Edit | Better readability for data-heavy screens |
| RD-003 | Remove confidence badges | Distracting, use subtle bg tints instead |
| RD-004 | Floating batch export bar | Natural workflow: select → export |
| RD-005 | Funnel Sans + Geist fonts | Industrial, modern, highly legible |
| RD-006 | 48px touch targets | Warehouse gloves, one-handed operation |
| RD-007 | Fixed bottom action bar | Thumb-zone optimization |

---

## DEPENDENCIES

### On Existing Architecture
- React 19 + Vite (unchanged)
- Tailwind CSS (extend with new tokens)
- Lucide React (existing icons)
- Dexie.js (unchanged storage)

### New Dependencies
- None required (pure CSS changes)

---

## ESTIMATES

| Screen | Complexity | Estimate |
|--------|------------|----------|
| Camera View | Medium | 4h |
| History | Medium | 4h |
| Detail | Low | 2h |
| Analytics | Low | 2h |
| Design Tokens | Low | 2h |
| **Total** | | **14h** |

---

## NEXT STEPS

1. **User approval** of this Vision document
2. `/vibecode:blueprint` — Generate component architecture for redesigned UI
3. `/vibecode:tip` — Generate implementation tasks (TIPs) for each screen

---

## Quality Gate: Self-Review

✅ **Completeness**: 7/7 sections complete  
✅ **Cross-reference**: Consistent with Research + UI Spec  
✅ **Project type**: Pattern F (Redesign only)  
✅ **Design tokens**: Listed with hex values  
✅ **Screen specs**: All 4 screens with ASCII mockups  
✅ **MVP scope**: Clear IN/OUT boundaries  
✅ **Key decisions**: 7 decisions with rationale  
✅ **Estimates**: Provided for each screen  

**Confidence**: 95% — Design direction is clear, research validates approach, no architectural changes needed.

---

*Vision completed: 2026-05-06 | Framework: Vibecode Kit v5.0 | Project: OCR Gemini UI/UX Redesign*
