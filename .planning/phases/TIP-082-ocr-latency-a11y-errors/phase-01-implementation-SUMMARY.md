---
phase: TIP-082-ocr-latency-a11y-errors
plan: phase-01-implementation
subsystem: frontend-a11y
tags: [accessibility, ocr, latency, a11y-errors]
dependency_graph:
  requires: []
  provides: []
  affects: [InputField, CameraView, EditPage, compression]
tech_stack:
  added: []
  patterns: [aria-labels, aria-states, console-warn-logging]
key_files:
  created: []
  modified:
    - src/components/ui/InputField.tsx
    - src/components/camera/CameraView.tsx
    - src/pages/EditPage.tsx
    - src/lib/compression.ts
    - e2e/phase2-productization.spec.ts
decisions: []
metrics:
  duration: 2m
  completed_date: 2026-05-18
---

# Phase 01 Implementation: OCR Latency, A11y, Errors Summary

## Objective

Improve accessibility (A11y) and error handling for OCR-related latency issues, per TIP-082.

## One-Liner

Improved accessibility across InputField, CameraView, and EditPage with proper ARIA attributes and error logging.

## Implementation Summary

### Completed Tasks

| # | Task | Status | Files Modified |
|---|------|--------|----------------|
| 1 | InputField accessibility | DONE | src/components/ui/InputField.tsx |
| 2 | CameraView accessibility + catch fix | DONE | src/components/camera/CameraView.tsx |
| 3 | EditPage tab ARIA | DONE | src/pages/EditPage.tsx |
| 4 | Compression catch context | DONE | src/lib/compression.ts |
| 5 | Local OCR scans review | SKIP | N/A - no blocking issue |
| 6 | E2E stale expectations | DONE | e2e/phase2-productization.spec.ts |

### Task Details

**Task 1: InputField accessibility**
- Generated a stable `errorId` from `inputId` (e.g., `${inputId}-error`).
- Added `aria-describedby={hasError ? errorId : undefined}` and `aria-invalid={hasError}` to the `<input>`.
- Added `id={errorId}` and `aria-atomic="true"` to the error `<div>`.

**Task 2: CameraView accessibility + catch fix**
- Added `role="alert"` and `aria-live="polite"` to the error message div.
- Added `aria-label="Camera preview - live video feed showing document to scan"` to the `<video>` element.
- Changed error upload label: `Tải ảnh từ thư viện khi camera không khả dụng`.
- Changed capture button label: `Chụp ảnh tài liệu để quét OCR`.
- Changed gallery upload label: `Tải ảnh tài liệu từ thư viện để quét OCR`.
- Added `console.warn` logging to the `handleCapture` catch block.

**Task 3: EditPage tab ARIA**
- Added `aria-pressed={activeTab === 'structured'}` to the structured tab button.
- Added `aria-pressed={activeTab === 'rawText'}` to the rawText tab button.
- Added `aria-label="Đang ở tab Thông tin"` when structured tab is active.
- Added `aria-label="Đang ở tab Văn bản gốc"` when rawText tab is active.

**Task 4: Compression catch context**
- In `compressImage`: added `console.warn('[compression] compressImage failed:', err instanceof Error ? err.message : err)`.
- In `compressImageForOCR`: added `console.warn('[compression] fast compression failed, using heavy fallback:', err instanceof Error ? err.message : err)`.
- Wrapped the generic error throw with `// eslint-disable-next-line preserve-caught-error` to satisfy linting.

**Task 5: Local OCR scans review**
- SKIPPED: No clear synchronous blocking issue detected.

**Task 6: E2E stale expectations**
- Updated FLOW 1 capture button test expectation from `/chụp ảnh/i` to `/chụp ảnh tài liệu để quét OCR/i`.

## Deviations from Plan

### Fixes Applied

**1. [Rule 3 - Build Error] Fixed lint error in compression catch block**
- **Found during:** Task 4 implementation
- **Issue:** Lint rule `preserve-caught-error` failed because `.cause` is not supported in current ES target
- **Fix:** Added inline eslint disable comment for that specific line
- **Files modified:** src/lib/compression.ts
- **Commit:** dd29339

## Verification

- [x] `pnpm lint` passes
- [x] `pnpm build` passes

## Threat Flags

None - no new security-relevant surface introduced.

---