# TIP-045: Auth Flow - Login, Register, Forgot Password

## HEADER
- TIP-ID: TIP-045
- Project: OCR Gemini Mobile Web
- Module: Auth/UI
- Priority: P1
- Depends on: TIP-044
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React, React Router
- Components to use: `PrimaryButton`, `InputField`, `PasswordInput`, `Checkbox` (từ TIP-044)
- Key files to read first:
  - `src/pages/LoginPage.tsx` (hiện tại - thay thế)
  - `src/store/authStore.ts`

## TASK
Thay thế PIN-based authentication hiện tại bằng Email/Password flow với 3 màn hình: Login, Register, Forgot Password.

## SPECIFICATIONS

### 1. LoginPage.tsx

**Layout Structure** (mobile-first, 375px):
```
┌─────────────────────────────┐
│     [Camera Icon 80x80]      │
│          OCR App             │
│    Quét hóa đơn bằng AI      │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ [Lock 48x48]         │  │
│  │ Đăng nhập             │  │
│  │ Nhập email và mật khẩu│  │
│  │                       │  │
│  │ EMAIL                 │  │
│  │ [_______________]     │  │
│  │                       │  │
│  │ MẬT KHẨU              │  │
│  │ [_______________] 👁    │  │
│  │                       │  │
│  │        Quên mật khẩu? │  │
│  │                       │  │
│  │ [ĐĂNG NHẬP 48px]     │  │
│  └───────────────────────┘  │
│                             │
│    Chưa có tài khoản? Đăng ký│
│                             │
│   🔒 Dữ liệu được mã hóa     │
└─────────────────────────────┘
```

**Validation Rules**:
- Email: Required, valid regex format `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Password: Required, min 8 characters
- Error hiển thị dưới input với màu #EF4444

**Icons** (dùng lucide-react):
- Camera, Lock, Eye/EyeOff, Shield, Mail

### 2. RegisterPage.tsx

**Layout Structure**:
```
┌─────────────────────────────┐
│     [Camera Icon 80x80]      │
│          OCR App             │
│     Tạo tài khoản mới        │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ [UserPlus 48x48]      │  │
│  │ Đăng ký               │  │
│  │ Nhập thông tin của bạn │  │
│  │                       │  │
│  │ EMAIL                 │  │
│  │ [_______________]      │  │
│  │                       │  │
│  │ MẬT KHẨU              │  │
│  │ [_______________] 👁   │  │
│  │ ████████░░░░ Yếu      │  │
│  │                       │  │
│  │ XÁC NHẬN MẬT KHẨU     │  │
│  │ [_______________] 👁   │  │
│  │                       │  │
│  │ ☑ Tôi đồng ý điều khoản│  │
│  │                       │  │
│  │ [ĐĂNG KÝ 48px]        │  │
│  └───────────────────────┘  │
│                             │
│    Đã có tài khoản? Đăng nhập│
└─────────────────────────────┘
```

**Validation Rules**:
- Email: Required, valid format
- Password: Required, min 8 characters
- Confirm Password: Required, must match password
- Terms: Required checkbox

**Password Strength Indicator**:
- Weak (<40%): Red #EF4444, text "Yếu"
- Medium (40-70%): Amber #F59E0B, text "Trung bình"
- Strong (>70%): Green #10B981, text "Mạnh"

### 3. ForgotPasswordPage.tsx

**Layout Structure**:
```
┌─────────────────────────────┐
│     [Camera Icon 80x80]      │
│          OCR App             │
│     Khôi phục mật khẩu       │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ [Key 48x48]           │  │
│  │ Quên mật khẩu          │  │
│  │ Nhập email để nhận link│  │
│  │                       │  │
│  │ EMAIL                 │  │
│  │ [_______________]      │  │
│  │                       │  │
│  │ [GỬI LINK ĐẶT LẠI]    │  │
│  │                       │  │
│  │ ← Quay lại đăng nhập   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Success State** (sau khi submit):
```
┌─────────────────────────────┐
│        ✓ (Check icon)       │
│     Kiểm tra email           │
│  Đã gửi link đặt lại đến     │
│  email@example.com           │
│                             │
│  [QUAY LẠI ĐĂNG NHẬP]       │
└─────────────────────────────┘
```

### 4. Routing (App.tsx)

Cập nhật routes:
```tsx
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
```

Cập nhật RootRedirect: navigate to `/login` thay vì `/`

## ACCEPTANCE CRITERIA
- **Given** chưa đăng nhập **When** truy cập `/` **Then** redirect to `/login`
- **Given** LoginPage **When** nhập email không valid **Then** hiện error "Email không hợp lệ"
- **Given** RegisterPage **When** password < 8 ký tự **Then** hiện strength bar red + text "Yếu"
- **Given** ForgotPasswordPage **When** submit success **Then** hiện success state với message
- **Given** đã login **When** click logout **Then** clear session, redirect to `/login`

## CONSTRAINTS
- DO NOT: Thay đổi authStore logic, chỉ thêm routes
- REUSE: UI components từ TIP-044
- DO NOT: Implement backend auth ở TIP này, dùng localStorage mock