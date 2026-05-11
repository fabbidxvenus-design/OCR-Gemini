# TIP-055: API Client Foundation for Local Backend

## HEADER
- TIP-ID: TIP-055
- Project: ocr-mobile-web
- Module: api-client
- Priority: P0
- Depends on: none
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, Tailwind CSS, Zustand, Dexie, ExcelJS, React Router 7, Vitest
- Key files to read first:
  - `src/lib/gemini.ts`
  - `src/hooks/useScans.ts`
  - `src/store/authStore.ts`
  - `src/db/schema.ts`
  - `src/lib/excel.ts`
  - `src/hooks/useSettings.ts`
- Patterns to follow:
  - Existing exported utility style in `src/lib/*`
  - Existing hook return shape style in `src/hooks/*`
  - Existing TypeScript interface definitions in `src/db/schema.ts`

## APPLICABLE STANDARDS
Builder MUST conform to:
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — API error handling and retry/fallback mindset
- [api/json-extraction](../standards/api/json-extraction.md) — boundary parsing discipline for OCR JSON
- [database/dexie-live-queries](../standards/database/dexie-live-queries.md) — current storage pattern to replace carefully
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — preserve immutable scan update behavior

## TASK
Create a typed frontend API client foundation for a local backend at `http://localhost:3001`. This TIP only introduces API configuration, request helpers, shared DTO types, and error mapping; it does not migrate auth, scans, OCR, settings, or export flows yet.

## SPECIFICATIONS
### Business Rules
1. Frontend must read backend base URL from `VITE_API_BASE_URL`, defaulting to `http://localhost:3001` for local development.
2. API calls must be centralized in one client module instead of scattered `fetch()` calls.
3. Client must support JSON requests, JSON responses, binary/blob responses, and typed errors.
4. Client must not use Dexie or localStorage directly.
5. Existing direct OpenRouter calls and Dexie calls must remain untouched in this TIP.

### Files to Create
- `src/lib/apiClient.ts`
- `src/lib/apiTypes.ts`

### Files to Modify
- `.env.example` if present; otherwise create/update project env documentation only if already existing.
- No page/component migration in this TIP.

### API Contract Assumption
Use these endpoint prefixes for later TIPs:
- Auth: `/auth/*`
- Scans: `/scans/*`
- OCR: `/ocr/*`
- Settings: `/settings/*`
- Export: `/export/*`
- Analytics: `/analytics/*`

### Validation
1. `VITE_API_BASE_URL` must be normalized with no trailing slash.
2. Request bodies must be JSON-stringified only when body is provided.
3. Non-2xx responses must throw a typed `ApiError` containing `status`, `message`, and optional `code`.
4. Empty responses (204) must not attempt JSON parsing.

### Error Handling
1. Network failure: throw `ApiError` with status `0` and user-safe message `Không thể kết nối API local`.
2. JSON parse failure: throw `ApiError` with status from response and message `API trả về dữ liệu không hợp lệ`.
3. Backend error envelope: map `{ error, message, code }` into `ApiError`.
4. Do not silently fall back to localStorage/Dexie when API fails.

## ACCEPTANCE CRITERIA
- Given `VITE_API_BASE_URL` is unset When the API client initializes Then it uses `http://localhost:3001`.
- Given `VITE_API_BASE_URL=http://localhost:3001/` When the client builds a URL Then the final URL does not contain a double slash before the path.
- Given backend returns 200 JSON When `apiGet<T>()` is called Then it returns typed data.
- Given backend returns 204 When `apiDelete()` is called Then it resolves without JSON parsing.
- Given backend is offline When any API helper is called Then it throws typed `ApiError` with status `0`.
- Given backend returns 500 with `{ message: "boom" }` When API helper receives it Then it throws `ApiError` with message `boom`.

## CONSTRAINTS
- DO NOT migrate feature flows in this TIP.
- DO NOT remove Dexie, Zustand persistence, OpenRouter calls, or ExcelJS yet.
- DO NOT hardcode `localhost:3001` inside feature modules; only the API client may define the default.
- REUSE shared TypeScript types where compatible with `src/db/schema.ts`.
- SKIP authentication token strategy beyond allowing optional headers in the client.

## QUALITY GATE SELF-REVIEW
- [x] TIP is self-contained and implementation-ready.
- [x] Files to create/modify are explicit.
- [x] Acceptance criteria use Given/When/Then.
- [x] Constraints prevent accidental migration scope creep.
- [x] Applicable standards listed.
- Gap: backend endpoint schemas are assumed; builder must align with actual `localhost:3001` implementation before coding.
