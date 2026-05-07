# OCR Gemini Mobile Web POC — Task Graph

> Vibecode Kit v5.0 — BƯỚC 5 (TASK GRAPH)
> 17 TIPs across 5 weeks | Total: 90 hours

---

## DEPENDENCY GRAPH

```
Week 1: Foundation
┌─────────────┐
│  TIP-001    │  Project setup
│  (4h)       │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ↓              ↓              ↓              ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  TIP-002    │ │  TIP-003    │ │  TIP-004    │ │  TIP-005    │
│  Auth       │ │  Layout     │ │  IndexedDB  │ │  Routing    │
│  (6h)       │ │  (4h)       │ │  (6h)       │ │  (4h)       │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
                      ↓
              Week 1 Complete (24h)

Week 2: Core OCR Flow
       ┌──────────────┴──────────────┐
       │                             │
       ↓                             ↓
┌─────────────┐              ┌─────────────┐
│  TIP-006    │              │  TIP-008    │
│  Camera     │              │  Compression│
│  (8h)       │              │  (4h)       │
└──────┬──────┘              └──────┬──────┘
       │                             │
       └──────────────┬──────────────┘
                      ↓
               ┌─────────────┐
               │  TIP-007    │
               │  Gemini API │
               │  (8h)       │
               └──────┬──────┘
                      ↓
               ┌─────────────┐
               │  TIP-009    │
               │  OCR Display│
               │  (6h)       │
               └──────┬──────┘
                      ↓
              Week 2 Complete (26h)

Week 3: Editing & Export
       ┌──────────────┴──────────────┐
       │                             │
       ↓                             ↓
┌─────────────┐              ┌─────────────┐
│  TIP-010    │              │  TIP-011    │
│  Edit Fields│              │  Edit Text  │
│  (6h)       │              │  (4h)       │
└──────┬──────┘              └──────┬──────┘
       │                             │
       └──────────────┬──────────────┘
                      ↓
               ┌─────────────┐
               │  TIP-012    │
               │  Excel      │
               │  (6h)       │
               └──────┬──────┘
                      ↓
              Week 3 Complete (16h)

Week 4: History & Analytics
       ┌──────────────┴──────────────┐
       │                             │
       ↓                             ↓
┌─────────────┐              ┌─────────────┐
│  TIP-013    │              │  TIP-015    │
│  History    │              │  Analytics  │
│  List       │              │  (6h)       │
│  (6h)       │              └─────────────┘
└──────┬──────┘
       ↓
┌─────────────┐
│  TIP-014    │
│  History    │
│  Detail     │
│  (4h)       │
└──────┬──────┘
       │
       ↓
Week 4 Complete (16h)

Week 5: Polish & Testing
       ┌──────────────┴──────────────┐
       │                             │
       ↓                             ↓
┌─────────────┐              ┌─────────────┐
│  TIP-016    │              │  TIP-017    │
│  Export     │              │  Loading &  │
│  Actions    │              │  Errors     │
│  (4h)       │              │  (4h)       │
└─────────────┘              └─────────────┘
       │                             │
       └──────────────┬──────────────┘
                      ↓
              Week 5 Complete (8h)
                      ↓
                 MVP READY
```

---

## TIP SUMMARY TABLE

