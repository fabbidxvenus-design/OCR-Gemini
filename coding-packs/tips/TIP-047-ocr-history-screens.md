# TIP-047: OCR & History Screens - Scan, Result, History

## HEADER
- TIP-ID: TIP-047
- Project: OCR Gemini Mobile Web
- Module: OCR/History
- Priority: P1
- Depends on: TIP-044, TIP-046
- Estimated: L

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React
- Components to use: `CollapsibleSection`, `PrimaryButton`, `InputField`, `FilterChip`
- Key files to read first:
  - `src/components/camera/CameraView.tsx`
  - `src/pages/OCRResultPage.tsx`
  - `src/pages/HistoryPage.tsx`
  - `src/pages/HistoryDetailPage.tsx`

## TASK
Cập nhật giao diện 4 màn hình cốt lõi của ứng dụng (Camera, OCR Result, History List, History Detail) sang phong cách Industrial Utility.

## SPECIFICATIONS

### 1. CameraView.tsx & ImagePreview.tsx

**CameraView**:
- Overlay: Thêm dark overlay (bg-black/85) với khung chữ nhật trong suốt (cutout) ở giữa (280x200px).
- Hướng dẫn: Thêm text "Hướng nhãn hóa đơn vào khung" dưới cutout.
- Nút chụp: Large circular button 64px, màu primary (#2563EB), shadow-elevated.
- Icon: Thêm X (Close) top-left, Settings top-right.

**ImagePreview**:
- Layout: Ảnh chiếm full màn hình (object-contain).
- Actions: Nút "Chụp lại" (white/20 blur) và "Xác nhận" (primary) ở bottom.

### 2. OCRResultPage.tsx & HistoryDetailPage.tsx

Cả 2 màn hình dùng chung cấu trúc card và collapsible:
- **Header**: Back button + Title + Edit button.
- **Image**: Thumbnail full width, max-height 200px.
- **Collapsible Sections**:
  - `THÔNG TIN CHÍNH`: Expanded mặc định. Label uppercase, value bold.
  - `THÔNG TIN KHÁC`: Collapsed mặc định.
  - `BẢNG SIZE`: Render dạng table gọn gàng trong card.
  - `VĂN BẢN GỐC`: Render trong code block/pre tag, collapsed.
- **Bottom Bar** (OCR Result): [Copy] [Share] [Edit] trong sticky bar.
- **Metadata** (History Detail): Thêm section thông tin Token usage và Chi phí ($).

### 3. HistoryPage.tsx (Grid & List View)

- **Search Bar**: Input h-11, rounded-sm, bg-surface.
- **View Toggle**: Chuyển đổi giữa List/Grid/Compact.
- **Filter Row**: Horizontal scrolling chips (Hôm nay, Tuần này, Đã sửa...).
- **Grid Layout**: 2 cột, mỗi item là 1 card (aspect-square image + product name truncated).
- **Select Mode**: Support chọn nhiều item để Export Excel (Floating button hiện khi có selection).

## ACCEPTANCE CRITERIA
- **Given** CameraView **Then** phải thấy khung nhắm và hướng dẫn quét.
- **Given** OCR Result **When** click header section **Then** thu gọn/mở rộng mượt mà.
- **Given** History **When** đổi sang Grid view **Then** layout hiển thị 2 cột ngay lập tức.
- **Given** History Detail **Then** hiển thị đầy đủ thông tin chi phí và token.

## CONSTRAINTS
- DO NOT: Thay đổi OCR processing logic (Gemini/OpenRouter).
- REUSE: `CollapsibleSection` từ TIP-044 cho toàn bộ các màn hình result/detail.
- DO NOT: Hardcode padding, dùng `p-screen` (16px) và `p-card` (16px).
