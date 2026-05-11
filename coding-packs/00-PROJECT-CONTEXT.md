# ocr-mobile-web — Project Context (Scan Report)

> Vibecode Kit v5.0 — BƯỚC 1 (SCAN)  
> Coding workspace: `D:\scripts\HLVN\ocr-mobile-web`  
> Scanned: 2026-05-08  
> Note: re-scan after OCR / storage / export services are independently operational.

---

## SCAN REPORT

### TECH_STACK

| Layer | Technology | Version/Notes |
|---|---|---|
| Runtime | React | 19.2.5 |
| Language | TypeScript | 6.0.2 |
| Build Tool | Vite | 8.0.10 |
| Routing | React Router DOM | 7.14.2 |
| Styling | Tailwind CSS | 3.4.19, mobile-first responsive tokens |
| State | Zustand | 5.0.13, persisted auth store |
| Local DB | Dexie + dexie-react-hooks | 4.4.x, IndexedDB persistence |
| OCR API | OpenRouter Chat Completions | Gemini model tiers via OpenRouter |
| Excel Export | ExcelJS | Multi-sheet `.xlsx` generation |
| Camera | Browser media APIs | `CameraView` / `ImagePreview` flow |
| Image Compression | browser-image-compression | OCR-optimized image preprocessing |
| Forms | React Hook Form | Installed; page usage varies |
| UI Icons | Lucide React | Navigation and action icons |
| Tests | Vitest + Testing Library + jsdom | Component/page unit tests present |

### EXISTING_MODULES

| Module | Path | Purpose |
|---|---|---|
| App routing + camera flow | `src/App.tsx` | Public/protected routes; capture → compress → OCR → save → result flow |
| Auth store | `src/store/authStore.ts` | Session auth state persisted in localStorage |
| PIN auth helpers | `src/lib/auth.ts` | PIN hashing/verification and Dexie auth record lifecycle |
| IndexedDB schema | `src/db/schema.ts` | `auth`, `scans`, `analytics`, `settings` tables and shared data types |
| Scan repository hooks | `src/hooks/useScans.ts` | Live query scan list/detail CRUD and usage stats |
| OCR service | `src/lib/gemini.ts` | OpenRouter request, API-key fallback, retry, JSON extraction, cost tracking |
| Model config | `src/lib/models.ts` | Free/default/high model tiers and prompts |
| Compression service | `src/lib/compression.ts` | General and OCR-focused client-side image compression |
| Excel service | `src/lib/excel.ts` | Single/multi scan Excel export, image embedding, mobile share/download fallbacks |
| Share service | `src/lib/share.ts` | Format OCR text, clipboard fallback, Web Share API |
| Layout system | `src/components/layout/*` | Header, bottom nav, sidebar, protected route, responsive layout shell |
| UI kit | `src/components/ui/*` | Buttons, filter chips, inputs, toast, skeletons, checkbox, collapsible section |
| Pages | `src/pages/*` | Login/register/reset, history, detail, edit, analytics, settings |
| Tests | `src/__tests__/**/*` | Component/page tests for primary UI surfaces |

### SERVICES_STATUS

| Service | Main files | Status | Notes |
|---|---|---|---|
| OCR service | `src/lib/gemini.ts`, `src/lib/models.ts`, `src/lib/compression.ts` | Operational independently | Compresses image, selects model tier, calls OpenRouter, retries 429/503-like failures, tracks token cost and API key index |
| Storage service | `src/db/schema.ts`, `src/hooks/useScans.ts`, `src/lib/auth.ts`, `src/hooks/useSettings.ts` | Operational independently | Dexie tables support auth, scans, analytics cache, app settings; live hooks derive page state |
| Export/share service | `src/lib/excel.ts`, `src/hooks/useExport.ts`, `src/lib/share.ts`, `src/hooks/useShare.ts` | Operational independently | ExcelJS workbook generation with share/file-picker/download fallbacks; text share supports Web Share and clipboard |

### PATTERNS_DETECTED

