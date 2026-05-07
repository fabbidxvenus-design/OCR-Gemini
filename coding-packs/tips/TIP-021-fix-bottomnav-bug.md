# TIP-021: Fix BottomNav Route Bug

## HEADER
- TIP-ID: TIP-021
- Project: OCR Gemini Mobile Web
- Module: UI / Navigation
- Priority: P1
- Depends on: TIP-017
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + React Router 6
- Key files to read first:
  - `src/components/layout/BottomNav.tsx` (bug location)
  - `src/App.tsx` (routes configuration)

## APPLICABLE STANDARDS
- none

## TASK
Fix bug: BottomNav có tab "Kết quả" trỏ đến `/result` nhưng route không tồn tại, gây confusion. Cần xóa tab không sử dụng và đảm bảo navigation hoạt động đúng.

## SPECIFICATIONS

### Bug Analysis

**Root Cause:**
```
BottomNav.tsx có:
  { to: '/result', icon: FileText, label: 'Kết quả' }

App.tsx KHÔNG có route cho '/result'
→ Click tab "Kết quả" → redirect đâu đó (RootRedirect)
→ User thấy "giống nhau" vì cùng landing page
```

**Current Routes in App.tsx:**
| Route | Component | Tab |
|-------|-----------|-----|
| `/camera` | CameraPage | Chụp ảnh ✓ |
| `/ocr-result/:scanId` | OCRResultPage | Kết quả (dynamic, cần scanId) |
| `/history` | HistoryPage | Lịch sử ✓ |
| `/analytics` | AnalyticsPage | Thống kê ✓ |
| `/` | LoginPage | (public) |
| `*` | RootRedirect | (fallback) |

**Current BottomNav items:**
| Route | Label | Status |
|-------|-------|--------|
| `/camera` | Chụp ảnh | ✓ VALID |
| `/history` | Lịch sử | ✓ VALID |
| `/analytics` | Thống kê | ✓ VALID |
| `/result` | Kết quả | ✗ INVALID |

### Solution

**Option A (Recommended): Xóa tab "Kết quả"**
- Tab này không có page tương ứng
- Kết quả OCR hiển thị sau khi scan tại `/ocr-result/:scanId`
- User vào "Lịch sử" để xem lại các scan đã làm

**Option B: Tạo ResultPage mới**
- Tạo page mới hiển thị scan gần nhất
- Route: `/result`
- Lấy scan gần nhất từ IndexedDB

## ACCEPTANCE CRITERIA
- Given **BottomNav** When **Render** Then **Chỉ có 3 tabs hợp lệ: Chụp ảnh, Lịch sử, Thống kê**
- Given **User click tab** When **Tab tồn tại** Then **Navigate đúng page**
- Given **User click "Kết quả"** When **Tab không tồn tại** Then **Behavior xác định (xóa hoặc redirect)**

## CONSTRAINTS
- DO NOT: Thay đổi logic navigation của các tabs còn lại
- DO NOT: Break existing routes (/camera, /history, /analytics, /ocr-result/:scanId)
- REUSE: Giữ nguyên icon và styling
- SKIP: Không tạo ResultPage mới (trừ khi user yêu cầu Option B)

## IMPLEMENTATION STEPS

### Step 1: Xóa tab "Kết quả" không hợp lệ

```typescript
// src/components/layout/BottomNav.tsx
const navItems = [
  { to: '/camera', icon: Camera, label: 'Chụp ảnh' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/analytics', icon: BarChart3, label: 'Thống kê' },
  // Remove: { to: '/result', icon: FileText, label: 'Kết quả' },
];
```

### Step 2: Verify build
```bash
npm run build
```

### Step 3: Commit + push

## ALTERNATIVE: Tạo ResultPage (nếu user muốn giữ tab)

Nếu muốn tab "Kết quả" hoạt động, cần tạo ResultPage:

```typescript
// src/pages/ResultPage.tsx
export default function ResultPage() {
  // Lấy scan gần nhất từ IndexedDB
  // Hiển thị kết quả OCR
  // Nếu không có scan → redirect về /camera
}
```

```typescript
// src/App.tsx
<Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
```

## TESTING CHECKLIST
- [ ] Build pass
- [ ] BottomNav hiển thị đúng 3 tabs
- [ ] Click "Chụp ảnh" → đúng page
- [ ] Click "Lịch sử" → đúng page
- [ ] Click "Thống kê" → đúng page
- [ ] Tab "Kết quả" không còn trong BottomNav
- [ ] OCR flow vẫn hoạt động (sau khi scan → /ocr-result/:scanId)