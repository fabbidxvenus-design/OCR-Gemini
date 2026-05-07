# OCR Gemini — Project Context (Scan Report)

> Vibecode Kit v5.0 — BƯỚC 1 (SCAN)
> Coding workspace: D:\scripts\ocr_gemini
> Scanned: 2026-05-05

---

## SCAN REPORT

### TECH_STACK
| Component | Technology | Version/Notes |
|-----------|------------|---------------|
| Language | Python | 3.11 (implied by `from __future__` patterns) |
| AI SDK | google-genai | Gemini API client |
| Vision Model | gemini-2.5-flash-lite | Cheapest 2.5 model for OCR |
| Excel | openpyxl | Excel file generation |
| Image Processing | Pillow | Image resize for Excel embedding |
| Package Manager | pip | requirements.txt |

### EXISTING_MODULES
| Module | Purpose | Lines |
|--------|---------|-------|
| `ocr_gemini.py` | Core OCR: reads image, calls Gemini, returns Markdown | 138 |
| `ocr_to_excel.py` | Excel export: structured JSON → multi-sheet workbook | 312 |
| `estimate_billing.py` | Cost estimation across multiple Gemini models | 108 |
| `result.md` | Sample OCR output (Markdown) | - |
| `requirements.txt` | Dependencies manifest | - |

### PATTERNS_DETECTED
| Pattern | Where Used | Notes |
|---------|------------|-------|
| Hardcoded API key | All 3 scripts (line 14/22/12) | Security risk |
| Retry with exponential backoff | `ocr_gemini.py`, `ocr_to_excel.py` | 503 handling with 2^attempt delay |
| JSON extraction regex | `ocr_to_excel.py::extract_json()` | Strips code fences, extracts JSON from text |
| Error status parsing | `get_error_status()` | Checks attrs + string patterns |
| Excel workbook generation | `ocr_to_excel.py` | Multi-sheet: Summary, Sizes, Raw OCR, Image, Billing |
| Image resize for Excel | `resize_image_for_excel()` | Max 520px width constraint |
| Token counting | `ocr_to_excel.py::count_input_tokens()` | For billing accuracy |
| Billing estimation | Both scripts | Input/output token cost calculation |

### REUSABLE_COMPONENTS
| Component | Path | Purpose |
|-----------|------|---------|
| `get_mime_type()` | All 3 scripts | Safe MIME type detection from Path |
| `get_error_status()` | 2 scripts | Unified error code extraction |
| `get_error_message()` | 2 scripts | Unified error message extraction |
| Excel styling helpers | `ocr_to_excel.py` | `style_header()`, `apply_table_borders()`, `set_columns()` |

### GAPS_DETECTED
| Gap | Severity | Notes |
|-----|----------|-------|
| No test suite | HIGH | Zero pytest/unittest files |
| Hardcoded API key | CRITICAL | Should use environment variable |
| No type checking | MEDIUM | pyright/mypy not configured |
| No linting | MEDIUM | No ruff/flake8/pycodestyle |
| No formatting | MEDIUM | No black/isort |
| No .env.example | MEDIUM | No documented env var pattern |
| No CLI argument parsing | LOW | All paths hardcoded in scripts |
| No logging | LOW | Print statements only |
| No error recovery for 429 | MEDIUM | Only handles 429 in main(), not in billing script |

### CODE_HEALTH
| Metric | Value | Notes |
|--------|-------|-------|
| TypeScript Strict | N/A | Python project |
| Type checking | Not configured | Missing mypy/pyright |
| ESLint | N/A | Python project |
| Linting | Not configured | Missing ruff |
| Formatting | Not configured | Missing black/isort |
| Tests | 0 files | No test coverage |
| Console.logs | N/A | Uses print() for Python |
| TODO/FIXME | 0 found | Clean |
| Hardcoded secrets | 1 (API key repeated 3×) | Security issue |

### ESTIMATED_SIZE
| Metric | Value |
|--------|-------|
| Files | 3 Python scripts |
| LoC | ~558 total (138 + 312 + 108) |
| Components | N/A (scripts, not packages) |
| API Routes | N/A |
| Modules | 3 standalone scripts |