| TIP | Name | Depends On | Priority | Est. Hours | Week | Status |
|-----|------|-----------|----------|-----------|------|--------|
| TIP-001 | Project setup + folder structure | - | P0 | 4 | 1 | READY |
| TIP-002 | Auth system (PIN login + logout) | TIP-001 | P0 | 6 | 1 | READY |
| TIP-003 | Layout components (Header + BottomNav) | TIP-001 | P0 | 4 | 1 | READY |
| TIP-004 | IndexedDB setup + CRUD operations | TIP-001 | P0 | 6 | 1 | READY |
| TIP-005 | Routing + protected routes | TIP-001, TIP-002 | P0 | 4 | 1 | READY |
| TIP-006 | Camera capture + preview | TIP-001, TIP-003, TIP-005 | P0 | 8 | 2 | READY |
| TIP-007 | Gemini API integration + retry logic | TIP-001, TIP-006, TIP-008 | P0 | 8 | 2 | READY |
| TIP-008 | Image compression | TIP-001 | P0 | 4 | 2 | READY |
| TIP-009 | OCR result display (structured fields) | TIP-007 | P0 | 6 | 2 | READY |
| TIP-010 | Edit structured fields form | TIP-009, TIP-004 | P0 | 6 | 3 | READY |
| TIP-011 | Edit raw text + size table | TIP-009, TIP-004 | P0 | 4 | 3 | READY |
| TIP-012 | Excel export (ExcelJS) | TIP-010, TIP-011 | P0 | 6 | 3 | READY |
| TIP-013 | History list view + search | TIP-004, TIP-005 | P0 | 6 | 4 | READY |
| TIP-014 | History detail view | TIP-013, TIP-010 | P0 | 4 | 4 | READY |
| TIP-015 | Analytics dashboard (KPI + top products) | TIP-004, TIP-005 | P1 | 6 | 4 | READY |
| TIP-016 | Export actions (clipboard + share) | TIP-010, TIP-012 | P0 | 4 | 5 | READY |
| TIP-017 | Loading states + error handling | All above | P0 | 4 | 5 | READY |
| TIP-018 | Vercel deployment | TIP-017 | P1 | 1 | 6 | READY |
| TIP-019 | OpenRouter migration | TIP-007 | P0 | 2 | 6 | DONE |
| TIP-020 | OCR performance optimization | TIP-019 | P1 | 4 | 6 | DONE |
| TIP-021 | Fix BottomNav bug | TIP-003 | P1 | 1 | 6 | DONE |
| TIP-022 | Ultra-fast OCR pipeline | TIP-020 | P1 | 4 | 6 | DONE |
| TIP-023 | UI redesign (mobile-first) | TIP-021 | P2 | 4 | 6 | DONE |
| TIP-024 | Fix search bug in history | TIP-013 | P1 | 1 | 6 | DONE |
| TIP-025 | Fix header + action buttons UI | TIP-023 | P2 | 1 | 6 | DONE |
| TIP-026 | Move Excel export to History (multi-select) | TIP-013 | P2 | 4 | 6 | READY |
| TIP-037 | Settings page - Model selector (Free/Default/High) | TIP-004, TIP-005 | P1 | 6-8 | 7 | READY |
| TIP-038 | Field categorization - Main vs Other | TIP-009, TIP-010 | P1 | 4-6 | 7 | READY |
| TIP-039 | Fix Excel export share error on mobile | TIP-012 | P1 | 1 | 7 | READY |
| TIP-040 | Fix multi-select Excel export not working | TIP-026 | P1 | 1 | 7 | READY |
| TIP-041 | Scan display name - product_name priority | TIP-038 | P1 | 2 | 7 | DONE |
| TIP-042 | Enhanced search, filter, sort, view modes | TIP-013, TIP-041 | P1 | 6-8 | 7 | DONE |
| TIP-044 | Design Tokens & Common UI Components | TIP-042 | P1 | 4-6 | 8 | READY |
| TIP-045 | Auth Flow (Login/Register/Forgot) | TIP-044 | P1 | 6-8 | 8 | READY |
| TIP-046 | Layout Components (Header/Nav) | TIP-044 | P1 | 2-4 | 8 | READY |
| TIP-047 | OCR & History Screens Redesign | TIP-046 | P1 | 8-10 | 8 | READY |
| TIP-048 | Analytics & Settings Screens Redesign | TIP-046 | P2 | 4-6 | 8 | READY |

**Legend**:
- **TBD**: To be done
- **WIP**: Work in progress
- **DONE**: Completed
- **BLOCKED**: Waiting on dependency or clarification

---

## PARALLELIZATION OPPORTUNITIES

### Week 1 (after TIP-001 complete):
**Parallel tracks** (can be done simultaneously by different developers or in any order):
- Track A: TIP-002 (Auth) → 6h
- Track B: TIP-003 (Layout) → 4h
- Track C: TIP-004 (IndexedDB) → 6h

Then: TIP-005 (Routing) requires TIP-002 complete → 4h

**Total Week 1**: 24h sequential, or ~12h with 2 developers

### Week 2 (after Week 1 complete):
**Parallel tracks**:
- Track A: TIP-006 (Camera) → 8h
- Track B: TIP-008 (Compression) → 4h

Then sequential:
- TIP-007 (Gemini API) requires both → 8h
- TIP-009 (OCR Display) requires TIP-007 → 6h

**Total Week 2**: 26h sequential, or ~18h with 2 developers

### Week 3 (after Week 2 complete):
**Parallel tracks**:
- Track A: TIP-010 (Edit Fields) → 6h
- Track B: TIP-011 (Edit Text) → 4h

Then: TIP-012 (Excel) requires both → 6h

**Total Week 3**: 16h sequential, or ~12h with 2 developers

### Week 4 (after Week 3 complete):
**Parallel tracks**:
- Track A: TIP-013 (History List) → TIP-014 (History Detail) → 10h
- Track B: TIP-015 (Analytics) → 6h

**Total Week 4**: 16h sequential, or ~10h with 2 developers

### Week 5 (after Week 4 complete):
**Parallel tracks**:
- Track A: TIP-016 (Export Actions) → 4h
- Track B: TIP-017 (Loading & Errors) → 4h

**Total Week 5**: 8h sequential, or ~4h with 2 developers

---

