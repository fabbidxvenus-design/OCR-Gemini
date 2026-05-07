# Pencil Prompt — OCR Mobile Web Redesign

> Vibecode Kit v5.0 — BƯỚC 4 (DESIGN)
> Date: 2026-05-07
> Project: OCR Gemini Mobile Web POC

---

## PROMPT FOR PENCIL

Copy this entire section into Pencil to generate the design:

---

**Project**: OCR Mobile Web — Warehouse Invoice Scanner

**Design Style**: Industrial Utility — Clean, functional, warehouse-worker-friendly. Think Stripe Dashboard meets Linear, with high contrast and purposeful color usage. NOT generic Material Design templates.

**Target Device**: Mobile-first (375px-428px width), optimized for one-handed use with gloves.

**Screens to Design** (9 total):

1. **Login Screen**
   - Camera icon at top (80x80, rounded-2xl)
   - "OCR App" heading
   - "Quét hóa đơn bằng AI" subheading
   - Card with Lock icon (48x48)
   - "Đăng nhập" title
   - "Nhập email và mật khẩu" subtitle
   - Email input field with label
   - Password input field with eye toggle icon
   - Primary button: "Đăng nhập" (full width, 48px height)
   - "Quên mật khẩu?" link (text-primary, underline on hover)
   - "Chưa có tài khoản? Đăng ký" link at bottom
   - Security badge: "[Shield Icon] Dữ liệu được mã hóa"

1b. **Register Screen**
   - Same header as Login (Camera icon + OCR App title)
   - Card with UserPlus icon (48x48)
   - "Đăng ký" title
   - "Tạo tài khoản mới" subtitle
   - Email input field
   - Password input field with eye toggle + strength indicator bar
     - Strength bar: ████░░░░░░ with color (red/amber/green) and text (Yếu/Trung bình/Mạnh)
   - Confirm password input field with eye toggle
   - Checkbox: "☑ Tôi đồng ý điều khoản"
   - Primary button: "Đăng ký" (full width, 48px height)
   - "Đã có tài khoản? Đăng nhập" link at bottom

1c. **Forgot Password Screen**
   - Same header as Login
   - Card with Key icon (48x48)
   - "Quên mật khẩu" title
   - "Nhập email để đặt lại" subtitle
   - Email input field
   - Primary button: "Gửi link đặt lại" (full width, 48px height)
   - "← Quay lại đăng nhập" link (with ChevronLeft icon)

2. **Camera/Scan Screen** (unchanged)
   - Full-screen camera viewfinder
   - Dark overlay (rgba(0,0,0,0.85)) with transparent center rectangle
   - Overlay guide text: "Aim at invoice label on box"
   - Large circular capture button (64px) at bottom center
   - Close button (X) top-left
   - Settings icon top-right

3. **OCR Result Screen**
   - Back button + "Kết quả OCR" title + Edit button in header
   - Image thumbnail (full width, 200px height)
   - Collapsible sections:
     - ▼ THÔNG TIN CHÍNH (5) — expanded by default
       - Product Name: "Áo phông cotton trắng"
       - Contract No: "CT-2024-001"
       - Lot No: "LOT-001"
       - Barcode: "8934567890123"
       - Made In: "Vietnam"
     - ▶ THÔNG TIN KHÁC (3) — collapsed
     - ▼ BẢNG SIZE (4) — expanded
       - Table: Size | Quantity
       - S | 100
       - M | 150
       - L | 120
       - XL | 80
     - ▶ VĂN BẢN GỐC — collapsed
   - Bottom action bar: [Copy] [Share] [Edit] buttons

4. **History List Screen (Grid View)**
   - Header: "Lịch sử" + View mode toggle (List/Grid/Compact icons)
   - Search bar: "Tìm kiếm..."
   - Horizontal scrolling filter chips: [Hôm nay] [Tuần này] [Đã sửa] [Chưa sửa]
   - Sort dropdown: "Mới nhất ▼"
   - 2-column grid of scan cards:
     - Image thumbnail (square, 160px)
     - Product name (truncated, 1 line)
     - Timestamp: "2h ago"
   - Bottom navigation: [Camera] [History] [Analytics]

5. **History Detail Screen**
   - Same layout as OCR Result Screen
   - Additional metadata section at bottom:
     - Thời gian: "07/05/2026 10:30"
     - Token sử dụng: "1,234"
     - Chi phí: "$0.0185"
   - Action buttons: [Xuất Excel] [Sửa] [Xóa scan]

6. **Analytics Dashboard**
   - Header: "Thống kê"
   - Date range chips: [7 ngày] [30 ngày] [90 ngày] [Tất cả]
   - KPI cards (4 total):
     - 📈 Tổng số scan: 156
     - 💰 Tổng chi phí: $2.34
     - 🔑 API Key 1: 78 scans • $1.12
     - 🔑 API Key 2: 78 scans • $1.22
   - Section: "TOP SẢN PHẨM"
     - Numbered list:
       1. Áo phông cotton (45)
       2. Quần jean (32)
       3. Váy dài (28)
   - Bottom navigation

7. **Settings Screen**
   - Header: "← Cài đặt" (back button)
   - Section: "CHẤT LƯỢNG OCR"
   - Radio buttons (3 options):
     - ○ Free (Gemini 2.0 Flash Lite)
       - Subtitle: "Nhanh nhất • Miễn phí"
     - ● Default (Gemini 2.5 Flash Lite) — selected
       - Subtitle: "Cân bằng • $0.015/scan"
     - ○ High (Gemini 2.5 Flash)
       - Subtitle: "Chính xác nhất • $0.03/scan"
   - Divider line
   - Section: "THÔNG TIN"
     - Phiên bản: 1.0.0
     - Lần đăng nhập cuối: 2h ago
   - Danger button: [ĐĂNG XUẤT] (red text)
   - Bottom navigation