---

## Auto-Answered Requirements (for RRI)
These are obvious from the codebase — skip in requirements interview:

1. **OCR purpose**: Read Vietnamese label text from images
2. **Output formats**: Markdown (ocr_gemini.py), Excel (ocr_to_excel.py)
3. **AI model**: Gemini 2.5 Flash-Lite (cost-optimized for OCR)
4. **Image types**: Supports any image with MIME type (JPEG, PNG, etc.)
5. **Billing tracking**: Token counting for cost estimation
6. **No user auth**: Standalone CLI scripts
7. **No database**: File-based input/output only
8. **No web interface**: Command-line scripts

## Constraints
1. Must use Google Gemini API (API key required)
2. Must process JPEG images (tested with real sample)
3. Excel output must be professional formatting with styled headers
4. Vietnamese language support required (OCR prompt in Vietnamese)
5. Retry on 503 errors (model overload)
6. Stop on 429 errors (quota exceeded — user must resolve)

## Risks / Tech Debt
| Risk | Severity | Mitigation |
|------|----------|------------|
| API key hardcoded | CRITICAL | Migrate to environment variable |
| No tests | HIGH | Add pytest suite before changes |
| No type checking | MEDIUM | Add mypy/pyright |
| Deprecated models | MEDIUM | `gemini-2.0-flash-lite` deprecated 2026-06-01 |
| No dependency pinning | LOW | Add version pins to requirements.txt |

---

## VISION

> Vibecode Kit v5.0 — BƯỚC 3 (VISION)
> Date: 2026-05-05

### PROJECT TYPE: Pattern B (Modified) — Mobile-First SaaS Tool

**What we're building**: A mobile web POC that transforms warehouse invoice scanning from manual data entry into instant OCR capture with structured editing, local storage, and analytics. Workers point their phone camera at cargo box labels, get instant Vietnamese OCR results, edit fields if needed, and export to Excel or share via WhatsApp/Zalo.

**Pattern justification**: Hybrid of Pattern B (SaaS app with auth + core features) and Pattern C (data dashboard with analytics), optimized for mobile-first usage. No traditional "landing page" — goes straight to auth → camera capture workflow.

---

### ARCHITECTURE VISION

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE WEB APP (React SPA)               │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Auth       │  │   Camera     │  │   History    │    │
│  │   (PIN)      │→ │   Capture    │→ │   & Analytics│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         ↓                  ↓                  ↓            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           IndexedDB (Local Storage)                  │ │
│  │  - Auth state                                        │ │
│  │  - Scan records (image + OCR + edits)               │ │
│  │  - Analytics cache                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  Gemini 2.5 Flash-Lite │
              │  (Google AI API)       │
              └────────────────────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  OCR Response (JSON)   │
              │  - Raw text            │
              │  - Structured fields   │
              │  - Confidence scores   │
              └────────────────────────┘
