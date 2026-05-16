# TIP-085: A11y Fixes — ViewModeToggle aria-label + InputField error linking

## Metadata
| Field | Value |
|-------|-------|
| **TIP** | TIP-085 |
| **Author** | Claude (auto-generated from PHASE 2 a11y audit) |
| **Created** | 2026-05-17 |
| **Type** | Productization / Accessibility |
| **Priority** | P2 |
| **Estimated Hours** | 0.5 |
| **Status** | READY |

## Problem Statement

**1. ViewModeToggle** uses `title={label}` for mode buttons but not `aria-label`. Screen readers may not announce the mode correctly.

**2. InputField** error message is visually displayed but not programmatically linked to the input via `aria-describedby`. Screen readers don't associate the error message with the input field.

## Fix

### ViewModeToggle — add aria-label to toggle buttons:
Replace `title={label}` with `aria-label={label}` on each mode button.

### InputField — link error message to input:
1. Add `aria-describedby={hasError ? `${inputId}-error` : undefined}` to the input
2. Add `aria-invalid={hasError ? 'true' : undefined}` to the input
3. Add `id={`${inputId}-error`}` to the error div

## Implementation Steps

### Step 1: ViewModeToggle
Read `src/components/ui/ViewModeToggle.tsx`. Change `title={label}` → `aria-label={label}` on the button.

### Step 2: InputField
Read `src/components/ui/InputField.tsx`. Add `aria-describedby`, `aria-invalid`, and error div `id` as described above.

### Step 3: Verify
- `npm run lint` — no errors
- `npm run build` — passes
- Screen reader users hear error messages when input has error

## Files to Modify

- `src/components/ui/ViewModeToggle.tsx`
- `src/components/ui/InputField.tsx`

## Constraints

- DO NOT change visual appearance
- DO NOT change `title` attribute (keep both title and aria-label if beneficial)
- `aria-invalid` must be string `'true'` not boolean `true` for strict TypeScript typing