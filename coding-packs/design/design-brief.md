# OCR Mobile Web — Design Brief

> Vibecode Kit v5.0 — BƯỚC 4 (DESIGN)
> Date: 2026-05-07
> Project: OCR Gemini Mobile Web POC

---

## EXECUTIVE SUMMARY

**What we're redesigning**: A mobile-first OCR scanning app for warehouse workers. Current implementation is functional but uses generic UI patterns. The redesign will create a distinctive, professional visual identity that feels purpose-built for rapid invoice scanning workflows.

**Design Goal**: Transform the app from "functional prototype" to "production-ready tool" with a cohesive visual system, improved information hierarchy, and mobile-optimized interactions.

**Scope**: 9 core screens + shared components
- Login (email/password)
- Register (email/password with confirmation)
- Forgot Password (email reset)
- Camera/Scan (not in current pages list, needs design)
- OCR Result (structured fields display)
- Edit (field editing)
- History (list + detail)
- Analytics (KPIs + charts)
- Settings (model tier selection)

---

## CURRENT STATE ANALYSIS

### Existing Screens (to be redesigned)
1. **LoginPage** — Currently PIN entry, will be replaced with email/password login
2. **RegisterPage** — NEW screen for user registration with email/password
3. **ForgotPasswordPage** — NEW screen for password reset flow
4. **OCRResultPage** — Collapsible sections for Main Fields, Other Fields, Sizes, Raw Text
5. **EditPage** — Form-based editing (assumed, not read yet)
6. **HistoryPage** — List/Grid/Compact views with search, filter chips, sort
7. **HistoryDetailPage** — Full scan detail with export actions
8. **AnalyticsPage** — KPI cards + date range filter
9. **SettingsPage** — Model tier selector (Free/Default/High)

### Current Tech Stack
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand (auth), Dexie.js (IndexedDB)
- **Routing**: React Router v6

### Current UX Patterns
- Bottom navigation (assumed from Layout component)
- Collapsible sections with ChevronDown/ChevronUp
- Toast notifications (success/error)
- Touch-friendly buttons (44px+ targets)
- Loading states with spinners
- Filter chips (horizontal scroll)
- View mode toggle (List/Grid/Compact)

### Pain Points to Address
1. **Visual hierarchy**: All sections feel equal weight
2. **Information density**: Too much whitespace on some screens, too cramped on others
3. **Color usage**: Generic blue/green/red semantic colors, no brand personality
4. **Typography**: Likely using system defaults, no intentional scale
5. **Spacing**: Inconsistent padding/margins across screens
6. **Touch targets**: Some buttons may be too small for warehouse gloves
7. **Loading states**: Generic spinners, no contextual feedback
8. **Empty states**: Minimal guidance when no data exists

---

## DESIGN DIRECTION

### Style Archetype: **Industrial Utility**

A design system that feels like a professional tool, not a consumer app. Think: warehouse scanner meets modern SaaS dashboard.

**Visual References**:
- Stripe Dashboard (clean data tables, subtle shadows)
- Linear (purposeful color, tight spacing, clear hierarchy)
- Vercel Dashboard (monospace accents, high contrast)
- FedEx/UPS tracking apps (functional, no-nonsense)

**NOT like**:
- Generic Material Design templates
- Colorful consumer apps (Instagram, TikTok)
- Overly minimal (too much whitespace)
- Skeuomorphic (no fake textures)

### Design Principles

1. **Scan-First**: Camera/capture is the hero action, always accessible
2. **Glanceable Data**: Key info visible without scrolling or tapping
3. **Forgiving Touch**: 48px minimum targets, generous spacing between actions
4. **Instant Feedback**: Every action has immediate visual response
5. **Warehouse-Ready**: High contrast for bright/dim lighting, readable at arm's length

---

## DESIGN TOKENS

### Color Palette

