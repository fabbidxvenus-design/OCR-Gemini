# DECOMPOSE.md — OCR Mobile Web Redesign v2

> zflow plan mode | Plan: redesign-v2 | Phase: DECOMPOSE
> Generated: 2026-05-07

---

## PHASE GATE: RED GATE PASSED ✅

- 22 tests created, 13 tests passing, 22 tests failing (expected)
- Tests FAIL before implementation → RED GATE passed
- Verifier: Separate agent (code-reviewer) for GREEN GATE

---

## TASK BREAKDOWN

### Phase 1: Foundation (TIP-044)

| Task ID | Description | Files | Est. | Dependency |
|---------|-------------|-------|------|------------|
| TASK-044-01 | Update tailwind.config.js with design tokens | `tailwind.config.js` | 1h | - |
| TASK-044-02 | Create PrimaryButton component | `src/components/ui/PrimaryButton.tsx` | 1h | TASK-044-01 |
| TASK-044-03 | Create InputField component | `src/components/ui/InputField.tsx` | 1h | TASK-044-01 |
| TASK-044-04 | Create CollapsibleSection component | `src/components/ui/CollapsibleSection.tsx` | 1h | TASK-044-01 |
| TASK-044-05 | Create FilterChip component | `src/components/ui/FilterChip.tsx` | 1h | TASK-044-01 |
| TASK-044-06 | Create Checkbox component | `src/components/ui/Checkbox.tsx` | 30m | TASK-044-01 |
| TASK-044-07 | Export all components in index.ts | `src/components/ui/index.ts` | 30m | TASK-044-02 to 044-06 |

**Verification**: All UI components render with correct tokens.

---

### Phase 2: Auth Flow (TIP-045)

| Task ID | Description | Files | Est. | Dependency |
|---------|-------------|-------|------|------------|
| TASK-045-01 | Update LoginPage with email/password | `src/pages/LoginPage.tsx` | 2h | TASK-044-07 |
| TASK-045-02 | Create RegisterPage with password strength | `src/pages/RegisterPage.tsx` | 2h | TASK-044-07 |
| TASK-045-03 | Create ForgotPasswordPage | `src/pages/ForgotPasswordPage.tsx` | 1h | TASK-044-07 |
| TASK-045-04 | Update App.tsx routes | `src/App.tsx` | 30m | TASK-045-01 to 045-03 |
| TASK-045-05 | Update authStore logout | `src/store/authStore.ts` | 30m | TASK-045-01 |

**Verification**: All 3 auth pages render, validation works, routing correct.

---

### Phase 3: Layout Components (TIP-046)

| Task ID | Description | Files | Est. | Dependency |
|---------|-------------|-------|------|------------|
| TASK-046-01 | Update Header component | `src/components/layout/Header.tsx` | 1h | TASK-044-07 |
| TASK-046-02 | Update BottomNav with active states | `src/components/layout/BottomNav.tsx` | 1h | TASK-044-07 |
| TASK-046-03 | Update Layout wrapper | `src/components/layout/Layout.tsx` | 1h | TASK-044-07 |
| TASK-046-04 | Add safe-area CSS support | `src/index.css` | 30m | TASK-046-01, 046-02 |

**Verification**: Header shows back button when `showBack=true`, BottomNav highlights active route.

---

### Phase 4: OCR & History Screens (TIP-047)

| Task ID | Description | Files | Est. | Dependency |
|---------|-------------|-------|------|------------|
| TASK-047-01 | Update CameraView with overlay | `src/components/camera/CameraView.tsx` | 2h | TASK-046-01 |
| TASK-047-02 | Update ImagePreview | `src/components/camera/ImagePreview.tsx` | 1h | TASK-046-01 |
| TASK-047-03 | Update OCRResultPage with collapsible sections | `src/pages/OCRResultPage.tsx` | 3h | TASK-044-04 |
| TASK-047-04 | Update HistoryDetailPage | `src/pages/HistoryDetailPage.tsx` | 2h | TASK-044-04 |
| TASK-047-05 | Update HistoryPage grid/list view | `src/pages/HistoryPage.tsx` | 3h | TASK-044-05 |

**Verification**: Camera shows overlay guide, OCR results have collapsible sections.

---

### Phase 5: Analytics & Settings (TIP-048)

| Task ID | Description | Files | Est. | Dependency |
|---------|-------------|-------|------|------------|
| TASK-048-01 | Update AnalyticsPage KPI cards | `src/pages/AnalyticsPage.tsx` | 2h | TASK-044-05 |
| TASK-048-02 | Update AnalyticsPage date filter | `src/pages/AnalyticsPage.tsx` | 1h | TASK-048-01 |
| TASK-048-03 | Update SettingsPage model selector | `src/pages/SettingsPage.tsx` | 2h | TASK-044-07 |
| TASK-048-04 | Update SettingsPage danger zone | `src/pages/SettingsPage.tsx` | 30m | TASK-048-03 |

**Verification**: KPI cards have icons, model selector shows selected state with check icon.

---

## EXECUTION ORDER

```
Phase 1 (Foundation)
    ↓
Phase 2 (Auth) ←→ Phase 3 (Layout)
    ↓                    ↓
Phase 4 (OCR/History Screens)
    ↓
Phase 5 (Analytics/Settings)
    ↓
GREEN GATE (code-reviewer)
```

---

## ESTIMATED TOTAL

| Phase | Hours |
|-------|-------|
| Phase 1: Foundation | 6h |
| Phase 2: Auth Flow | 6h |
| Phase 3: Layout | 3.5h |
| Phase 4: OCR/History | 11h |
| Phase 5: Analytics/Settings | 5.5h |
| **Total** | **32h** |

---

*DECOMPOSE.md v1.0 | Phase: DECOMPOSE | Status: READY FOR EXECUTE*