# TIP-043: Full UI Overhaul (Industrial Utility)

## HEADER
- TIP-ID: TIP-043
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-042
- Estimated: L

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS, Lucide React, Headless UI
- Key files to read first:
    - `coding-packs/design/design-brief.md` (Cấu bản thiết kế mới)
    - `tailwind.config.js` (Cấu hình màu sắc/spacing)
    - `src/components/layout/Layout.tsx` (Cấu trúc khung app)
- Patterns to follow: Sử dụng triệt để Tailwind utility classes, tránh inline styles. Tuân thủ 100% spacing và border-radius trong Design Brief.

## APPLICABLE STANDARDS
- none

## TASK
Thực hiện thay đổi toàn bộ diện mạo của ứng dụng sang phong cách "Industrial Utility" dựa trên file thiết kế `OCR Mobile Web Warehouse Invoice Scanner.png`. Việc này bao gồm cập nhật hệ thống Design Tokens, làm lại các Component dùng chung và thay đổi Layout của 9 màn hình chính.

## SPECIFICATIONS
### Business Rules
1. **Auth Flow**: Thay đổi giao diện Login hiện tại sang Email/Password. Thêm màn hình Register và Forgot Password.
2. **Scan Flow**: Cập nhật Camera View với overlay hướng dẫn và nút chụp (FAB) 64px màu xanh blue.
3. **Result Display**: Dữ liệu OCR hiển thị trong các thẻ (Cards) có thể thu gọn (Collapsible), phân tách rõ "Thông tin chính" và "Thông tin khác".
4. **History**: Hỗ trợ 3 chế độ xem (List, Grid, Compact) với style card mới.
5. **Analytics**: Sử dụng các KPI cards có icon minh họa phía trước giá trị.

### Validation
- Email phải đúng định dạng regex.
- Password tối thiểu 8 ký tự, có chỉ báo độ mạnh (Strength Indicator).
- Tất cả các nút bấm (Buttons) phải có chiều cao tối thiểu 44px (Touch Target).

### Error Handling
- Hiển thị lỗi form ngay dưới input field với màu đỏ (#EF4444) và icon cảnh báo.
- Loading states (Skeleton) phải khớp với layout thực tế của card.

## ACCEPTANCE CRITERIA
- **Given** người dùng mở app **When** chưa đăng nhập **Then** thấy màn hình Login mới với Logo Camera 80x80 và thẻ đăng nhập màu trắng nổi bật trên nền xám nhạt.
- **Given** màn hình Kết quả OCR **When** nhấn vào header của section **Then** section đó phải thu gọn/mở rộng mượt mà (200ms).
- **Given** màn hình History **When** chuyển đổi View Mode **Then** layout phải thay đổi ngay lập tức sang Grid 2 cột hoặc List 1 cột theo đúng design.
- **Given** thiết bị di động **When** hiển thị app **Then** không có hiện tượng overflow ngang, side padding luôn là 16px.

## CONSTRAINTS
- **DO NOT**: Sử dụng các màu sắc ngoài hệ thống Design Tokens đã định nghĩa.
- **REUSE**: Tận dụng `lucide-react` cho toàn bộ icons.
- **SKIP**: Không thay đổi logic xử lý OCR hoặc Database (Dexie) trong TIP này, chỉ tập trung vào UI/UX.
