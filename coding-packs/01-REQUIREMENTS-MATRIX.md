# OCR Gemini Mobile Web POC — Requirements Matrix (RRI Report)

> Vibecode Kit v5.0 — BƯỚC 2 (RRI) Output
> Date: 2026-05-05
> Interview Duration: ~6 questions (P0 focus)

---

## PROJECT SUMMARY

**Vision**: Mobile web POC for scanning invoices on cargo boxes using phone camera + Gemini 2.5 Flash-Lite OCR

**Transformation**: Python CLI scripts → React mobile web app with camera, structured data editing, local storage, and analytics

---

## REQUIREMENTS MATRIX

### Domain 1: Camera & Image Capture
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-001 | Camera access via browser (getUserMedia API) | P0 | Mobile User | TBD |
| REQ-002 | Capture photo from camera stream | P0 | Mobile User | TBD |
| REQ-003 | Preview captured image before OCR | P1 | Mobile User | TBD |
| REQ-004 | Retake photo if quality is poor | P1 | Mobile User | TBD |
| REQ-005 | Support JPEG/PNG image formats | P0 | System | TBD |

### Domain 2: OCR Processing
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-006 | Call Gemini 2.5 Flash-Lite API from browser | P0 | System | TBD |
| REQ-007 | Parse OCR response into structured fields (Contract No, Product Name, Item Code, CT No, Made In, Sizes) | P0 | System | TBD |
| REQ-008 | Display raw OCR text | P0 | Mobile User | TBD |
| REQ-009 | Display structured fields in editable form | P0 | Mobile User | TBD |
| REQ-010 | Retry on 503 errors with exponential backoff | P0 | System | TBD |
| REQ-011 | Handle 429 quota errors gracefully | P0 | System | TBD |
| REQ-012 | Vietnamese language support in OCR prompt | P0 | System | TBD |

### Domain 3: Data Editing
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-013 | Edit raw OCR text inline | P0 | Mobile User | TBD |
| REQ-014 | Edit structured fields (text inputs) | P0 | Mobile User | TBD |
| REQ-015 | Edit size/quantity table (add/remove rows) | P0 | Mobile User | TBD |
| REQ-016 | Save edited data to local storage | P0 | Mobile User | TBD |
| REQ-017 | Validation: required fields must not be empty | P1 | System | TBD |

### Domain 4: Data Export
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-018 | Copy OCR text to clipboard | P0 | Mobile User | TBD |
| REQ-019 | Export to Excel file (multi-sheet: Summary, Sizes, Raw OCR, Image, Billing) | P0 | Mobile User | TBD |
| REQ-020 | Share via native share API (WhatsApp, Zalo, Email) | P0 | Mobile User | TBD |
| REQ-021 | Excel export must match existing Python script format | P0 | System | TBD |

### Domain 5: Authentication
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-022 | Simple PIN/password login screen | P0 | Mobile User | TBD |
| REQ-023 | Store auth state in localStorage | P0 | System | TBD |
| REQ-024 | Logout functionality | P1 | Mobile User | TBD |
| REQ-025 | Session timeout after 24 hours | P2 | System | TBD |

### Domain 6: History & Analytics
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-026 | Store all scan records in IndexedDB | P0 | System | TBD |
| REQ-027 | History list view: thumbnail + date + product name | P0 | Mobile User | TBD |
| REQ-028 | View detail of past scan (read-only or re-edit) | P0 | Mobile User | TBD |
| REQ-029 | Search history by product name, contract no, date | P1 | Mobile User | TBD |
| REQ-030 | Filter history by date range | P1 | Mobile User | TBD |
| REQ-031 | Analytics dashboard: total scans, scans per day, top products | P1 | Mobile User | TBD |
| REQ-032 | Delete individual scan record | P2 | Mobile User | TBD |
| REQ-033 | Bulk delete old records | P2 | Mobile User | TBD |

### Domain 7: Mobile UX
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-034 | Responsive design for mobile screens (320px-428px) | P0 | Mobile User | TBD |
| REQ-035 | Touch-friendly buttons (min 44px tap target) | P0 | Mobile User | TBD |
| REQ-036 | Loading spinner during OCR processing | P0 | Mobile User | TBD |
| REQ-037 | Error toast notifications | P0 | Mobile User | TBD |
| REQ-038 | PWA manifest for "Add to Home Screen" | P1 | Mobile User | TBD |
| REQ-039 | Dark mode support | P2 | Mobile User | TBD |

### Domain 8: Security & Performance
| REQ-ID | Requirement | Priority | Persona | TIP |
|--------|------------|----------|---------|-----|
| REQ-040 | API key stored in environment variable (not hardcoded) | P0 | System | TBD |
| REQ-041 | HTTPS required for camera access | P0 | System | TBD |
| REQ-042 | Image compression before sending to Gemini API | P1 | System | TBD |
| REQ-043 | Token usage tracking for billing estimation | P1 | System | TBD |
| REQ-044 | Limit image size to 5MB max | P1 | System | TBD |

---

## AUTO-ANSWERED (from Scan Report)

These requirements were already validated in existing Python scripts:

