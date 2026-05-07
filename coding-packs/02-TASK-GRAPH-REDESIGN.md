# OCR Gemini UI/UX Redesign — Task Graph

> Vibecode Kit v5.0 — BƯỚC 7 (BLUEPRINT) / BƯỚC 8 (TASK GRAPH)
> 10 TIPs across 3 weeks | Total: ~14 hours
> Scope: UI/UX Redesign only (no architecture changes)

---

## SCOPE SUMMARY

This is a **visual redesign only** project. Core functionality remains unchanged:
- ❌ No new features
- ❌ No OCR logic changes
- ❌ No data layer modifications
- ✅ New design tokens in Tailwind
- ✅ Redesigned components matching UI Spec
- ✅ New components: StatusBar, HistoryCard, KPICard, FloatingActionBar
- ✅ Removed: Confidence badges ("Cao/Trung bình/Thấp")

---

## DEPENDENCY GRAPH

```
Week 1: Foundation + Camera
┌─────────────┐
│  TIP-027   │  Extend Tailwind config (design tokens)
│  (1h)      │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       ↓                  ↓                  ↓
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  TIP-028   │   │  TIP-030   │   │  TIP-033   │  ← Can parallelize
│  StatusBar │   │  HistoryCard│   │  KPICard   │
│  (1h)      │   │  (2h)      │   │  (1h)      │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                  │                  │
       ↓                  │                  │
┌─────────────┐           │                  │
│  TIP-029   │           │                  │  ← Can parallelize
│  Camera    │           │                  │
│  Redesign │           │                  │
│  (4h)      │           │                  │
└─────────────┘           │                  │
       │                  │                  │
       └────────┬─────────┘                  │
                │                           │
                ↓                           ↓
         ┌─────────────┐             ┌─────────────┐
         │  TIP-031   │             │  TIP-034   │
         │  History   │             │  Analytics │
         │  Redesign │             │  Redesign  │
         │  (4h)      │             │  (2h)      │
         └──────┬──────┘             └──────┬──────┘
                │                           │
                └──────────┬─────────────────┘
                           │
                           ↓
                    ┌─────────────┐
                    │  TIP-032   │
                    │  Detail    │
                    │  Redesign  │
                    │  (2h)      │
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
                    │  TIP-035   │
                    │  BottomNav │
                    │  Update    │
                    │  (1h)      │
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
                    │  TIP-036   │
                    │  UI Polish │
                    │  (1h)      │
                    └─────────────┘
                           │
                           ↓
                      COMPLETE
```

---

## TIP SUMMARY TABLE

| TIP | Name | Depends On | Priority | Est. Hours | Week | Status |
|-----|------|-----------|----------|-----------|------|--------|
| **Foundation** |
| TIP-027 | Extend Tailwind config (design tokens) | - | P0 | 1 | 1 | READY |
| **Components** |
| TIP-028 | Create StatusBar component | TIP-027 | P0 | 1 | 1 | READY |
| TIP-030 | Create HistoryCard component | TIP-027 | P0 | 2 | 1 | READY |
| TIP-033 | Create KPICard component | TIP-027 | P0 | 1 | 1 | READY |
| **Screens** |
| TIP-029 | Redesign Camera page (HUD style) | TIP-028 | P0 | 4 | 1 | READY |
| TIP-031 | Redesign HistoryPage (multi-select + batch export) | TIP-030 | P0 | 4 | 2 | READY |
| TIP-032 | Redesign OCRResultPage (light mode cards) | TIP-027 | P0 | 2 | 2 | READY |
| TIP-034 | Redesign AnalyticsPage (dark mode + date tabs) | TIP-033 | P0 | 2 | 2 | READY |
| **Polish** |
| TIP-035 | Update BottomNav styling | TIP-027 | P0 | 1 | 3 | READY |
| TIP-036 | Update UI components (Skeleton, Toast) | TIP-027 | P1 | 1 | 3 | READY |

**TIP Files**: All 10 TIPs created in `tips/` folder

**TIP Files**: All 10 TIPs created in `tips/` folder

**Total: 15 hours** (vs. initial estimate of 14h)

---

## PARALLELIZATION OPPORTUNITIES

### After TIP-027 (Foundation):
**All these can run in parallel:**
- TIP-028 (StatusBar) → 1h
- TIP-030 (HistoryCard) → 2h
- TIP-033 (KPICard) → 1h

**Then sequential:**
- TIP-029 (Camera) requires TIP-028 → 4h
- TIP-031 (History) requires TIP-030 → 4h
- TIP-034 (Analytics) requires TIP-033 → 2h

