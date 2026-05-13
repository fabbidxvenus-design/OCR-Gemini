# TIP-070: Settings Screen

## Objective
Redesign Settings as a mobile-first diagnostic and configuration panel.

## Source Screen
- Stitch Settings screen generated in project `17363451422652957148`
- Screen id: `52e481a3a4044eba88d768ad4e20a7d5`

## Files
- `src/pages/SettingsPage.tsx`

## Requirements

### Header
- Title: "Cài đặt"
- API online indicator

### Profile Card
- User avatar/icon
- Email display
- "Đăng xuất" action

### API Configuration Card
- Title: "Cấu hình API"
- Gemini API key input with show/hide toggle
- Model selector: Gemini Pro / Gemini Flash
- Save button

### System Diagnostics Card
- Title: "Chẩn đoán hệ thống"
- Status rows:
  - "API kết nối" with green/red indicator
  - "Bộ nhớ cục bộ" with usage percentage
  - "Phiên bản" with app version
- "Xóa cache" action button

### Export Settings Card
- Title: "Xuất dữ liệu"
- Format selector: Excel / CSV
- "Xuất tất cả hồ sơ" action

### About Card
- App name and version
- "Điều khoản sử dụng" link
- "Chính sách bảo mật" link

## Acceptance Criteria
- Settings uses grouped diagnostic cards
- API configuration is clear and accessible
- System status is visible
- Existing settings logic preserved
- Build passes