1. ✅ **AI Model**: Gemini 2.5 Flash-Lite (cost-optimized, proven in scripts)
2. ✅ **OCR Language**: Vietnamese label text support
3. ✅ **Image Formats**: JPEG/PNG via MIME detection
4. ✅ **Error Handling**: Retry on 503, stop on 429
5. ✅ **Billing Tracking**: Token counting logic exists
6. ✅ **Excel Format**: Multi-sheet structure already defined
7. ✅ **Structured Fields**: Contract No, Product Name, Item Code, CT No, Made In, Sizes
8. ✅ **JSON Parsing**: Regex-based extraction from Gemini response

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet. Consider running `/vibecode:scan --standards` after initial implementation to capture patterns.

---

## DECISIONS LOG

| # | Decision | Options | Chosen | Rationale |
|---|----------|---------|--------|-----------|
| D-001 | Frontend framework | React / Next.js / Vue | **React SPA** | Client-side only, simpler deployment for POC |
| D-002 | Data storage | Session-only / Local / Server / Hybrid | **Local (IndexedDB)** | No backend needed, offline-capable storage |
| D-003 | Authentication | None / PIN / Social / Multi-user | **Simple PIN/password** | Basic access control without OAuth complexity |
| D-004 | Export formats | Clipboard / Excel / Share / Print | **Clipboard + Excel + Share** | Match existing script + mobile sharing |
| D-005 | History scope | None / Recent / Full / Analytics | **Full history + analytics** | Business value in tracking scan patterns |
| D-006 | Offline support | Online-only / Queue / Full offline | **Online-only** | Gemini API requires internet, acceptable for POC |
| D-007 | API key security | Hardcoded / Env var / Backend proxy | **Env var (client-side)** | Better than hardcoded, but note: still exposed in browser |

---

## OPEN QUESTIONS

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| Q-001 | API key exposure risk: client-side React exposes API key in browser. Is this acceptable for POC? | HIGH | **Option A**: Accept risk for POC, document limitation. **Option B**: Add lightweight backend proxy (Node.js/Cloudflare Worker) to hide key. |
| Q-002 | Excel export in browser: need library like ExcelJS or SheetJS. Which one? | MEDIUM | **Recommend ExcelJS** (MIT license, good mobile support, matches openpyxl features) |
| Q-003 | Image compression: compress before upload to reduce token cost? | MEDIUM | **Recommend browser-image-compression** library, target 1024px max width |
| Q-004 | Analytics storage: how long to keep history? | LOW | **Suggest 90 days** default, with manual delete option |
| Q-005 | PIN storage: hash PIN or store plaintext in localStorage? | MEDIUM | **Hash with bcrypt.js** for basic security (still client-side, but better than plaintext) |

---

## SCOPE BOUNDARIES

### ✅ In Scope (MVP)
- Mobile web app (React SPA)
- Camera capture + preview
- Gemini 2.5 Flash-Lite OCR
- Display raw text + structured fields
- Edit both text and fields
- Save to IndexedDB
- History list + detail view
- Search/filter history
- Analytics dashboard (scan count, top products)
- Export: clipboard, Excel, share
- Simple PIN auth
- Responsive mobile UI
- Loading states + error handling

### ❌ Out of Scope (defer to v2)
- Backend API / database
- Multi-user with roles
- Social login (Google/Facebook)
- Offline queue (capture without internet)
- Print functionality
- Dark mode
- PWA offline caching
- Bulk operations (bulk delete, bulk export)
- Advanced analytics (charts, trends)
- Image editing (crop, rotate, filters)
- Multi-language UI (Vietnamese only for now)
- Desktop optimization (mobile-first only)

---

## PERSONAS

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Mobile User** | Warehouse worker scanning invoice labels on cargo boxes | Fast capture, accurate OCR, easy editing, quick export |
| **System** | Technical requirements for reliability and security | Error handling, data persistence, API integration |

---

## CONFIDENCE SCORE

**P0 Requirements Confidence**: 95%  
**P1 Requirements Confidence**: 85%  
**P2 Requirements Confidence**: 70%

**Rationale**: Core OCR flow is well-understood from existing scripts. Main unknowns are mobile UX patterns and client-side API key security tradeoff.

---

## NEXT STEPS

1. **Resolve Q-001** (API key security) before blueprint
2. Run `/vibecode:vision` to create architecture vision
3. Run `/vibecode:blueprint` to design component structure
4. Run `/vibecode:tip` to generate implementation tasks

---

## Quality Gate: Self-Review

✅ **Completeness**: 44 requirements across 8 domains  
✅ **Cross-reference**: Consistent with Scan Report (reused patterns, constraints, tech stack)  
✅ **Auto-answered**: 8 items from scan report  
✅ **Applicable Standards**: None (no standards directory exists)  
✅ **Decisions**: 7 key decisions logged with rationale  
✅ **Open Questions**: 5 questions flagged (1 HIGH priority)  
✅ **Scope Boundaries**: Clear MVP vs. deferred features  
✅ **Personas**: 2 personas defined  
⚠️ **Gap**: API key security (Q-001) needs resolution before implementation

**Action needed**: User must decide on API key security approach (accept risk vs. add backend proxy) before proceeding to blueprint.

---

*Interview completed: 2026-05-05 | Framework: Vibecode Kit v5.0 | Project: ocr_gemini Mobile Web POC*