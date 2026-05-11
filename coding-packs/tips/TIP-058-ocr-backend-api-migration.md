# TIP-058: OCR Backend API Migration

## HEADER
- TIP-ID: TIP-058
- Project: ocr-mobile-web
- Module: ocr-api
- Priority: P0
- Depends on: TIP-055, TIP-057
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, browser-image-compression currently client-side, OpenRouter currently called from browser
- Key files to read first:
  - `src/lib/apiClient.ts`
  - `src/lib/gemini.ts`
  - `src/lib/models.ts`
  - `src/lib/compression.ts`
  - `src/App.tsx`
  - `src/pages/SettingsPage.tsx`
  - `src/hooks/useSettings.ts`
- Patterns to follow:
  - Existing `processOCR(imageBlob, tierOverride?)` return type
  - Existing model tier names: `free`, `default`, `high`
  - Existing progress/error UX in `CameraPage`

## APPLICABLE STANDARDS
Builder MUST conform to:
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — current direct OpenRouter behavior to move behind backend
- [api/json-extraction](../standards/api/json-extraction.md) — OCR JSON parsing remains a backend responsibility after migration

## TASK
Move frontend OCR processing from direct OpenRouter browser calls to backend API calls at `localhost:3001`. The frontend should send image data and selected model tier to the backend, then receive structured OCR output and token/cost metadata.

## SPECIFICATIONS
### Business Rules
1. Frontend must not call OpenRouter directly after this migration.
2. Frontend must not read `VITE_OPENROUTER_API_KEY_*` after this migration.
3. `processOCR()` may remain as the frontend abstraction, but its implementation must call backend `/ocr/process`.
4. Backend owns OpenRouter API keys, provider retry, JSON extraction, and token/cost calculation.
5. Frontend may keep image compression before upload unless backend requires original image.
6. Existing camera flow must remain: capture → preview → confirm → processing → result.

### Files to Create
- `src/lib/ocrApi.ts` if not folding into `src/lib/gemini.ts`

### Files to Modify
- `src/lib/gemini.ts`
- `src/App.tsx` if request/response shape changes
- `src/hooks/useSettings.ts` if model tier source changes
- `.env.example` if OpenRouter keys should be removed from frontend env docs

### Backend Endpoint Contract
Assume endpoint:
- `POST /ocr/process`
  - Request: multipart form data with `image` and `modelTier`, or JSON `{ imageDataUrl, modelTier }` depending on backend.
  - Response:
    ```ts
    {
      structured: OCRResponse;
      tokenUsage: TokenUsage;
      apiKeyIndex: number;
      modelTier: 'free' | 'default' | 'high';
    }
    ```

### Validation
1. `modelTier` must be one of `free`, `default`, `high` before sending.
2. Image blob/data URL must be present before calling backend.
3. Backend response must include `structured.fields` as an array, defaulting to `[]` only after validation.
4. Token usage must include numeric `input`, `output`, and `cost`.

### Error Handling
1. Backend offline: show `Không thể kết nối API OCR local`.
2. OCR timeout: show retry option using existing CameraPage error path.
3. Backend returns OCR validation error: show backend-safe message.
4. Missing OCR fields: still save scan with `fields: []`, `sizes: []`, and raw text if present.

## ACCEPTANCE CRITERIA
- Given user confirms an image When OCR starts Then frontend calls `POST /ocr/process` on `localhost:3001`.
- Given backend returns structured OCR When request succeeds Then scan is saved through TIP-057 scan API with returned OCR data.
- Given backend returns token usage When scan is saved Then history/analytics can show cost and API key index as before.
- Given backend is offline When user confirms image Then CameraPage shows connection error and retry option.
- Given frontend env contains no OpenRouter keys When app builds Then OCR flow still works through backend.
- Given model tier is set to `high` When OCR request is sent Then request includes `modelTier: 'high'`.

## CONSTRAINTS
- DO NOT expose OpenRouter keys in frontend code after this TIP.
- DO NOT change camera capture UI.
- DO NOT implement scan storage migration here; depend on TIP-057.
- REUSE existing `OCRResponse`, `TokenUsage`, and model tier types.
- SKIP backend implementation; this TIP is frontend integration only.

## QUALITY GATE SELF-REVIEW
- [x] TIP clearly separates frontend OCR integration from backend OCR implementation.
- [x] Explicitly removes direct provider key dependency from frontend.
- [x] Acceptance criteria cover success, cost tracking, model tier, and offline errors.
- Gap: exact upload format depends on backend; builder must inspect backend contract before coding.