```css
/* Primary Brand */
--primary-50:  #EFF6FF;   /* Lightest blue tint */
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;   /* Main brand blue */
--primary-600: #2563EB;   /* Primary action buttons */
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;

/* Neutral Grays */
--gray-50:  #F9FAFB;      /* Lightest background */
--gray-100: #F3F4F6;      /* Card surface */
--gray-200: #E5E7EB;      /* Borders */
--gray-300: #D1D5DB;      /* Disabled state */
--gray-400: #9CA3AF;      /* Placeholder text */
--gray-500: #6B7280;      /* Secondary text */
--gray-600: #4B5563;      /* Body text */
--gray-700: #374151;      /* Headings */
--gray-800: #1F2937;      /* High emphasis */
--gray-900: #111827;      /* Maximum contrast */

/* Semantic Colors */
--success-500: #10B981;   /* Green — successful scan */
--success-600: #059669;   /* Darker green for hover */
--warning-500: #F59E0B;   /* Amber — low confidence OCR */
--warning-600: #D97706;
--error-500:   #EF4444;   /* Red — API errors */
--error-600:   #DC2626;

/* Functional Colors */
--background:     #FFFFFF;        /* Page background */
--surface:        var(--gray-50); /* Card background */
--surface-raised: #FFFFFF;        /* Elevated cards */
--border:         var(--gray-200);
--text-primary:   var(--gray-900);
--text-secondary: var(--gray-500);
--text-disabled:  var(--gray-400);

/* Special Use */
--camera-overlay: rgba(0, 0, 0, 0.85);  /* Dark overlay for camera UI */
--scan-highlight: rgba(59, 130, 246, 0.1); /* Subtle blue tint for scanned items */
```

### Typography

**Font Family**:
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', 'Consolas', 'Monaco', monospace;
```

**Type Scale** (mobile-optimized):
```css
--text-xs:   0.75rem;  /* 12px — labels, metadata */
--text-sm:   0.875rem; /* 14px — body text, buttons */
--text-base: 1rem;     /* 16px — default body */
--text-lg:   1.125rem; /* 18px — section headers */
--text-xl:   1.25rem;  /* 20px — page titles */
--text-2xl:  1.5rem;   /* 24px — hero text */
--text-3xl:  1.875rem; /* 30px — large numbers (KPIs) */

/* Line Heights */
--leading-tight:  1.25;  /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Long-form content */

/* Font Weights */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### Spacing Scale

```css
--space-1:  0.25rem;  /* 4px  — tight spacing */
--space-2:  0.5rem;   /* 8px  — compact */
--space-3:  0.75rem;  /* 12px — comfortable */
--space-4:  1rem;     /* 16px — default */
--space-5:  1.25rem;  /* 20px — spacious */
--space-6:  1.5rem;   /* 24px — section spacing */
--space-8:  2rem;     /* 32px — large gaps */
--space-10: 2.5rem;   /* 40px — screen padding */
--space-12: 3rem;     /* 48px — major sections */
--space-16: 4rem;     /* 64px — hero spacing */
```

### Border Radius

```css
--radius-sm:   0.25rem;  /* 4px  — tight corners */
--radius-md:   0.5rem;   /* 8px  — default */
--radius-lg:   0.75rem;  /* 12px — cards */
--radius-xl:   1rem;     /* 16px — prominent cards */
--radius-2xl:  1.5rem;   /* 24px — hero elements */
--radius-full: 9999px;   /* Circular buttons */
```

### Shadows

```css
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Touch Targets

```css
--touch-min:  44px;  /* Minimum (Apple HIG) */
--touch-comfortable: 48px;  /* Comfortable (Material) */
--touch-primary: 56px;  /* Primary actions (FAB-style) */
```

---

## SCREEN MOCKUPS (ASCII)

### 1. Login Screen

```
┌─────────────────────────────────────┐
│                                     │
│          [Camera Icon]              │
│                                     │
│           OCR App                   │
│      Quét hóa đơn bằng AI          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Lock Icon]                │   │
│  │  Đăng nhập                  │   │
│  │  Nhập email và mật khẩu     │   │
│  │                             │   │
│  │  EMAIL                      │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ your@email.com        │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  MẬT KHẨU                   │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ ••••••••••    [Eye]   │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  ┌───────────────────────┐  │   │
│  │  │   Đăng nhập           │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  Quên mật khẩu?             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Chưa có tài khoản? Đăng ký        │
│                                     │
│  [Shield Icon] Dữ liệu được mã hóa │
│                                     │
└─────────────────────────────────────┘
```

### 1b. Register Screen

```
┌─────────────────────────────────────┐
│                                     │
│          [Camera Icon]              │
│                                     │
│           OCR App                   │
│      Quét hóa đơn bằng AI          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [UserPlus Icon]            │   │
│  │  Đăng ký                    │   │
│  │  Tạo tài khoản mới          │   │
│  │                             │   │
│  │  EMAIL                      │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ your@email.com        │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  MẬT KHẨU                   │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ ••••••••••    [Eye]   │  │   │
│  │  └───────────────────────┘  │   │
│  │  ████░░░░░░ Mạnh            │   │
│  │                             │   │
│  │  XÁC NHẬN MẬT KHẨU          │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ ••••••••••    [Eye]   │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  ☑ Tôi đồng ý điều khoản    │   │
│  │                             │   │
│  │  ┌───────────────────────┐  │   │
│  │  │   Đăng ký             │  │   │
│  │  └───────────────────────┘  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Đã có tài khoản? Đăng nhập        │
│                                     │
└─────────────────────────────────────┘
```

### 1c. Forgot Password Screen

```
┌─────────────────────────────────────┐
│                                     │
│          [Camera Icon]              │
│                                     │
│           OCR App                   │
│      Quét hóa đơn bằng AI          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Key Icon]                 │   │
│  │  Quên mật khẩu              │   │
│  │  Nhập email để đặt lại      │   │
│  │                             │   │
│  │  EMAIL                      │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ your@email.com        │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  ┌───────────────────────┐  │   │
│  │  │ Gửi link đặt lại      │  │   │
│  │  └───────────────────────┘  │   │
│  │                             │   │
│  │  ← Quay lại đăng nhập       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 2. Camera/Scan Screen (NEW — needs design)

