# TIP-023: UI Redesign - Mobile-First Modern Interface

## HEADER
- TIP-ID: TIP-023
- Project: OCR Gemini Mobile Web
- Module: UI/UX Redesign
- Priority: P2
- Depends on: TIP-021
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + Tailwind CSS
- Key files to read first:
  - `src/pages/OCRResultPage.tsx` (main result display)
  - `src/components/ocr/ConfidenceBadge.tsx` (REMOVE this)
  - `src/pages/LoginPage.tsx` (login screen)
  - `src/components/layout/BottomNav.tsx` (navigation)
  - `tailwind.config.js` (design tokens)

## APPLICABLE STANDARDS
- none

## TASK
Thiết kế lại giao diện mobile-first, loại bỏ confidence badges ("Cao", "Trung bình", "Thấp") và làm cho UI đẹp hơn, phù hợp hơn với điện thoại.

## SPECIFICATIONS

### 1. Remove Confidence Badges
**Current (UGLY):**
```
┌─────────────────────────────┐
│ Tên sản phẩm                 │
│ Giá: 150,000                 │
│ [Cao] ← Badge xấy xí        │
└─────────────────────────────┘
```

**New (CLEAN):**
```
┌─────────────────────────────┐
│ Tên sản phẩm                 │
│ Giá: 150,000                 │
│                            │
└─────────────────────────────┘
```
- Xóa `src/components/ocr/ConfidenceBadge.tsx`
- Xóa tất cả references trong OCRResultPage.tsx, HistoryPage.tsx, etc.
- Không hiển thị confidence ở bất cứ đâu

### 2. Mobile-First Design Principles

#### Color Palette
```javascript
// tailwind.config.js - Modern palette
colors: {
  primary: '#2563EB',      // Blue (keep)
  success: '#10B981',      // Green (for success states)
  warning: '#F59E0B',      // Amber (for warnings)
  error: '#EF4444',        // Red (for errors)
  neutral: '#6B7280',      // Gray
  surface: '#F9FAFB',     // Light gray background
  // NEW: Darker variants for cards
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
  }
}
```

#### Typography
- Font: Inter (already set)
- Scale:
  - h1: 24px, bold
  - h2: 20px, semibold
  - body: 16px, regular
  - caption: 14px, regular, text-neutral
- Line height: 1.5

#### Spacing
- Use 4px base grid
- Card padding: 16px
- Section gap: 12px
- Border radius: 12px (rounded-xl)

### 3. Component Redesign

#### OCRResultPage.tsx
```
┌─────────────────────────────────────┐
│ ← Quay lại      Kết quả OCR         │ (Header)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📄 INVOICE #12345          │    │ ← Title card
│  │    Hôm nay, 10:30           │    │   (light shadow)
│  └─────────────────────────────┘    │
│                                     │
│  THÔNG TIN              [+ Sửa]    │ ← Section header
│  ┌─────────────────────────────┐    │
│  │ Số hóa đơn                  │    │
│  │ 12345                        │    │
│  ├─────────────────────────────┤    │
│  │ Ngày                         │    │
│  │ 15/01/2024                   │    │
│  ├─────────────────────────────┤    │
│  │ Tổng cộng                   │    │
│  │ 1,500,000 đ                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  BẢNG SIZE                [+ Sửa] │
│  ┌─────────────────────────────┐    │
│  │ Size      │ Số lượng       │    │
│  │──────────│────────────────│    │
│  │ S         │ 10            │    │
│  │ M         │ 25            │    │
│  │ L         │ 15            │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  [Sao chép]    [Chia sẻ]           │ ← Action buttons
│  ┌─────────────────────────────┐  │
│  │ 📷 Sửa        │ ⬇️ Xuất Excel │  │ ← Bottom actions
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Improvements:
- Cards với border nhẹ thay vì shadow nặng
- Section headers viết HOA, smaller font
- Table clean với divider lines
- Action buttons pill-shaped
- Better visual hierarchy

#### LoginPage.tsx
```
┌─────────────────────────────────────┐
│                                     │
│           📷                        │ ← Large icon
│                                     │
│     OCR Gemini                     │ ← Title centered
│     Mobile Web                     │
│                                     │
│  ┌─────────────────────────────┐ │
│  │ 📧 Email                      │ │ ← Clean input
│  │ email@example.com            │ │
│  └─────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐ │
│  │ 🔒 Mật khẩu                 │ │
│  │ ••••••••                    │ │
│  └─────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐ │
│  │       ĐĂNG NHẬP            │ │ ← Primary button
│  └─────────────────────────────┘ │
│                                     │
│     Quên mật khẩu?                 │ ← Text link
│                                     │
└─────────────────────────────────────┘
```

#### BottomNav.tsx
- Active tab với background highlight
- Icon + label cho all tabs
- Safe area padding ở bottom

### 4. Responsive Design
- Base: 375px (iPhone SE)
- Larger screens: scale up gracefully
- Touch targets: 44px minimum
- Font size: 14-16px body, 12px captions

## ACCEPTANCE CRITERIA
- Given **OCRResultPage** When **Render** Then **Không có confidence badges**
- Given **User nhìn kết quả** When **Xem fields** Then **Chỉ thấy field name + value**
- Given **All pages** When **Render** Then **Mobile-first design, touch-friendly**
- Given **Login page** When **Render** Then **Clean, modern login form**
- Given **Build** When **Run** Then **Pass without errors**

## CONSTRAINTS
- DO NOT: Hiển thị confidence badges ở bất cứ đâu
- DO NOT: Thay đổi functionality (chỉ redesign UI)
- DO NOT: Break existing navigation
- REUSE: Keep existing color tokens
- SKIP: Backend changes (only frontend)

## FILES TO MODIFY

1. **XÓA:**
   - `src/components/ocr/ConfidenceBadge.tsx`

2. **MODIFY:**
   - `src/pages/OCRResultPage.tsx` - Redesign result cards
   - `src/pages/LoginPage.tsx` - Modern login form
   - `src/pages/HistoryPage.tsx` - Clean list items
   - `src/pages/EditPage.tsx` - Better form layout
   - `src/components/layout/BottomNav.tsx` - Active state styling
   - `tailwind.config.js` - Add new design tokens

3. **KEEP:**
   - All logic (OCR processing, IndexedDB, etc.)
   - Navigation structure
   - Error handling

## IMPLEMENTATION STEPS

### Step 1: Remove ConfidenceBadge
```bash
# Delete the file
rm src/components/ocr/ConfidenceBadge.tsx

# Remove imports from OCRResultPage
# Remove usage: <ConfidenceBadge ... />

# Update HistoryPage, EditPage if used there
```

### Step 2: Update Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        card: '#FFFFFF',
        'card-border': '#E5E7EB',
      },
      borderRadius: {
        'xl': '12px',
      },
    },
  },
}
```

### Step 3: Redesign LoginPage
- Centered layout
- Clean input fields with icons
- Primary action button
- Modern typography

### Step 4: Redesign OCRResultPage
- Card-based layout
- Section headers (uppercase)
- Clean tables
- Pill-shaped action buttons

### Step 5: Update BottomNav
- Active state with background highlight
- Better touch feedback

## TESTING CHECKLIST
- [ ] Build pass
- [ ] No confidence badges anywhere
- [ ] Login page looks modern
- [ ] OCR results display clean
- [ ] History page clean
- [ ] Edit page functional
- [ ] Touch targets ≥44px
- [ ] Works on 375px viewport