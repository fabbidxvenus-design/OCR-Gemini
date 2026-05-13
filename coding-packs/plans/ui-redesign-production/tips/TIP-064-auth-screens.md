# TIP-064: Auth Screens

## Objective
Redesign Login, Register, and Forgot Password screens to match the production auth design from Stitch.

## Source Screen
- Stitch Login screen generated in project `17363451422652957148`
- Design: branded HLVN OCR, value proposition, trust badges, production card form

## Files
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/ForgotPasswordPage.tsx`

## Requirements

### Login
- Brand: "HLVN OCR"
- Tagline: "Quét tài liệu, trích xuất dữ liệu, xuất báo cáo"
- Form card with email/password fields
- Primary CTA: "Đăng nhập"
- Secondary links: register and forgot password
- Trust badges: "Backend API", "AI OCR", "Xuất Excel"
- Subtle operational background texture or layered surfaces

### Register
- Match login visual system
- Explain account creation briefly
- Form card with email/password/confirm if existing fields support it
- Primary CTA teal
- Link back to login

### Forgot Password
- Match login visual system
- Clear recovery instructions
- Email field and primary CTA teal
- Link back to login

## Acceptance Criteria
- Auth screens share cohesive production visual system
- Form behavior unchanged
- Error/loading states remain visible
- Vietnamese copy remains clear
- Build and tests pass