```
┌─────────────────────────────────────┐
│ [X]                          [⚙️]   │ ← Header
├─────────────────────────────────────┤
│                                     │
│                                     │
│        [Camera Viewfinder]          │
│                                     │
│     ┌─────────────────────┐        │
│     │  Aim at invoice     │        │ ← Overlay guide
│     │  label on box       │        │
│     └─────────────────────┘        │
│                                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         [Capture Button]            │ ← 56px FAB
│                                     │
└─────────────────────────────────────┘
```

### 3. OCR Result Screen

```
┌─────────────────────────────────────┐
│ ← Kết quả OCR              [Edit]   │
├─────────────────────────────────────┤
│  [Image Thumbnail]                  │
│                                     │
│  ▼ THÔNG TIN CHÍNH (5)             │
│  ┌─────────────────────────────┐   │
│  │ Product Name                │   │
│  │ Áo phông cotton trắng       │   │
│  ├─────────────────────────────┤   │
│  │ Contract No                 │   │
│  │ CT-2024-001                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ▶ THÔNG TIN KHÁC (3)              │
│                                     │
│  ▼ BẢNG SIZE (4)                   │
│  ┌─────────────────────────────┐   │
│  │ Size  │ Quantity            │   │
│  │ S     │ 100                 │   │
│  │ M     │ 150                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ▶ VĂN BẢN GỐC                     │
│                                     │
├─────────────────────────────────────┤
│ [Copy]  [Share]  [Edit]            │ ← Action bar
└─────────────────────────────────────┘
```

### 4. History List (Grid View)

```
┌─────────────────────────────────────┐
│ Lịch sử        [List][Grid][Detail] │
├─────────────────────────────────────┤
│ [Search: Tìm kiếm...]               │
│ [Hôm nay] [Tuần này] [Đã sửa]      │ ← Filter chips
│ [Mới nhất ▼]                        │ ← Sort dropdown
├─────────────────────────────────────┤
│  ┌────────┐  ┌────────┐            │
│  │ [IMG]  │  │ [IMG]  │            │
│  │ Áo...  │  │ Quần.. │            │
│  │ 2h ago │  │ 5h ago │            │
│  └────────┘  └────────┘            │
│                                     │
│  ┌────────┐  ┌────────┐            │
│  │ [IMG]  │  │ [IMG]  │            │
│  │ Váy... │  │ Giày.. │            │
│  │ 1d ago │  │ 2d ago │            │
│  └────────┘  └────────┘            │
│                                     │
├─────────────────────────────────────┤
│ [Camera] [History] [Analytics]      │ ← Bottom nav
└─────────────────────────────────────┘
```

### 5. Analytics Dashboard

