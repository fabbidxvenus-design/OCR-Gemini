# TIP-018: Vercel Deployment

## HEADER
- TIP-ID: TIP-018
- Project: OCR Gemini Mobile Web
- Module: DevOps / Deployment
- Priority: P1
- Depends on: TIP-017 (Hoàn tất)
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + Tailwind CSS
- Key files to read first:
  - `.env.example`
  - `vercel.json` (sẽ tạo)
  - `vite.config.ts`
- Patterns: Vercel zero-config deployment

## APPLICABLE STANDARDS
- none (deployment task, không cần standard)

## TASK
Deploy ứng dụng React lên Vercel với environment variable cho Gemini API key.

## SPECIFICATIONS
### Business Rules
1. Vercel auto-detect Vite project và build tự động
2. API key được set qua Vercel Dashboard (không commit vào code)
3. Build output ra thư mục `dist`
4. Single-page app với client-side routing (React Router)

### Environment Variables
- `VITE_GEMINI_API_KEY` - Gemini API key (user nhập trên Vercel Dashboard)

### Vercel Config
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## ACCEPTANCE CRITERIA
- Given **Code đã push lên GitHub** When **Import repo trên Vercel** Then **Vercel auto-detect Vite và hiển thị build command**
- Given **Vercel project** When **Thêm VITE_GEMINI_API_KEY trong Environment Variables** Then **API key được inject vào build**
- Given **Production build** When **Truy cập URL Vercel** Then **App load đúng, OCR hoạt động**
- Given **React Router** When **Truy cập `/history`, `/camera`, etc.** Then **Đúng route (nhờ rewrites config)**

## CONSTRAINTS
- DO NOT: Commit `.env.local` hoặc API key vào git
- DO NOT: Thay đổi code logic (chỉ thêm config deployment)
- REUSE: Sử dụng build command có sẵn `npm run build`
- SKIP: Không cần CI/CD pipeline phức tạp

## STEPS
1. Tạo `vercel.json` với config trên
2. Kiểm tra `.gitignore` đã ignore `.env`
3. Push code lên GitHub (đã làm ở TIP trước)
4. Hướng dẫn user import trên Vercel Dashboard
5. Thêm Environment Variable
6. Trigger deploy