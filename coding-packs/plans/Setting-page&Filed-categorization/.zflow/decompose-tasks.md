# DECOMPOSE Phase: Task Breakdown

## Implementation Order

### Phase 1: Database Schema & Core Logic (Foundation)
**Duration**: 1-2 hours  
**Parallel**: Can be done independently

#### Task 1.1: Update Database Schema
- **File**: `src/db/schema.ts`
- **Changes**:
  - Add `AppSettings` interface
  - Add `settings` table to Dexie
  - Add `category: 'main' | 'other'` to `OCRField`
  - Add `modelTier: 'free' | 'default' | 'high'` to `ScanRecord`
  - Bump Dexie version to 2
- **Test**: Schema migration works, no data loss

#### Task 1.2: Create Model Configuration
- **File**: `src/lib/models.ts` (new)
- **Content**:
  - `ModelConfig` interface
  - `MODEL_CONFIGS` object with 3 tiers
  - Export model pricing and prompts
- **Test**: Model configs are valid, pricing matches OpenRouter

#### Task 1.3: Create Field Categorization Logic
- **File**: `src/lib/fieldCategories.ts` (new)
- **Content**:
  - `MAIN_FIELD_PATTERNS` regex array
  - `categorizeField()` function
  - `categorizeFields()` batch function
- **Test**: All main field patterns match correctly (Vietnamese + English)

---

### Phase 2: Hooks & State Management
**Duration**: 1 hour  
**Depends on**: Phase 1 complete

#### Task 2.1: Create Settings Hook
- **File**: `src/hooks/useSettings.ts` (new)
- **Content**:
  - `useSettings()` hook for CRUD operations
  - Load settings from IndexedDB
  - Save settings with optimistic updates
  - Default to 'default' tier if not set
- **Test**: Settings persist across page reloads

#### Task 2.2: Update Gemini API Integration
- **File**: `src/lib/gemini.ts`
- **Changes**:
  - Import `MODEL_CONFIGS` from `models.ts`
  - Load selected tier from IndexedDB
  - Use tier's model and prompt
  - Update `processOCR()` to accept optional tier override
- **Test**: API calls use correct model based on selected tier

---

### Phase 3: Settings Page UI
**Duration**: 2-3 hours  
**Depends on**: Phase 2 complete

#### Task 3.1: Create Settings Page Component
- **File**: `src/pages/SettingsPage.tsx` (new)
- **Content**:
  - Model tier radio buttons (3 options)
  - Token usage statistics table
  - Model details cards (expandable)
  - Save confirmation toast
- **Test**: UI renders correctly, radio selection works

#### Task 3.2: Add Settings Route
- **File**: `src/App.tsx`
- **Changes**:
  - Add `/settings` route
  - Protected route (requires auth)
- **Test**: Route navigation works

#### Task 3.3: Add Settings Link to Navigation (Optional)
- **File**: `src/components/layout/BottomNav.tsx` or Header
- **Changes**:
  - Add Settings icon/link
- **Test**: Navigation link works

---

### Phase 4: Field Categorization UI Updates
**Duration**: 2-3 hours  
**Depends on**: Phase 1.3 complete

#### Task 4.1: Update OCR Result Display
- **File**: `src/pages/OCRResultPage.tsx`
- **Changes**:
  - Categorize fields on load
  - Render "Thông tin chính" section (main fields)
  - Render "Thông tin khác" section (other fields, collapsible)
  - Add expand/collapse state
- **Test**: Fields display in correct sections

#### Task 4.2: Update Edit Page
- **File**: `src/pages/EditPage.tsx`
- **Changes**:
  - Group fields by category
  - Main fields: larger inputs, always visible
  - Other fields: smaller inputs, collapsible
  - Preserve categories on save
- **Test**: Edit form displays categories correctly

#### Task 4.3: Update History Detail Page
- **File**: `src/pages/HistoryDetailPage.tsx`
- **Changes**:
  - Display fields with categories
  - Same UI pattern as OCRResultPage
- **Test**: Detail view shows categories

#### Task 4.4: Update OCR Prompt
- **File**: `src/lib/gemini.ts`
- **Changes**:
  - Update `OCR_PROMPT` to prioritize main fields
  - Add Vietnamese field names to prompt
- **Test**: OCR results prioritize main fields

---

### Phase 5: Analytics Integration (Optional Enhancement)
**Duration**: 1 hour  
**Depends on**: Phase 2 complete

#### Task 5.1: Update Analytics Page
- **File**: `src/pages/AnalyticsPage.tsx`
- **Changes**:
  - Add per-tier statistics section
  - Show scans count per tier
  - Show average cost per tier
- **Test**: Analytics display tier breakdown

---

## Dependency Graph

```
Phase 1 (Foundation)
├─ Task 1.1: DB Schema ────────┐
├─ Task 1.2: Model Config ─────┤
└─ Task 1.3: Field Categories ─┤
                               │
                               ↓
Phase 2 (Hooks & API)          │
├─ Task 2.1: Settings Hook ────┤
└─ Task 2.2: Gemini API ───────┤
                               │
                               ↓
Phase 3 (Settings UI) ─────────┤
├─ Task 3.1: Settings Page     │
├─ Task 3.2: Add Route         │
└─ Task 3.3: Nav Link          │
                               │
Phase 4 (Field UI) ────────────┘
├─ Task 4.1: OCR Result
├─ Task 4.2: Edit Page
├─ Task 4.3: Detail Page
└─ Task 4.4: OCR Prompt

Phase 5 (Analytics) [Optional]
└─ Task 5.1: Analytics Update
```

## Critical Path

**Longest dependency chain**: 
1. DB Schema (1h)
2. Settings Hook (0.5h)
3. Settings Page (2h)
4. Field Categories (0.5h)
5. Field UI Updates (2h)

**Total Critical Path**: ~6 hours

## Parallelization Opportunities

- **Phase 1**: All 3 tasks can run in parallel (1-2h total)
- **Phase 3 & 4**: Can run in parallel after Phase 2 (2-3h total)

**Optimized Duration**: ~4-5 hours with parallelization

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dexie migration breaks existing data | HIGH | Test migration thoroughly, add version upgrade handler |
| Field pattern matching misses Vietnamese variants | MEDIUM | Comprehensive regex testing, add more patterns if needed |
| Settings page performance with large scan history | LOW | Aggregate stats in background, cache results |
| Model tier selection doesn't apply to new scans | HIGH | Integration test to verify tier is used |

---

*DECOMPOSE phase complete | Ready for EXECUTE*