```
┌─────────────────────────────────────┐
│ Thống kê                            │
├─────────────────────────────────────┤
│ [7 ngày] [30 ngày] [90 ngày] [Tất] │ ← Date range
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 📈 Tổng số scan             │   │
│  │    156                      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💰 Tổng chi phí             │   │
│  │    $2.34                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔑 API Key 1                │   │
│  │    78 scans • $1.12         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔑 API Key 2                │   │
│  │    78 scans • $1.22         │   │
│  └─────────────────────────────┘   │
│                                     │
│  TOP SẢN PHẨM                       │
│  1. Áo phông cotton (45)           │
│  2. Quần jean (32)                 │
│  3. Váy dài (28)                   │
│                                     │
├─────────────────────────────────────┤
│ [Camera] [History] [Analytics]      │
└─────────────────────────────────────┘
```

### 6. Settings Screen

```
┌─────────────────────────────────────┐
│ ← Cài đặt                           │
├─────────────────────────────────────┤
│                                     │
│  CHẤT LƯỢNG OCR                     │
│                                     │
│  ○ Free (Gemini 2.0 Flash Lite)    │
│     Nhanh nhất • Miễn phí          │
│                                     │
│  ● Default (Gemini 2.5 Flash Lite) │
│     Cân bằng • $0.015/scan         │
│                                     │
│  ○ High (Gemini 2.5 Flash)         │
│     Chính xác nhất • $0.03/scan    │
│                                     │
│  ────────────────────────────────   │
│                                     │
│  THÔNG TIN                          │
│  Phiên bản: 1.0.0                  │
│  Lần đăng nhập cuối: 2h ago        │
│                                     │
│  [ĐĂNG XUẤT]                        │
│                                     │
├─────────────────────────────────────┤
│ [Camera] [History] [Analytics]      │
└─────────────────────────────────────┘
```

---

## COMPONENT SPECIFICATIONS

### 1. Buttons

**Primary Button** (CTA actions: Capture, Save, Export)
```
Height: 48px (touch-comfortable)
Padding: 12px 24px
Border Radius: 12px (--radius-lg)
Background: --primary-600
Text: white, --font-semibold, --text-sm
Hover: --primary-700
Active: scale(0.98)
Disabled: --gray-300 bg, --gray-400 text
```

**Secondary Button** (Edit, Cancel)
```
Height: 48px
Padding: 12px 24px
Border Radius: 12px
Background: transparent
Border: 1px solid --border
Text: --text-primary, --font-medium, --text-sm
Hover: --surface bg
```

**Icon Button** (Close, Settings)
```
Size: 44px × 44px (touch-min)
Border Radius: --radius-full
Background: transparent
Hover: --surface bg
Icon: 20px × 20px
```

**FAB (Floating Action Button)** — Camera capture
```
Size: 64px × 64px
Border Radius: --radius-full
Background: --primary-600
Shadow: --shadow-lg
Icon: 28px × 28px, white
Position: fixed bottom-24 center
```

### 2. Cards

**Standard Card** (History items, KPI cards)
```
Background: --surface-raised
Border: 1px solid --border
Border Radius: --radius-xl (16px)
Padding: 16px
Shadow: --shadow-sm
Hover: --shadow-md (for interactive cards)
```

**Elevated Card** (OCR result sections)
```
Background: white
Border: 1px solid --border
Border Radius: --radius-lg (12px)
Padding: 16px
Shadow: --shadow-md
```

### 3. Input Fields

**Text Input**
```
Height: 48px
Padding: 12px 16px
Border: 1px solid --border
Border Radius: --radius-md (8px)
Background: white
Text: --text-base, --text-primary
Placeholder: --text-disabled
Focus: --primary-500 border, --primary-50 bg
Error: --error-500 border, --error-50 bg
```

**PIN Input** (special case)
```
Display: 6 circles (● ● ● ● ○ ○)
Circle size: 16px diameter
Spacing: 8px between circles
Filled: --primary-600
Empty: --gray-300
```

### 4. Filter Chips

```
Height: 36px
Padding: 8px 16px
Border Radius: --radius-full
Border: 1px solid --border
Background: white
Text: --text-sm, --text-secondary

Active state:
  Background: --primary-50
  Border: --primary-500
  Text: --primary-700
  Icon: checkmark (12px)
```

### 5. Bottom Navigation

```
Height: 64px
Background: white
Border Top: 1px solid --border
Shadow: --shadow-lg (reversed, top shadow)

Nav Item:
  Width: 33.33% (3 items)
  Padding: 8px
  Icon: 24px × 24px
  Label: --text-xs, --text-secondary
  Active: --primary-600 icon, --primary-700 text
```