| Pattern | Where Used | Notes |
|---|---|---|
| Client-only POC architecture | `src/App.tsx`, `src/db/schema.ts`, `src/lib/gemini.ts` | No backend; browser owns API calls, persistence, export |
| Protected route wrapper | `src/components/layout/ProtectedRoute.tsx` | Auth gate around app routes |
| Repository-style Dexie helpers | `src/hooks/useScans.ts` | CRUD functions and live queries centralized around `db.scans` |
| Mobile-first layout shell | `src/components/layout/Layout.tsx`, `BottomNav.tsx`, `Sidebar.tsx` | Mobile bottom nav, tablet+ sidebar, content max-width |
| Responsive Tailwind tokens | `tailwind.config.js` | Custom `md/lg/xl`, `sidebar`, `screen-md`, `max-w-content` tokens |
| OCR model tier abstraction | `src/lib/models.ts` | Free/default/high tiers with model, pricing, prompt bundled |
| API-key fallback | `src/lib/gemini.ts` | Tries multiple `VITE_OPENROUTER_API_KEY_*` keys sequentially |
| JSON extraction fallback | `src/lib/gemini.ts` | Parses fenced JSON or object-like response text |
| Excel fallback chain | `src/lib/excel.ts` | Web Share → File System Access → anchor download |
| Display-name normalization | `src/lib/scanDisplayName.ts` | Product/contract/lot/barcode/timestamp fallback for scan cards |
| Filter/sort utility separation | `src/lib/scanFilters.ts` | History page delegates filtering/sorting logic |

### REUSABLE_COMPONENTS

| Component / Utility | Path | Purpose |
|---|---|---|
| `Layout` | `src/components/layout/Layout.tsx` | Shared app shell with responsive nav behavior |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Tablet+ navigation surface |
| `BottomNav` | `src/components/layout/BottomNav.tsx` | Mobile navigation surface |
| `PrimaryButton` | `src/components/ui/PrimaryButton.tsx` | Main CTA button |
| `FilterChip` | `src/components/ui/FilterChip.tsx` | Reusable chip/toggle UI |
| `InputField` / `PasswordInput` | `src/components/ui/*` | Auth/form controls |
| `Toast` | `src/components/ui/Toast.tsx` | UI feedback |
| `useMediaQuery` / `useIsTablet` | `src/hooks/useMediaQuery.ts` | Runtime responsive checks |
| `useDebounce` | `src/hooks/useDebounce.ts` | Search debounce |
| `useExport` | `src/hooks/useExport.ts` | Export state and actions |
| `scanDisplayName` | `src/lib/scanDisplayName.ts` | Stable scan title derivation |
| `filterAndSortScans` | `src/lib/scanFilters.ts` | History search/filter/sort engine |
| `formatOCRForSharing` | `src/lib/share.ts` | OCR text formatting for sharing |

### GAPS_DETECTED

| Gap | Severity | Notes |
|---|---|---|
| Browser-exposed OCR keys | HIGH | `VITE_OPENROUTER_API_KEY_*` is acceptable for POC but not production-safe; backend proxy needed for production |
| Console/debug logs in production code | MEDIUM | `src/lib/gemini.ts`, `src/lib/compression.ts`, `src/lib/excel.ts`, `src/hooks/useExport.ts` contain `console.log` / `console.error` / `console.warn` debug paths |
| Responsive implementation verification incomplete | MEDIUM | Tablet responsive TIPs built and build-passed, but no recorded screenshot verification at 375/768/1280 |
| Sidebar logout does not navigate directly | MEDIUM | `Sidebar` calls `logout()` only; `Header` logout also navigates to `/login` |
| OCR response validation is prompt-based | MEDIUM | JSON is parsed into `OCRResponse` without schema validation at API boundary |
| `useMediaQuery` initial value is `false` | LOW | Can cause short mobile-layout flash on tablet/desktop before effect runs |
| IndexedDB schema has no migration history beyond v2 | LOW | Future schema changes need explicit Dexie version migrations |
| Large ExcelJS bundle | LOW | Build warns about chunk size; dynamic import could reduce initial app payload |

### CODE_HEALTH

| Metric | Value | Notes |
|---|---:|---|
| Source TS/TSX files | 66 | Under `src` |
| Tests present | Yes | `src/__tests__` has component/page coverage |
| Build script | Yes | `npm run build` = `tsc -b && vite build` |
| Lint script | Yes | `npm run lint` = `eslint .` |
| TypeScript strictness | Config-dependent | Build uses project references via `tsc -b` |
| File sizes | Healthy | No scanned app file exceeds 800 lines |
| State mutation risk | Low/medium | React state mostly immutable; Dexie update helpers mutate persisted records intentionally |
| Security posture | POC-grade | Client-side key exposure remains primary architectural risk |
| Recent build status | PASS | Last responsive execution reported successful production build |

### ESTIMATED_SIZE

