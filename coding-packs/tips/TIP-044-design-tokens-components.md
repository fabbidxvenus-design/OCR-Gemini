# TIP-044: Design Tokens & Common UI Components

## HEADER
- TIP-ID: TIP-044
- Project: OCR Gemini Mobile Web
- Module: UI/Foundation
- Priority: P1
- Depends on: none
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React
- Key files to read first:
  - `tailwind.config.js`
  - `src/components/ui/index.ts`

## TASK
Cập nhật Tailwind config với đầy đủ Design Tokens cho "Industrial Utility" style, sau đó tạo các common UI components.

## SPECIFICATIONS

### 1. Tailwind Config Update

**Colors** (thêm vào `colors`):
```js
primary: '#2563EB',
'primary-hover': '#1D4ED8',
'primary-light': '#EFF6FF',
success: '#10B981',
'success-light': '#ECFDF5',
warning: '#F59E0B',
'warning-light': '#FFFBEB',
error: '#EF4444',
'error-light': '#FEF2F2',
'error-border': '#FCA5A5',
'error-text': '#991B1B',
'text-placeholder': '#9CA3AF',
```

**Border Radius** (thêm vào `borderRadius`):
```js
'sm': '8px',     // Inputs
'xl': '12px',    // Buttons  
'2xl': '16px',   // Cards
'full': '9999px', // Chips
```

**Spacing** (thêm vào `spacing`):
```js
'screen': '16px',
'card': '16px',
'section': '12px',
'element': '8px',
```

**Heights** (thêm vào `height`):
```js
'touch': '44px',        // Min touch target
'btn': '48px',          // Standard button
'btn-primary': '56px',  // Primary action
'header': '56px',
'bottom-nav': '64px',
```

**Font Sizes** (thêm vào `fontSize`):
```js
'heading': ['20px', { fontWeight: '600' }],
'body': ['16px', { fontWeight: '400' }],
'small': ['14px', { fontWeight: '400' }],
'label': ['12px', { fontWeight: '500' }],
```

### 2. Common UI Components (tạo trong `src/components/ui/`)

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| PrimaryButton | PrimaryButton.tsx | variant ('primary'\|'secondary'\|'danger'), size ('md'\|'lg'), ...buttonProps | Button với 3 variants, min-height 48px |
| InputField | InputField.tsx | label, error, touched, ...inputProps | Input với label phía trên, error message bên dưới |
| PasswordInput | InputField.tsx (export) | thêm showStrength, strengthLevel | Input có icon eye toggle, optional strength indicator |
| Checkbox | Checkbox.tsx | label, checked, onChange | Checkbox 20x20px với touch target 44px |
| CollapsibleSection | CollapsibleSection.tsx | title, count, defaultExpanded, children | Section có thể expand/collapse, 200ms transition |
| FilterChip | FilterChip.tsx | label, isActive, onClick | Chip filter với active state (blue border + bg) |
| ErrorMessage | ErrorMessage.tsx (update) | title, message, onRetry | Error display với AlertCircle icon, bg-error-light |
| SkeletonCard | SkeletonCard.tsx (update) | showImage | Loading skeleton matching card layout |
| Toast | Toast.tsx (update) | message, type, onClose, duration | Toast notification ở top, auto-dismiss sau 3s |

### 3. Export Index
Cập nhật `src/components/ui/index.ts` export tất cả components.

## ACCEPTANCE CRITERIA
- **Given** Tailwind config **Then** tất cả tokens mới có thể dùng (ví dụ `text-label`, `bg-error-light`, `rounded-sm`)
- **Given** PrimaryButton **Then** có variant primary/secondary/danger, size md/lg, min-height 48px
- **Given** InputField **Then** có label uppercase 12px, error hiện red border + message bên dưới
- **Given** PasswordInput **Then** có eye toggle icon 44px, strength bar khi showStrength=true
- **Given** CollapsibleSection **Then** expand/collapse với animation 200ms, count badge phải hiển thị

## CONSTRAINTS
- DO NOT: Hardcode màu hex trong components, dùng token variables
- DO NOT: Inline styles, dùng utility classes
- REUSE: lucide-react cho icons
- DO NOT: Tạo logic xử lý data ở đây, chỉ UI components thuần