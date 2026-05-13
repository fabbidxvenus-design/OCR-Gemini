# TIP-063: Shared Layout Components

## Objective
Redesign shared layout components: Header, BottomNav, Sidebar, Layout wrapper.

## Source
- Stitch screens show consistent app shell with production styling
- Bottom nav: 4 tabs (Scan, History, Analytics, Settings)
- Header: title, status indicators, account affordance

## Files
- `src/components/layout/Header.tsx`
- `src/components/layout/Layout.tsx`
- `src/components/layout/Sidebar.tsx`
- Create or update: `src/components/layout/BottomNav.tsx`

## Requirements

### Header
- Production app bar with title prop
- Optional: API online status indicator (green dot + "API Online")
- Optional: Model badge (e.g., "Gemini Pro")
- Account/logout affordance (existing behavior preserved)
- Use deep teal background or card surface depending on context

### BottomNav
- 4 tabs: Scan (camera icon), History (clock icon), Analytics (chart icon), Settings (gear icon)
- Active state: teal fill or pill background
- Inactive state: muted icon
- Vietnamese labels: "Quét", "Lịch sử", "Thống kê", "Cài đặt"
- Fixed bottom position, thumb-zone friendly (72–80px height including safe area)
- Use React Router `useLocation` to determine active tab

### Sidebar (tablet/desktop)
- Same 4 navigation items as BottomNav
- Production styling with teal active state
- Preserve existing responsive behavior

### Layout
- Integrate new Header and BottomNav
- Preserve `showBottomNav` prop behavior
- Maintain responsive tablet/desktop sidebar

## Acceptance Criteria
- Bottom nav visible on app screens with correct active state
- Header shows production branding
- Tablet sidebar remains functional
- Existing routes and navigation behavior preserved
- Build passes
