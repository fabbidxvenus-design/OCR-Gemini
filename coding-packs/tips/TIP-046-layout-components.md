# TIP-046: Layout Components - Header, BottomNav, Layout

## HEADER
- TIP-ID: TIP-046
- Project: OCR Gemini Mobile Web
- Module: Layout
- Priority: P1
- Depends on: TIP-044
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React, React Router
- Key files to read first:
  - `src/components/layout/Layout.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/BottomNav.tsx`

## TASK
Cập nhật Layout, Header, BottomNav components theo Industrial Utility design tokens.

## SPECIFICATIONS

### 1. Layout.tsx

**Structure**:
```tsx
<div className="min-h-screen bg-surface flex flex-col">
  <Header title={title} showBack={showBack} />
  <main className="flex-1 pb-bottom-nav overflow-y-auto">
    {children}
  </main>
  {showBottomNav && <BottomNav />}
</div>
```

**Props**:
- `children`: ReactNode
- `title`: string (optional, default "OCR App")
- `showBack`: boolean (optional, default false) - hiện back button trong Header
- `showBottomNav`: boolean (optional, default true)

**Tokens used**:
- bg-surface (#F9FAFB)
- pb-bottom-nav (64px) cho content area
- h-header (56px) cho header

### 2. Header.tsx

**Layout**:
```
┌─────────────────────────────────┐
│ [←]  OCR App              [🚪] │
└─────────────────────────────────┘
   56px height, bg-card, border-b
```

**Elements**:
- Back button (optional): ChevronLeft icon, 44x44px touch target, ml-2
- Title: text-heading (20px/600), text-primary (#111827)
- Logout button: LogOut icon, 44x44px touch target

**Props**:
- `title`: string (default "OCR App")
- `showBack`: boolean (show ChevronLeft + onClick navigate(-1))

**Logout Flow**:
```tsx
const handleLogout = () => {
  logout();           // from authStore
  navigate('/login'); // redirect to login
};
```

### 3. BottomNav.tsx

**Layout** (fixed bottom):
```
┌─────────────────────────────────┐
│  📷      📋      📊      ⚙️   │
│ Chụp    Lịch    Thống   Cài    │
│ ảnh     sử      kê     đặt     │
└─────────────────────────────────┘
     64px height, bg-card, border-t
```

**Navigation Items**:
| Icon | Label | Route |
|------|-------|-------|
| Camera | Chụp ảnh | /camera |
| History (Clock) | Lịch sử | /history |
| BarChart3 | Thống kê | /analytics |
| Settings | Cài đặt | /settings |

**Active State**:
- Icon + text color: text-primary (#2563EB)
- Inactive: text-text-secondary (#6B7280)

**Implementation**:
- Use `NavLink` với `isActive` check
- Each item: flex-1, flex-col, centered
- Icon: w-6 h-6 (24px)
- Label: text-label (12px)

### 4. Safe Area Support

Thêm safe-area CSS cho iOS:
```css
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

Thêm vào Header: `safe-area-top`
Thêm vào BottomNav: `safe-area-bottom`

## ACCEPTANCE CRITERIA
- **Given** Layout **When** showBack=true **Then** Header hiện back button
- **Given** BottomNav **When** active route=/camera **Then** Camera icon + label highlight blue
- **Given** Header **When** click logout **Then** clear session, redirect to /login
- **Given** mobile iOS **When** render Layout **Then** safe-area padding applied

## CONSTRAINTS
- DO NOT: Hardcode heights, dùng `h-header`, `h-bottom-nav` tokens
- DO NOT: Change route paths, chỉ update styling
- REUSE: authStore logout function