---

**Design Tokens**:

**Colors**:
- Primary: #2563EB (blue)
- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Error: #EF4444 (red)
- Background: #FFFFFF (white)
- Surface: #F9FAFB (light gray)
- Border: #E5E7EB (gray-200)
- Text Primary: #111827 (gray-900)
- Text Secondary: #6B7280 (gray-500)

**Typography**:
- Font: Inter (sans-serif)
- Heading: 20px, semibold (600)
- Body: 16px, normal (400)
- Small: 14px, normal (400)
- Label: 12px, medium (500)

**Spacing**:
- Screen padding: 16px
- Card padding: 16px
- Section gap: 12px
- Element gap: 8px

**Border Radius**:
- Cards: 16px
- Buttons: 12px
- Inputs: 8px
- Chips: 9999px (full)

**Touch Targets**:
- Minimum: 44px height
- Comfortable: 48px height
- Primary actions: 56px height

**Shadows**:
- Card: 0 1px 2px rgba(0,0,0,0.05)
- Elevated: 0 4px 6px rgba(0,0,0,0.1)

---

**Component Patterns**:

1. **Primary Button**:
   - Height: 48px
   - Background: #2563EB
   - Text: white, 14px, semibold
   - Border radius: 12px
   - Full width on mobile

2. **Input Field**:
   - Height: 48px
   - Padding: 12px 16px
   - Border: 1px solid #E5E7EB
   - Border radius: 8px
   - Background: white
   - Text: 16px, #111827
   - Placeholder: #9CA3AF
   - Focus state: 2px blue ring (#2563EB), border transparent
   - Error state: border #EF4444, ring #EF4444/20
   - Label: 12px, uppercase, semibold, #6B7280, 8px margin bottom

3. **Password Input with Toggle**:
   - Same as Input Field
   - Eye/EyeOff icon (20px) positioned absolute right 12px
   - Icon color: #6B7280, hover: #111827
   - Touch target for icon: 44px × 44px

4. **Password Strength Indicator**:
   - Height: 4px
   - Width: 100%
   - Background: #E5E7EB
   - Progress bar with rounded ends
   - Colors:
     - Weak (< 40%): #EF4444 (red)
     - Medium (40-70%): #F59E0B (amber)
     - Strong (> 70%): #10B981 (green)
   - Text label: 12px, same color as bar, positioned right

5. **Checkbox**:
   - Size: 20px × 20px
   - Border: 2px solid #E5E7EB
   - Border radius: 4px
   - Checked: background #2563EB, white checkmark
   - Label: 14px, #111827, 8px margin left
   - Touch target: 44px × 44px

6. **Card**:
   - Background: white
   - Border: 1px solid #E5E7EB
   - Border radius: 16px
   - Padding: 16px
   - Shadow: 0 1px 2px rgba(0,0,0,0.05)

7. **Filter Chip**:
   - Height: 36px
   - Padding: 8px 16px
   - Border: 1px solid #E5E7EB
   - Border radius: 9999px
   - Active state: blue background (#EFF6FF), blue border (#2563EB)

8. **Bottom Navigation**:
   - Height: 64px
   - Background: white
   - Border top: 1px solid #E5E7EB
   - 3 items: Camera, History, Analytics
   - Icon size: 24px
   - Label: 12px, gray-500
   - Active: blue icon + text

9. **Collapsible Section Header**:
   - Height: 48px
   - Background: transparent
   - Text: 12px, uppercase, semibold, gray-500
   - Icon: ChevronDown/ChevronUp (16px)
   - Count badge: gray background, 12px text

10. **Error Message**:
   - Background: #FEF2F2 (error-50)
   - Border: 1px solid #FCA5A5 (error-200)
   - Border radius: 8px
   - Padding: 12px
   - Text: 14px, #991B1B (error-800)
   - Icon: AlertCircle (16px), #EF4444
   - Margin top: 8px below input

---

**Icons** (use Lucide style):
- Camera, History (Clock), BarChart3, Settings
- Edit, Copy, Share2, Download, Trash2
- CheckCircle, AlertCircle, AlertTriangle
- ChevronDown, ChevronUp, ChevronLeft
- Search, Filter, ArrowUpDown
- LayoutGrid, List, AlignJustify
- Lock, Shield, Key, UserPlus, Eye, EyeOff, Mail

---

**Layout Guidelines**:
- Mobile width: 375px (base), 390px (comfortable), 428px (max)
- Header height: 56px
- Bottom nav height: 64px
- Content area: viewport height - header - bottom nav
- Side padding: 16px
- Vertical spacing between sections: 12px

---

**Interaction States**:
- Hover: subtle background change (for desktop preview)
- Active: scale(0.98) for buttons
- Focus: 2px blue outline
- Disabled: gray-300 background, gray-400 text

---

**Empty States**:
- Icon: 48px, gray-400
- Heading: 18px, semibold, gray-900
- Body: 14px, normal, gray-500
- CTA button: primary style

---

**Special Notes**:
- All text in Vietnamese
- High contrast for warehouse lighting
- Touch-friendly (44px+ targets)
- No decorative gradients or shadows
- Functional, not playful
- Professional tool aesthetic

---

**Deliverables**:
1. All 9 screens designed at 375px width (Login, Register, Forgot Password, Camera, OCR Result, History List, History Detail, Analytics, Settings)
2. Component library (buttons, cards, chips, nav, input fields, password strength indicator)
3. Design tokens exported
4. Interaction states shown (default, hover, focus, error, disabled)
5. Empty states for History and Analytics
6. Form validation states (error messages, success states)

---

END OF PROMPT