### 6. Toast Notifications

```
Width: calc(100% - 32px)
Max Width: 400px
Padding: 16px
Border Radius: --radius-lg
Shadow: --shadow-xl
Position: fixed top-16 center

Success:
  Background: --success-50
  Border: 1px solid --success-500
  Icon: CheckCircle (--success-600)
  Text: --success-900

Error:
  Background: --error-50
  Border: 1px solid --error-500
  Icon: AlertCircle (--error-600)
  Text: --error-900

Duration: 3s (success), 5s (error)
Animation: slide-down + fade-in
```

### 7. Loading States

**Spinner** (inline loading)
```
Size: 20px × 20px (small), 32px × 32px (large)
Border: 2px solid --primary-200
Border Top: 2px solid --primary-600
Animation: spin 1s linear infinite
```

**Skeleton Card** (list loading)
```
Background: --gray-100
Border Radius: --radius-lg
Animation: pulse 2s ease-in-out infinite
Height: matches content (80px for list item)
```

**Full-Screen Loading** (OCR processing)
```
Overlay: rgba(0, 0, 0, 0.5)
Spinner: 48px × 48px, white
Text: "Đang xử lý..." (--text-lg, white)
Position: fixed center
```

---

## ICON LIBRARY (Lucide React)

### Navigation
- `Camera` — Camera/Scan tab
- `History` — History tab (or `Clock`)
- `BarChart3` — Analytics tab
- `Settings` — Settings button

### Actions
- `Edit` — Edit button
- `Copy` — Copy to clipboard
- `Share2` — Share action
- `Download` — Export Excel
- `Trash2` — Delete
- `X` — Close/Cancel
- `Check` — Confirm/Success
- `ChevronDown` / `ChevronUp` — Expand/Collapse
- `ChevronLeft` — Back navigation

### Status & Feedback
- `CheckCircle` — Success state
- `AlertCircle` — Error state
- `AlertTriangle` — Warning state
- `Info` — Info tooltip
- `Loader2` — Loading spinner

### Data & Content
- `FileText` — Document/Scan
- `Image` — Image preview
- `Calendar` — Date/Time
- `TrendingUp` — Analytics growth
- `DollarSign` — Cost/Billing
- `Key` — API Key
- `CreditCard` — Payment/Billing

### UI Elements
- `Search` — Search input
- `Filter` — Filter button
- `ArrowUpDown` — Sort button
- `LayoutGrid` — Grid view
- `List` — List view
- `AlignJustify` — Compact view
- `Lock` — Security/PIN
- `Shield` — Security badge

---

## INTERACTION PATTERNS

### 1. Collapsible Sections
- **Trigger**: Tap entire header row (48px height)
- **Icon**: ChevronDown (collapsed) / ChevronUp (expanded)
- **Animation**: 200ms ease-out, max-height transition
- **Default State**: Main sections expanded, others collapsed

### 2. Filter Chips
- **Layout**: Horizontal scroll, no wrap
- **Spacing**: 8px gap between chips
- **Interaction**: Single tap to toggle
- **Visual Feedback**: Active state (blue bg + checkmark)
- **Accessibility**: Clear all button at end of list

### 3. View Mode Toggle
- **Layout**: Segmented control (3 buttons)
- **Size**: 36px height, 40px width per button
- **Active State**: --primary-600 bg, white icon
- **Inactive State**: transparent bg, --gray-600 icon
- **Animation**: 150ms ease-out background transition

### 4. Pull to Refresh (History list)
- **Trigger**: Pull down from top of list
- **Indicator**: Spinner (24px) + "Đang tải..." text
- **Threshold**: 80px pull distance
- **Animation**: Elastic bounce on release

### 5. Swipe Actions (History list items)
- **Left Swipe**: Reveal Delete button (red, 80px width)
- **Right Swipe**: Reveal Export button (blue, 80px width)
- **Threshold**: 40px swipe distance
- **Animation**: 200ms ease-out

### 6. Long Press (History list items)
- **Trigger**: 500ms press duration
- **Action**: Enter multi-select mode
- **Visual**: Checkboxes appear, bottom action bar slides up
- **Exit**: Tap X button or select 0 items

---

## RESPONSIVE BREAKPOINTS

### Mobile (Primary Target)
- **Base**: 375px (iPhone SE)
- **Small**: 390px (iPhone 12/13/14)
- **Medium**: 428px (iPhone 14 Pro Max)