```

**Data Flow**:
1. User authenticates with PIN → stored in localStorage
2. Camera captures image → compressed to <1MB
3. Image sent to Gemini API → returns JSON with structured fields
4. User edits fields → saved to IndexedDB
5. Export: Excel (ExcelJS) / Clipboard / Share API

**Key Architectural Decisions**:
- **Client-side only**: No backend server (POC constraint)
- **IndexedDB**: Persistent local storage for offline viewing
- **API key in env var**: Exposed in browser but better than hardcoded
- **Image compression**: Reduce token cost before API call
- **Retry logic**: Exponential backoff on 503 errors (reuse from Python scripts)

---

### TECH STACK

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Frontend** | React 18 | 18.3+ | Component-based, large ecosystem, team familiarity |
| **Build Tool** | Vite | 5.x | Fast HMR, optimized for SPA |
| **Styling** | Tailwind CSS | 3.x | Utility-first, mobile-first, rapid prototyping |
| **UI Components** | Headless UI | 2.x | Accessible mobile components (dialogs, tabs) |
| **State** | Zustand | 4.x | Lightweight, no boilerplate, good for local state |
| **Storage** | Dexie.js | 4.x | IndexedDB wrapper with React hooks |
| **Camera** | Native getUserMedia | - | Browser API, no library needed |
| **OCR** | Google Gemini API | 2.5-flash-lite | Proven in Python scripts, cost-optimized |
| **Excel Export** | ExcelJS | 4.x | MIT license, matches openpyxl features |
| **Image Compression** | browser-image-compression | 2.x | Client-side compression, reduce API cost |
| **Routing** | React Router | 6.x | Standard SPA routing |
| **Forms** | React Hook Form | 7.x | Performant, minimal re-renders |
| **Icons** | Lucide React | 0.x | Modern, tree-shakeable |
| **Toast** | Sonner | 1.x | Beautiful mobile-friendly toasts |

**Reused from Python Scripts**:
- Gemini API integration patterns
- Error handling (503 retry, 429 stop)
- JSON parsing with regex fallback
- Excel multi-sheet structure
- Token counting for billing

---

### UI VISION

**Theme**: Functional Utility — Clean, fast, warehouse-worker-friendly

**Design Principles**:
1. **Touch-first**: 44px minimum tap targets, generous spacing
2. **High contrast**: Readable in warehouse lighting conditions
3. **Minimal chrome**: Focus on camera viewfinder and data fields
4. **Instant feedback**: Loading states, success/error toasts
5. **No decoration**: Zero gradients, shadows, or animations that slow perception

**Typography**:
- **Heading**: Inter Bold (system fallback: -apple-system, sans-serif)
- **Body**: Inter Regular
- **Monospace** (for OCR text): SF Mono, Consolas, monospace
- **Rationale**: Inter is highly legible on mobile, optimized for UI, Vietnamese diacritics supported

**Colors**:
```css
/* Light mode (primary) */
--primary: #2563EB      /* Blue — trust, action buttons */
--success: #22C55E      /* Green — successful scan */
--warning: #F59E0B      /* Amber — low confidence OCR */
--error: #EF4444        /* Red — API errors, validation */
--neutral: #6B7280      /* Gray — secondary text */
--background: #FFFFFF   /* White — clean canvas */
--surface: #F3F4F6      /* Light gray — cards, inputs */

/* Semantic usage */
--camera-overlay: rgba(0,0,0,0.8)  /* Dark overlay for camera UI */
--field-border: #D1D5DB             /* Input borders */
--text-primary: #111827             /* High contrast text */
--text-secondary: #6B7280           /* Labels, metadata */
```

**Layout Pattern** (Mobile-first, 375px base):
```
┌─────────────────────────┐
│  Header (48px)          │  ← Logo + Logout
├─────────────────────────┤
│                         │
│  Main Content           │  ← Camera / Edit / History
│  (viewport - 48px)      │
│                         │
│                         │
├─────────────────────────┤
│  Bottom Nav (56px)      │  ← Scan / History / Analytics
└─────────────────────────┘
```

**Screen Flows**:
1. **Login** → PIN input (4-6 digits) → Remember me checkbox
2. **Camera** → Viewfinder → Capture button → Preview → Confirm/Retake
3. **OCR Result** → Tabs: [Structured Fields] [Raw Text] → Edit → Save/Export
4. **History** → List (thumbnail + metadata) → Detail view → Re-edit or Export
5. **Analytics** → KPI cards (total scans, today, this week) → Top products list

---

### API DESIGN

**Gemini API Integration**:
```javascript
// Endpoint
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent

// Request
{
  contents: [
    { parts: [{ inline_data: { mime_type: "image/jpeg", data: base64 } }] },
    { parts: [{ text: VIETNAMESE_OCR_PROMPT }] }
  ],
  generationConfig: {
    response_mime_type: "application/json",
    temperature: 0
  }
}

