# SPEC.md — OCR Mobile Web Redesign v2

> zflow plan mode | Plan: redesign-v2 | Phase: SPEC
> Generated: 2026-05-07

---

## SCOPE

5 TIPs: TIP-044 through TIP-048
- TIP-044: Design Tokens & Common UI Components
- TIP-045: Auth Flow (Login/Register/Forgot)
- TIP-046: Layout Components (Header/BottomNav)
- TIP-047: OCR & History Screens
- TIP-048: Analytics & Settings

---

## G/W/T SPECS (Given/When/Then)

### TIP-044: Design Tokens & Common UI Components

**SPEC-044-01: Tailwind Config**
```
GIVEN Tailwind config
WHEN building styles
THEN all tokens accessible (text-label, bg-error-light, rounded-sm, h-btn, etc.)
```

**SPEC-044-02: PrimaryButton Component**
```
GIVEN PrimaryButton component
WHEN rendered with variant="primary" size="lg"
THEN button height is 56px, bg-primary, text-white, rounded-xl

GIVEN PrimaryButton variant="danger"
THEN border-error, text-error, hover:bg-error-light

GIVEN PrimaryButton with disabled=true
THEN opacity-50, cursor-not-allowed
```

**SPEC-044-03: InputField Component**
```
GIVEN InputField rendered
THEN label uppercase 12px, input h-11 rounded-sm, border on focus

GIVEN InputField with error prop and touched=true
THEN border-error, error message below with text-error

GIVEN InputField without error
THEN border-gray, no error message
```

**SPEC-044-04: PasswordInput Component**
```
GIVEN PasswordInput rendered
THEN eye toggle icon visible, 44x44px touch target

GIVEN PasswordInput with showStrength=true
THEN strength bar displayed below input

GIVEN PasswordInput with strengthLevel="weak"
THEN bar bg-error, text "Yếu"

GIVEN PasswordInput with strengthLevel="medium"
THEN bar bg-warning, text "Trung bình"

GIVEN PasswordInput with strengthLevel="strong"
THEN bar bg-success, text "Mạnh"
```

**SPEC-044-05: CollapsibleSection Component**
```
GIVEN CollapsibleSection rendered
WHEN initially collapsed
THEN only title visible, chevron pointing right

GIVEN CollapsibleSection expanded
THEN children visible, chevron pointing down, 200ms transition
```

**SPEC-044-06: FilterChip Component**
```
GIVEN FilterChip with isActive=false
THEN bg-surface, text-text-secondary, no border

GIVEN FilterChip with isActive=true
THEN border-primary, bg-primary-light, text-primary
```

---

### TIP-045: Auth Flow

**SPEC-045-01: LoginPage Validation**
```
GIVEN LoginPage rendered
WHEN user submits empty form
THEN error "Email là bắt buộc" and "Mật khẩu là bắt buộc"

GIVEN LoginPage with invalid email format
WHEN user types "notanemail" and blurs
THEN error "Email không hợp lệ"

GIVEN LoginPage with valid email and password < 8 chars
WHEN submit
THEN error "Mật khẩu phải có ít nhất 8 ký tự"
```

**SPEC-045-02: RegisterPage Password Strength**
```
GIVEN RegisterPage rendered
WHEN user types password "abc"
THEN strength bar weak (red), text "Yếu"

GIVEN user types "Password123"
THEN strength bar medium (amber), text "Trung bình"

GIVEN user types "SecureP@ssw0rd!"
THEN strength bar strong (green), text "Mạnh"
```

**SPEC-045-03: ForgotPassword Success State**
```
GIVEN ForgotPasswordPage submitted with valid email
THEN success state shown with check icon, message, and back button

GIVEN ForgotPasswordPage success state
WHEN click "Quay lại đăng nhập"
THEN navigate to /login
```

**SPEC-045-04: Routing**
```
GIVEN unauthenticated user accessing /
THEN redirect to /login

GIVEN authenticated user accessing /login
THEN redirect to /camera

GIVEN click logout
THEN clear session, redirect to /login
```

---

### TIP-046: Layout Components

**SPEC-046-01: Header Component**
```
GIVEN Header with showBack=false
THEN back button hidden

GIVEN Header with showBack=true
THEN back button visible (ChevronLeft icon), navigate(-1) on click

GIVEN Header with title="Test"
THEN title displayed as "Test"
```

**SPEC-046-02: BottomNav Active State**
```
GIVEN BottomNav at route /camera
THEN Camera icon and label text-primary (blue)

GIVEN BottomNav at route /history
THEN Clock icon and label text-primary

GIVEN BottomNav at route /analytics
THEN BarChart3 icon and label text-primary

GIVEN BottomNav at route /settings
THEN Settings icon and label text-primary
```

**SPEC-046-03: Safe Area iOS**
```
GIVEN iOS device
WHEN Layout rendered
THEN Header has padding-top: env(safe-area-inset-top)
AND BottomNav has padding-bottom: env(safe-area-inset-bottom)
```

