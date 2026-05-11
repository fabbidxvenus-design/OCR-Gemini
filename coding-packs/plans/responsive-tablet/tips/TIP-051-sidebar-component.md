# TIP-051: Sidebar Navigation Component

## HEADER
- TIP-ID: TIP-051
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-050
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React
- Key files to read first:
    - `src/components/layout/BottomNav.tsx` (current nav, for icon/label reference)

## TASK
Tạo Sidebar component cho tablet/desktop với navigation items.

## SPECIFICATIONS

### Sidebar Structure
```
┌────────────────────────────────┐
│ [Camera Icon] OCR App          │
├────────────────────────────────┤
│                                │
│ 📷 Quét scan                   │
│    path: /camera               │
│                                │
│ 📋 Lịch sử                     │
│    path: /history              │
│                                │
│ 📊 Thống kê                    │
│    path: /analytics            │
│                                │
│ ⚙️ Cài đặt                     │
│    path: /settings             │
│                                │
├────────────────────────────────┤
│ [Logout button at bottom]      │
└────────────────────────────────┘
```

### Styling
- Width: 240px fixed
- Background: white
- Border-right: 1px solid card-border
- Full height: 100vh
- Fixed position (sticky on scroll)

### Nav Item Styling
- Height: 48px
- Padding: 12px 16px
- Icon: 24px, left-aligned
- Text: body size, text-primary
- Hover: bg-surface
- Active: bg-primary-light, text-primary, left border 3px primary

## ACCEPTANCE CRITERIA
- **Given** Sidebar component **When** rendered on tablet+ **Then** shows 240px fixed sidebar
- **Given** nav item **When** active route matches **Then** shows active styling (blue left border)
- **Given** sidebar **When** on mobile **Then** not rendered (handled by parent Layout)

## CONSTRAINTS
- DO NOT: Hardcode paths, use NavLink pattern for route matching
- REUSE: Lucide icons from BottomNav
- SKIP: No hamburger menu (handled by Header in TIP-052)