### Layout Adjustments
- **375px**: Single column, 16px side padding
- **390px**: Same as 375px, slightly more breathing room
- **428px**: Same layout, consider 2-column grid for History grid view

### Typography Scaling
- No scaling needed for mobile range (375-428px)
- All text sizes remain constant
- Line heights optimized for mobile reading

---

## ACCESSIBILITY REQUIREMENTS

### Touch Targets
- **Minimum**: 44px × 44px (Apple HIG)
- **Comfortable**: 48px × 48px (Material Design)
- **Primary Actions**: 56px+ (Camera capture, Save)

### Color Contrast
- **Text on Background**: 4.5:1 minimum (WCAG AA)
- **Large Text (18px+)**: 3:1 minimum
- **Interactive Elements**: 3:1 minimum

### Focus States
- **Keyboard Focus**: 2px solid --primary-500 outline, 2px offset
- **Touch Focus**: Ripple effect (200ms, --primary-100 bg)

### Screen Reader Support
- **Buttons**: aria-label for icon-only buttons
- **Sections**: aria-expanded for collapsible sections
- **Forms**: aria-invalid + aria-describedby for errors
- **Loading**: aria-live="polite" for status updates

---

## ANIMATION GUIDELINES

### Timing
- **Fast**: 150ms (hover, focus)
- **Normal**: 200ms (expand/collapse, transitions)
- **Slow**: 300ms (page transitions, modals)

### Easing
- **Ease Out**: Default for most transitions
- **Ease In Out**: For reversible actions (expand/collapse)
- **Spring**: For playful interactions (pull to refresh)

### Performance
- **GPU-Accelerated**: transform, opacity only
- **Avoid**: width, height, top, left, margin, padding
- **Reduce Motion**: Respect prefers-reduced-motion media query

---

## EMPTY STATES

### No Scans Yet (History)
```
Icon: Camera (48px, --gray-400)
Heading: "Chưa có lịch sử"
Body: "Bạn chưa quét scan nào. Hãy chụp ảnh để bắt đầu!"
CTA: "Chụp ảnh" button (primary)
```

### No Search Results (History)
```
Icon: Search (48px, --gray-400)
Heading: "Không tìm thấy kết quả"
Body: "Không có scan nào khớp với '{query}'"
CTA: "Xóa bộ lọc" link (text-only)
```

### No Analytics Data
```
Icon: BarChart3 (48px, --gray-400)
Heading: "Chưa có dữ liệu"
Body: "Quét ít nhất 1 scan để xem thống kê"
CTA: "Chụp ảnh" button (primary)
```

---

## QUALITY CHECKLIST

### Visual Design
- [ ] 4+ screens designed (Login, Camera, OCR Result, History, Analytics, Settings)
- [ ] Consistent color palette (primary, semantic, neutrals)
- [ ] Typography scale defined (6+ sizes)
- [ ] Spacing scale defined (8+ values)
- [ ] Touch targets ≥ 44px for all interactive elements
- [ ] High contrast (4.5:1 text, 3:1 interactive)

### Component Library
- [ ] Buttons (primary, secondary, icon, FAB)
- [ ] Cards (standard, elevated)
- [ ] Input fields (text, PIN)
- [ ] Filter chips
- [ ] Bottom navigation
- [ ] Toast notifications
- [ ] Loading states (spinner, skeleton, full-screen)

### Interaction Design
- [ ] Collapsible sections
- [ ] Filter chips (horizontal scroll)
- [ ] View mode toggle
- [ ] Pull to refresh
- [ ] Swipe actions
- [ ] Long press (multi-select)

### Accessibility
- [ ] Touch targets ≥ 44px
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (interactive)
- [ ] Focus states defined
- [ ] Screen reader labels
- [ ] Reduced motion support

### Empty States
- [ ] No scans yet
- [ ] No search results
- [ ] No analytics data

---

## NEXT STEPS

1. **Review & Approve**: Stakeholder review of design brief
2. **Create Pencil Prompt**: Translate this brief into Pencil-specific instructions
3. **Design in Pencil**: Generate .pen file with all screens
4. **Export Assets**: Export design tokens, icons, and mockups
5. **Implement**: Translate designs to React + Tailwind components

---

*Design Brief v1.0 | Created: 2026-05-07 | Framework: Vibecode Kit v5.0*
