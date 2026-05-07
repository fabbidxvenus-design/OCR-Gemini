# Phase 2: Screen Redesigns

## Overview
Redesign main screens: Camera, History, Detail, Analytics.

## Tasks
- [x] **TIP-029**: Redesign Camera page (HUD style) (4h) — depends on TIP-028
- [x] **TIP-031**: Redesign HistoryPage (multi-select + batch export) (4h) — depends on TIP-030
- [x] **TIP-032**: Redesign OCRResultPage (light mode cards) (2h) — depends on TIP-027
- [x] **TIP-034**: Redesign AnalyticsPage (dark mode + date tabs) (2h) — depends on TIP-033

## Dependencies
TIP-029 needs TIP-028 (StatusBar) first.
TIP-031 needs TIP-030 (HistoryCard) first.
TIP-032 can run independently after TIP-027.
TIP-034 needs TIP-033 (KPICard) first.

## Implementation Order
1. TIP-029 (Camera) → sequential (depends on TIP-028)
2. TIP-031 (History) → sequential (depends on TIP-030)
3. TIP-032 (OCRResult) → can run in parallel
4. TIP-034 (Analytics) → sequential (depends on TIP-033)

## Screen Specs

### Camera (TIP-029)
- Full-screen dark background
- HUD-style targeting frame (blue border, 12px radius)
- Instrument panel design
- 64px shutter button
- StatusBar integration

### History (TIP-031)
- Dark mode background
- Search bar + Select toggle
- Multi-select mode with checkboxes
- Floating batch export bar
- "Xuất Excel" CTA

### OCRResult (TIP-032)
- Light mode (bg-surface)
- Card-based structure
- Fixed bottom action bar (Edit, Copy, Share)
- Verified fields: green checkmark
- Low confidence: amber background
- NO confidence badges

### Analytics (TIP-034)
- Dark mode background
- Date range tabs (7/30/90/Tất cả)
- 2 KPI cards (Total Scans, Total Cost)
- Bar chart for top 5 products
- REMOVE: "Độ tin cậy TB" KPI

## File Mapping
| TIP | Files | Purpose |
|-----|-------|---------|
| TIP-029 | src/components/camera/CameraView.tsx, src/pages/OCRPage.tsx | Camera HUD |
| TIP-031 | src/pages/HistoryPage.tsx | Multi-select + batch |
| TIP-032 | src/pages/OCRResultPage.tsx | Light mode detail |
| TIP-034 | src/pages/AnalyticsPage.tsx | Dark mode dashboard |

## Theme Summary
| Screen | Theme | Key Changes |
|--------|-------|--------------|
| Camera | Dark | HUD style, instrument panel |
| History | Dark | Multi-select, batch export |
| OCRResult | Light | Card-based, fixed actions |
| Analytics | Dark | Date tabs, KPI cards |

## Source Documents
- `design/ui-spec.md` (screens 1-4)
- `tips/TIP-029-camera-redesign.md`
- `tips/TIP-031-historypage-redesign.md`
- `tips/TIP-032-ocrresultpage-redesign.md`
- `tips/TIP-034-analyticspage-redesign.md`

---

*Phase 2 COMPLETED | Status: All screens redesigned*

## Completion Summary

### Phase 2 Completion: 2026-05-06

All 4 screens completed:
1. ✅ TIP-029: Camera HUD redesign with dark mode + instrument panel
2. ✅ TIP-031: History multi-select + batch export (dark mode)
3. ✅ TIP-032: OCRResult light mode cards with confidence hints
4. ✅ TIP-034: Analytics dark dashboard with 2 KPIs + trend

Build: `✓ built in 1.21s`