// Response Schema (enforced by prompt)
{
  title: string,
  fields: [
    { field: string, value: string, confidence: "high"|"medium"|"low" }
  ],
  sizes: [
    { size: string, quantity: number }
  ],
  raw_text: string,
  notes: string[]
}
```

**Error Handling**:
- **503 Service Unavailable**: Retry with exponential backoff (2^attempt seconds, max 4 retries)
- **429 Too Many Requests**: Stop, show quota error, suggest waiting
- **400 Bad Request**: Invalid image format or size
- **Network error**: Show offline message, suggest checking connection

**Local Storage Schema** (IndexedDB via Dexie):
```typescript
// Table: scans
{
  id: string (UUID),
  timestamp: Date,
  imageBlob: Blob,
  imageDataUrl: string (for thumbnails),
  ocrRaw: string,
  ocrStructured: {
    title: string,
    fields: Array<{field, value, confidence}>,
    sizes: Array<{size, quantity}>
  },
  edited: boolean,
  tokenUsage: { input: number, output: number, cost: number }
}

// Table: auth
{
  pinHash: string (bcrypt),
  lastLogin: Date,
  sessionExpiry: Date
}

// Table: analytics (cached aggregates)
{
  totalScans: number,
  scansToday: number,
  scansThisWeek: number,
  topProducts: Array<{name, count}>
}
```

---

### MVP SCOPE

#### IN (MVP — Phase 1)

| Domain | Screens | Priority | Estimate |
|--------|---------|----------|----------|
| **Auth** | Login (PIN) | P0 | 4h |
| **Camera** | Capture + Preview | P0 | 8h |
| **OCR** | API integration + parsing | P0 | 6h |
| **Edit** | Structured fields form + Raw text editor | P0 | 10h |
| **Storage** | IndexedDB setup + CRUD | P0 | 6h |
| **Export** | Clipboard + Excel + Share | P0 | 8h |
| **History** | List view + Detail view | P0 | 8h |
| **Analytics** | KPI cards + Top products | P1 | 6h |
| **Search** | Filter by product/date | P1 | 4h |
| **UX** | Loading states + Error toasts + Responsive | P0 | 6h |

**Total MVP Estimate**: ~66 hours (8-9 days for 1 developer)

#### OUT (Post-MVP — Phase 2+)

| Feature | Phase | Rationale |
|---------|-------|-----------|
| Backend API + Database | Phase 2 | POC validates client-side approach first |
| Multi-user + Roles | Phase 2 | Single-user POC sufficient for validation |
| Social login (Google/FB) | Phase 2 | PIN auth sufficient for warehouse use |
| Offline queue (capture without internet) | Phase 2 | Online-only acceptable for POC |
| Dark mode | Phase 2 | Nice-to-have, not critical for warehouse |
| PWA offline caching | Phase 2 | Requires service worker complexity |
| Print functionality | Phase 3 | Low priority, share/export covers use case |
| Bulk operations | Phase 3 | Single-scan workflow is primary |
| Advanced analytics (charts, trends) | Phase 3 | KPI cards sufficient for MVP |
| Image editing (crop, rotate) | Phase 3 | Retake is simpler than in-app editing |
| Multi-language UI | Phase 3 | Vietnamese-only for target users |

---

### KEY DECISIONS

| # | Decision | Rationale | Tradeoffs |
|---|----------|-----------|-----------|
| D-001 | **React SPA (no backend)** | Faster POC development, simpler deployment | API key exposed in browser (acceptable risk for POC) |
| D-002 | **IndexedDB for storage** | Persistent local storage, no server cost | Data not synced across devices (single-device use case) |
| D-003 | **Vite over Create React App** | 10x faster HMR, modern tooling | Slightly different config from CRA (acceptable) |
| D-004 | **Tailwind over CSS-in-JS** | Faster development, smaller bundle, mobile-first utilities | Less dynamic theming (not needed for POC) |
| D-005 | **ExcelJS over SheetJS** | MIT license, better mobile support, matches openpyxl features | Slightly larger bundle (~200KB) vs SheetJS Community |
| D-006 | **Zustand over Redux** | 10x less boilerplate, sufficient for local state | No time-travel debugging (not needed for POC) |
| D-007 | **Dexie over raw IndexedDB** | React hooks, simpler API, better TypeScript support | Extra dependency (~20KB) |
| D-008 | **bcrypt.js for PIN hashing** | Better than plaintext, client-side security | Still vulnerable to browser DevTools (acceptable for POC) |
| D-009 | **browser-image-compression** | Reduce token cost, faster uploads | Extra processing time (~500ms per image) |
| D-010 | **Bottom nav over sidebar** | Mobile-first pattern, thumb-reachable | Less space for nav items (3-4 max) |

---

### CONSTRAINTS & RISKS

**Technical Constraints**:
1. **Camera API requires HTTPS**: Must deploy to HTTPS domain (localhost OK for dev)
2. **IndexedDB quota**: ~50MB on mobile Safari, ~unlimited on Chrome (monitor usage)
3. **API key exposure**: Client-side React exposes key in bundle (document as POC limitation)
4. **No offline OCR**: Gemini API requires internet (acceptable for warehouse with WiFi)
5. **Mobile browser compatibility**: Test on iOS Safari 15+, Chrome Android 100+

**Risks**:
| Risk | Severity | Mitigation |
|------|----------|------------|
| API key abuse | HIGH | Document as POC limitation, add usage monitoring, consider backend proxy for production |
| Quota exhaustion (429 errors) | MEDIUM | Show clear error message, suggest waiting, track daily usage |
| IndexedDB quota exceeded | MEDIUM | Implement 90-day auto-cleanup, manual delete option |
| Poor OCR accuracy on low-quality images | MEDIUM | Add image quality tips, retake option, manual edit fallback |
| Slow image upload on 3G | LOW | Compress images to <1MB, show upload progress |
| Browser compatibility issues | LOW | Test on target devices, provide fallback messages |

---

### DESIGN SYSTEM SUMMARY

**Spacing Scale** (Tailwind defaults):
- `xs`: 4px (tight spacing)
- `sm`: 8px (compact)
- `md`: 16px (default)
- `lg`: 24px (comfortable)
- `xl`: 32px (spacious)

**Touch Targets**:
- Minimum: 44px × 44px (Apple HIG)
- Comfortable: 48px × 48px (Material Design)
- Primary actions: 56px × 56px (FAB-style)

**Breakpoints** (mobile-first):
- Base: 375px (iPhone SE)
- Small: 390px (iPhone 12/13/14)
- Medium: 428px (iPhone 14 Pro Max)
- Tablet: 768px (out of scope for MVP)

**Animation**:
- Transitions: 150ms ease-out (fast feedback)
- Loading spinners: 1s linear infinite
- Toast duration: 3s (success), 5s (error)

---

### QUALITY GATE: Self-Review

✅ **Project type classified**: Pattern B (Modified) — Mobile-First SaaS Tool  
✅ **Tech stack proposed**: React + Vite + Tailwind + Dexie + ExcelJS (with rationale)  
✅ **Architecture vision**: ASCII diagram with data flow  
✅ **MVP scope**: IN table (10 domains, 66h estimate) + OUT table (deferred features)  
✅ **Key decisions**: 10 decisions with rationale + tradeoffs  
✅ **Cross-reference with RRI**: All 44 requirements mapped to MVP scope  
✅ **Cross-reference with Scan**: Reused patterns (retry logic, JSON parsing, Excel format)  
✅ **UI vision**: Typography, colors, layout pattern defined  
✅ **API design**: Gemini integration + error handling + storage schema  
✅ **Constraints & risks**: 5 constraints + 6 risks with mitigation  

⚠️ **Open item**: API key security (Q-001 from RRI) — documented as POC limitation, backend proxy recommended for production

**Confidence**: 90% — Architecture is clear, tech stack validated, main risk (API key exposure) is documented and acceptable for POC scope.

---

*Vision completed: 2026-05-05 | Framework: Vibecode Kit v5.0 | Project: ocr_gemini Mobile Web POC*