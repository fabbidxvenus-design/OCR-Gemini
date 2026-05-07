# TIP-048: Analytics & Settings Screens

## HEADER
- TIP-ID: TIP-048
- Project: OCR Gemini Mobile Web
- Module: Analytics/Settings
- Priority: P2
- Depends on: TIP-044, TIP-046
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React
- Key files to read first:
  - `src/pages/AnalyticsPage.tsx`
  - `src/pages/SettingsPage.tsx`

## TASK
Cập nhật giao diện màn hình Thống kê (Analytics) và Cài đặt (Settings) sang phong cách Industrial Utility.

## SPECIFICATIONS

### 1. AnalyticsPage.tsx (Dashboard)

**Date Range Filter**:
- Sử dụng FilterChips: [7 ngày] [30 ngày] [90 ngày] [Tất cả].

**KPI Cards** (Grid 1 hoặc 2 cột):
- Mỗi card: Icon 24px bên trái, Label phía trên giá trị lớn.
- Colors:
  - Tổng scan: Blue (Primary)
  - Tổng chi phí: Green (Success)
  - API Key stats: Purple/Amber

**Top Products Section**:
- Progress bars: Hiển thị thanh tiến trình ngang tỉ lệ thuận với số lượng scan.
- List: Rank #1-5 với font semibold.

### 2. SettingsPage.tsx

**OCR Quality Section**:
- Radio groups design: Mỗi option là 1 card (rounded-xl, border-2).
- Highlight: Option được chọn có border-primary và check icon.
- Content: Name (Bold), Description (Small), Pricing (Label tag).

**System Info Section**:
- Card list: Label bên trái, Value (Bold) bên phải.
- Security badge: Hiện "[Shield] AES-256" màu xanh lá.

**Danger Zone**:
- Logout button: `variant="danger"` (red text/border), full width.

## ACCEPTANCE CRITERIA
- **Given** Analytics **Then** KPI cards phải có icon minh họa tương ứng.
- **Given** Analytics **When** chọn range khác **Then** dữ liệu update ngay lập tức.
- **Given** Settings **When** chọn model tier mới **Then** hiện Toast "Đã lưu thay đổi" (3s).
- **Given** Settings **Then** nút Đăng xuất phải nổi bật màu đỏ.

## CONSTRAINTS
- DO NOT: Thay đổi logic tính toán thống kê.
- REUSE: `FilterChip` và `PrimaryButton` từ TIP-044.
- DO NOT: Thêm các biểu đồ thư viện bên ngoài (Chart.js/Recharts), chỉ dùng Tailwind/CSS thuần.
