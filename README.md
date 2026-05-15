# HLVN OCR Mobile Web

Mobile-first OCR scanning web app for HLVN. Extracts structured data from product/order images using Gemini, with local-first result caching and cloud history sync.

## Architecture

```
Camera confirm
  -> compress image
  -> call Gemini/OCR strategy
  -> receive OCR result
  -> store OCR result locally with id local-*
  -> navigate to /ocr-result/local-*
  -> fire-and-forget backend /api/scans save
  -> on DB save success: delete local result
  -> on DB save failure: ignore and keep local result until TTL cleanup
```

## Key Features

- **Local-first result cache**: OCR result appears immediately after processing, stored in `localStorage` with 7-day TTL
- **Direct Gemini or backend proxy**: `VITE_USE_DIRECT_GEMINI=true` enables direct browser Gemini calls (API key in header only)
- **Fire-and-forget persistence**: backend save runs in background; UI never waits or shows save errors
- **Edit sync**: user edits are captured and synced to backend before local result deletion
- **Auth isolation**: local OCR cache cleared on login, session change, and logout
- **History**: always from backend DB; local-only results never appear in history

## Tech Stack

- React + TypeScript + Vite
- Zustand (auth state)
- TanStack Query (backend data)
- Zod (runtime validation)
- Vitest (unit tests)
- Playwright (E2E tests)

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npx vitest run       # Unit tests
npx playwright test  # E2E tests
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_USE_DIRECT_GEMINI` | Set to `true` to call Gemini directly from browser |
| `VITE_GEMINI_API_KEY` | Primary Gemini API key (for direct mode) |
| `VITE_GEMINI_API_KEY_2` | Fallback Gemini API key (optional) |
| `VITE_API_URL` | Backend API URL (default: inferred from origin) |

## Security

- API keys read from `import.meta.env` only; never hardcoded
- Direct Gemini key sent via `x-goog-api-key` request header, not URL or body
- No image/base64 stored in localStorage
- No image/base64 sent to `/api/scans` history endpoint
- Local OCR cache cleared on auth state changes

## Testing

```bash
# Unit tests (21 files, 58 tests)
npx vitest run

# E2E tests (18 scenarios across mobile/tablet/desktop)
npx playwright test e2e/ocr-latency-phase1.spec.ts --project=mobile
npx playwright test e2e/ocr-latency-phase1.spec.ts --project=tablet
npx playwright test e2e/ocr-latency-phase1.spec.ts --project=desktop
```

## Project Structure

```
src/
├── App.tsx                    # Main OCR orchestration + background save
├── lib/
│   ├── localOcrScans.ts       # Local OCR cache (localStorage)
│   ├── gemini.ts              # OCR strategy (direct or backend proxy)
│   └── apiClient.ts           # Backend API client
├── hooks/
│   ├── useScans.ts            # Scan CRUD + local/pending resolution
│   └── useAuthStore.ts        # Auth state + cache clearing
├── pages/
│   ├── HistoryPage.tsx        # Backend DB-only history
│   └── OCRResultPage.tsx      # Result display (local-* or remote)
└── store/
    └── authStore.ts           # Zustand auth with cache lifecycle
```

## Backend

See [HLVN-serverless](https://github.com/fabbidxvenus-design/HLVN-serverless) for backend implementation.

## License

Proprietary — HLVN