---

### TIP-047: OCR & History Screens

**SPEC-047-01: CameraView Overlay**
```
GIVEN CameraView rendered
THEN dark overlay visible (bg-black/85)
AND cutout rectangle visible (280x200px transparent)
AND guide text "Hướng nhãn hóa đơn vào khung"
AND capture button 64px, circular, primary color

GIVEN CameraView
THEN X icon top-left, Settings icon top-right
```

**SPEC-047-02: OCRResultPage Collapsible Sections**
```
GIVEN OCRResultPage rendered
WHEN click on "THÔNG TIN CHÍNH" section
THEN section expands/collapses with 200ms animation

GIVEN OCRResultPage
THEN "THÔNG TIN KHÁC" section initially collapsed

GIVEN OCRResultPage
THEN bottom bar with [Copy] [Share] [Edit] sticky at bottom
```

**SPEC-047-03: HistoryPage Grid View**
```
GIVEN HistoryPage in grid view
THEN 2-column layout
AND each item card has aspect-square image + product name

GIVEN HistoryPage with selection active
THEN floating export button visible
```

**SPEC-047-04: HistoryDetailPage Metadata**
```
GIVEN HistoryDetailPage rendered
THEN Token usage section visible
AND Cost ($) section visible
```

---

### TIP-048: Analytics & Settings

**SPEC-048-01: AnalyticsPage KPI Cards**
```
GIVEN AnalyticsPage rendered
THEN KPI cards with 24px icons on left
AND label above large value
AND Tổng scan card: Blue (primary)
AND Tổng chi phí card: Green (success)
```

**SPEC-048-02: AnalyticsPage Date Filter**
```
GIVEN AnalyticsPage with FilterChip "7 ngày" active
WHEN user clicks "30 ngày"
THEN data updates immediately
AND "30 ngày" chip shows active state
```

**SPEC-048-03: SettingsPage Model Selector**
```
GIVEN SettingsPage rendered
THEN model options displayed as cards with rounded-xl border

GIVEN option selected
THEN border-primary visible AND check icon visible
```

**SPEC-048-04: SettingsPage Logout Button**
```
GIVEN SettingsPage rendered
WHEN looking at logout button
THEN button has variant="danger" (red text/border), full width
```

---

## TEST INVENTORY

| Test ID | Component | Type | Priority |
|---------|-----------|------|----------|
| TEST-044-01 | PrimaryButton | Visual | P0 |
| TEST-044-02 | InputField | Visual | P0 |
| TEST-044-03 | PasswordInput | Visual/Behavior | P0 |
| TEST-044-04 | CollapsibleSection | Behavior | P0 |
| TEST-044-05 | FilterChip | Visual | P0 |
| TEST-045-01 | LoginPage validation | Behavior | P0 |
| TEST-045-02 | RegisterPage strength | Behavior | P0 |
| TEST-045-03 | ForgotPassword success | Behavior | P0 |
| TEST-045-04 | Routing auth | Behavior | P0 |
| TEST-046-01 | Header back button | Visual | P1 |
| TEST-046-02 | BottomNav active state | Visual | P0 |
| TEST-046-03 | Safe area iOS | Visual | P2 |
| TEST-047-01 | CameraView overlay | Visual | P0 |
| TEST-047-02 | OCRResult collapsible | Behavior | P0 |
| TEST-047-03 | History grid view | Visual | P1 |
| TEST-047-04 | HistoryDetail metadata | Visual | P1 |
| TEST-048-01 | KPI cards icons | Visual | P0 |
| TEST-048-02 | Date filter update | Behavior | P1 |
| TEST-048-03 | Model selector cards | Visual | P1 |
| TEST-048-04 | Logout danger zone | Visual | P0 |

---

## RED GATE (Test Files to Create)

Location: `src/__tests__/`

```
src/__tests__/
├── components/
│   ├── PrimaryButton.test.tsx
│   ├── InputField.test.tsx
│   ├── PasswordInput.test.tsx
│   ├── CollapsibleSection.test.tsx
│   └── FilterChip.test.tsx
├── pages/
│   ├── LoginPage.test.tsx
│   ├── RegisterPage.test.tsx
│   ├── ForgotPasswordPage.test.tsx
│   ├── OCRResultPage.test.tsx
│   ├── HistoryPage.test.tsx
│   ├── HistoryDetailPage.test.tsx
│   ├── AnalyticsPage.test.tsx
│   └── SettingsPage.test.tsx
└── layout/
    ├── Header.test.tsx
    └── BottomNav.test.tsx
```

---

## QUALITY GATE CHECKLIST

- [ ] All G/W/T specs extracted from TIPs
- [ ] Test inventory matches spec count
- [ ] RED phase: Tests created, compile, FAIL before implementation
- [ ] Verifier: Separate agent (not self-verified)
- [ ] No TODO/TBD in delivered tests

---

*SPEC.md v1.0 | Phase: SPEC | Status: RED GATE PENDING*