| Metric | Value |
|---|---:|
| Source files | 66 TS/TSX files |
| Primary app pages | 8 page files |
| Layout components | 6 layout files |
| UI components | 10+ reusable UI files |
| Independent services | 3 core services: OCR, storage, export/share |
| API routes/backend | 0; client-only SPA |
| Persistent tables | 4 Dexie tables |

---

## Auto-Answered Requirements (for RRI)

These are obvious from the current codebase — skip in requirements interview unless the user wants to revisit them:

1. The app is a client-only React SPA for warehouse OCR workflows.
2. The main workflow is camera capture → image compression → OCR → IndexedDB save → result/detail/edit/export.
3. Auth is local session/PIN oriented, backed by Zustand persistence and Dexie auth records.
4. Scan history is stored in IndexedDB and rendered through Dexie live queries.
5. OCR uses OpenRouter with model tiers: free/default/high.
6. Export uses ExcelJS and supports single-scan and multi-scan workbooks.
7. Share behavior uses Web Share API where available and falls back to clipboard/download flows.
8. UI is mobile-first with tablet+ sidebar support and responsive History/Analytics grids.
9. Testing stack is Vitest + Testing Library + jsdom.
10. Deployment target is static SPA hosting; camera requires HTTPS outside localhost.

## Constraints

1. Keep mobile-first UX: bottom nav remains primary on mobile, sidebar only on tablet+.
2. Preserve local-first/client-only POC architecture unless explicitly planning a backend proxy.
3. Do not store secrets directly in source; current env-based browser keys are POC-only and still exposed in built JS.
4. OCR inputs should stay compressed before API calls to control latency and token/image cost.
5. IndexedDB records must remain backward-compatible or be migrated via Dexie version bumps.
6. Excel export must remain usable on mobile browsers with share/download fallbacks.
7. Vietnamese OCR prompts and UI copy must preserve diacritics and domain labels.
8. UI changes should respect existing Tailwind tokens in `tailwind.config.js`.

## Risks / Tech Debt

| Risk | Severity | Mitigation |
|---|---|---|
| API key abuse from browser bundle | HIGH | Add backend OCR proxy before production; rate-limit and keep provider keys server-side |
| Debug logs leaking operational data | MEDIUM | Replace production logs with controlled logger or remove before release |
| OCR output shape drift | MEDIUM | Add runtime schema validation for OCR JSON before saving |
| Bundle weight from ExcelJS | MEDIUM | Dynamically import export service only when user exports |
| Insufficient visual regression evidence | MEDIUM | Add Playwright screenshots for 375, 768, 1024, 1440 breakpoints |
| Local-only data loss | MEDIUM | Add backup/export guidance or sync strategy if production needs multi-device use |
| Dexie migration fragility | LOW | Document schema migrations and test upgrade path before changing tables |

---

## Current Architecture Snapshot

```text
React SPA
├─ Auth service
│  ├─ Zustand persisted session
│  └─ Dexie auth table + bcrypt PIN helpers
├─ OCR service
│  ├─ browser-image-compression
│  ├─ OpenRouter chat completions
│  ├─ Gemini model tiers
│  └─ JSON extraction + token/cost metadata
├─ Storage service
│  ├─ Dexie OCRDatabase
│  ├─ scans live queries
│  ├─ settings live queries
│  └─ analytics derivation in pages/hooks
├─ Export/share service
│  ├─ ExcelJS workbook generation
│  ├─ Web Share API file sharing
│  ├─ File System Access API fallback
│  └─ anchor download / clipboard fallback
└─ UI shell
   ├─ mobile BottomNav
   ├─ tablet+ Sidebar
   ├─ responsive Header/Layout
   └─ History + Analytics responsive pages
```

## Quality Gate Self-Review

✅ Coding workspace identified: `D:\scripts\HLVN\ocr-mobile-web`  
✅ Coding-packs located: `D:\scripts\HLVN\ocr-mobile-web\coding-packs`  
✅ Scan report updated from stale Python-origin context to current React SPA state  
✅ Tech stack cross-checked against `package.json`  
✅ Core modules scanned across routing, OCR, storage, auth, export, layout, responsive pages  
✅ 3 independent services documented: OCR, storage, export/share  
✅ Reusable components and project constraints captured  
✅ Gaps and risks explicitly recorded  
⚠️ Standards Discovery not run in this pass; can be run later with `/vibecode:scan --standards`  
⚠️ Product docs gate not run in this pass; can be run later with `/vibecode:scan --product`  
⚠️ No new tests/build were executed during this scan-only update

**Confidence**: 88% — current service/module map is accurate from scanned source, with remaining confidence gap around unexecuted runtime/browser verification.