**Then:**
- TIP-032 (Detail) independent → 2h
- TIP-035 (BottomNav) independent → 1h
- TIP-036 (UI Polish) independent → 1h

---

## COMPONENT FILE MAPPING

| Component | File Path | TIP | Purpose |
|-----------|----------|-----|---------|
| **New Components** |
| StatusBar | `src/components/ui/StatusBar.tsx` | TIP-028 | Semi-transparent status bar for mobile |
| HistoryCard | `src/components/history/HistoryCard.tsx` | TIP-030 | Scan card with thumbnail, title, date |
| KPICard | `src/components/analytics/KPICard.tsx` | TIP-033 | Analytics KPI card with icon + value |
| **New Files** |
| Design Tokens | `tailwind.config.js` | TIP-027 | Extend with colors from ui-spec |
| **Modified Files** |
| CameraView | `src/components/camera/CameraView.tsx` | TIP-029 | HUD-style viewfinder |
| OCRPage | `src/pages/OCRPage.tsx` | TIP-029 | Camera page wrapper |
| HistoryPage | `src/pages/HistoryPage.tsx` | TIP-031 | Multi-select + batch export |
| OCRResultPage | `src/pages/OCRResultPage.tsx` | TIP-032 | Light mode cards, fixed actions |
| AnalyticsPage | `src/pages/AnalyticsPage.tsx` | TIP-034 | Dark mode dashboard |
| BottomNav | `src/components/layout/BottomNav.tsx` | TIP-035 | Updated styling |
| SkeletonCard | `src/components/ui/SkeletonCard.tsx` | TIP-036 | Theme updates |
| Toast | `src/components/ui/Toast.tsx` | TIP-036 | Theme updates |

---

## DESIGN SYSTEM COMPLIANCE

### Colors (must use these exact values):
```css
--primary: #2563EB;
--success: #22C55E;
--error: #EF4444;
--warning: #FFFBEB;
--slate-900: #0F172A;
--slate-800: #1E293B;
--surface: #F8FAFC;
--card: #FFFFFF;
--border: #E2E8F0;
--text: #111827;
--muted: #64748B;
```

### Typography:
- Heading: Funnel Sans (or system geometric sans)
- Body: Geist (or system sans)
- Base: 16px

### Touch Targets:
- Minimum: 48px × 48px
- Primary actions: 56px × 56px

### Spacing:
- Card padding: 16px
- Card border-radius: 12px
- Card shadow: `0 8px 18px -8px rgba(15,23,42,0.08)`

---

## REMOVED ELEMENTS

These must be removed from all components:
1. ❌ Confidence badges ("Cao/Trung bình/Thấp")
2. ❌ "Độ tin cậy TB" KPI in Analytics
3. ❌ Header action buttons floating awkwardly (position: relative)

---

## VERIFICATION CHECKLIST

For each TIP, verify:
- [ ] Design tokens applied (check color values)
- [ ] Touch targets ≥ 48px
- [ ] No inline styles
- [ ] No confidence badges
- [ ] Matches ui-spec.md layout
- [ ] Dark mode where specified (Camera, History, Analytics)
- [ ] Light mode where specified (Detail, Edit)

---

## NEXT STEPS

1. **Generate TIPs**: Use `/vibecode:tip [task]` for each TIP listed above
2. **Start Implementation**: TIP-027 (Tailwind config) first
3. **Report Completion**: After each TIP, return Completion Report
4. **Verify**: Check each implementation against ui-spec.md

---

## COMPLETION CRITERIA

Redesign is complete when:
- [ ] All 10 TIPs marked as DONE
- [ ] All screens match ui-spec.md screenshots
- [ ] Design tokens extended in tailwind.config.js
- [ ] No confidence badges in any component
- [ ] Dark mode applied to Camera, History, Analytics
- [ ] Light mode applied to Detail
- [ ] Multi-select + batch export working in History
- [ ] Fixed bottom action bar in Detail page
- [ ] Date range tabs in Analytics
- [ ] 48px touch targets on all interactive elements

---

## CONTACT INFO

**Workspace**: `D:\scripts\ocr_gemini\ocr-mobile-web`
**Coding Packs**: `D:\scripts\ocr_gemini\.coding_space\coding-packs`
**Source of Truth**: `coding-packs/design/ui-spec.md`

---

*Task Graph v2.0 | Generated: 2026-05-06 | Framework: Vibecode Kit v5.0 | Project: OCR Gemini UI/UX Redesign*