## CRITICAL PATH

The **critical path** (longest dependency chain) determines minimum project duration:

```
TIP-001 (4h)
  ↓
TIP-002 (6h)
  ↓
TIP-005 (4h)
  ↓
TIP-006 (8h)
  ↓
TIP-008 (4h)
  ↓
TIP-007 (8h)
  ↓
TIP-009 (6h)
  ↓
TIP-010 (6h)
  ↓
TIP-012 (6h)
  ↓
TIP-016 (4h)
  ↓
TIP-017 (4h)

Total: 60 hours (critical path)
```

**Minimum duration**: 60 hours (7.5 days for 1 developer working 8h/day)

**With parallelization**: ~50 hours (6-7 days with 2 developers)

---

## TEAM ALLOCATION (if applicable)

### Single Developer (90h total):
- Follow week-by-week order
- Complete all TIPs in sequence
- Duration: 11-12 days (8h/day)

### Two Developers (50-60h total):
**Developer A** (Frontend focus):
- Week 1: TIP-001, TIP-002, TIP-005 (14h)
- Week 2: TIP-006, TIP-007, TIP-009 (22h)
- Week 3: TIP-010, TIP-012 (12h)
- Week 4: TIP-013, TIP-014 (10h)
- Week 5: TIP-016 (4h)
**Total**: 62h

**Developer B** (Infrastructure focus):
- Week 1: TIP-003, TIP-004 (10h)
- Week 2: TIP-008 (4h)
- Week 3: TIP-011 (4h)
- Week 4: TIP-015 (6h)
- Week 5: TIP-017 (4h)
**Total**: 28h

**Duration**: 6-7 days with 2 developers

---

## MILESTONE CHECKPOINTS

### Milestone 1: Foundation Complete (End of Week 1)
**Deliverable**: Auth + Layout + Storage + Routing working
**Demo**: User can login with PIN, see empty app shell with bottom nav

### Milestone 2: Core OCR Flow (End of Week 2)
**Deliverable**: Camera → Gemini API → Display OCR results
**Demo**: User can capture image, see OCR results (structured + raw text)

### Milestone 3: Editing & Export (End of Week 3)
**Deliverable**: Edit fields + Export to Excel
**Demo**: User can edit OCR results, export to Excel file

### Milestone 4: History & Analytics (End of Week 4)
**Deliverable**: View past scans + analytics dashboard
**Demo**: User can browse history, see scan statistics

### Milestone 5: MVP Complete (End of Week 5)
**Deliverable**: All P0 features + polish
**Demo**: Full end-to-end flow with loading states and error handling

---

## RISK MITIGATION

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| Gemini API quota exhaustion | HIGH | Monitor usage, implement rate limiting | Add backend proxy (out of scope for POC) |
| Camera API not working on iOS Safari | HIGH | Test early (TIP-006), use polyfills | Fallback to file upload input |
| IndexedDB quota exceeded | MEDIUM | Implement 90-day cleanup (TIP-004) | Warn user, manual delete |
| Excel export too slow on mobile | MEDIUM | Test with real data (TIP-012) | Simplify sheet structure |
| Poor OCR accuracy | MEDIUM | Add retake option (TIP-006) | Manual edit fallback (TIP-010) |
| TypeScript compilation errors | LOW | Fix incrementally per TIP | Pair programming session |

---

## TESTING STRATEGY

### Per-TIP Testing (Builder responsibility):
- Unit tests: Not required for POC (time constraint)
- Manual testing: Required for all acceptance criteria
- Browser testing: Chrome Android + iOS Safari
- Viewport testing: 375px, 390px, 428px

### Integration Testing (End of each week):
- Smoke test: Full user flow from login → scan → export
- Regression test: Previous week's features still work
- Performance test: Check bundle size, FCP, TTI

### UAT (End of Week 5):
- Real warehouse worker testing
- Real invoice images
- Real mobile devices (not just DevTools)

---

## COMPLETION CRITERIA

### MVP is complete when:
- [ ] All 17 TIPs marked as DONE
- [ ] All P0 acceptance criteria pass
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] Bundle size < 500KB gzipped
- [ ] FCP < 1.5s, TTI < 3s
- [ ] Tested on iOS Safari + Chrome Android
- [ ] README.md with setup instructions
- [ ] .env.example with required variables
- [ ] Git repository with clean commit history

---

## NEXT STEPS

1. **Builder**: Start with TIP-001 (Project setup)
2. **Architect**: Generate TIP-001 file using `/vibecode:tip TIP-001`
3. **Builder**: Implement TIP-001, return Completion Report
4. **Architect**: Review report, generate next TIP
5. **Repeat** until all 17 TIPs complete

---

*Task Graph v1.0 | Generated: 2026-05-05 | Framework: Vibecode Kit v5.0*