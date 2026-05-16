# TIP-084: Accessibility Fixes for CollapsibleSection Unicode and Header

## Metadata
| Field | Value |
|-------|-------|
| **TIP** | TIP-084 |
| **Author** | Claude (auto-generated from PHASE 2 a11y audit) |
| **Created** | 2026-05-17 |
| **Type** | Productization / Accessibility |
| **Priority** | P2 |
| **Estimated Hours** | 0.5 |
| **Status** | READY |

## Problem Statement

**1. CollapsibleSection** uses Unicode `▼` / `▶` as visual indicators in addition to `aria-expanded` and `ChevronUp`/`ChevronDown` icons. This is redundant — `aria-expanded` communicates state to screen readers, and the chevron icons provide visual indication. The Unicode text is non-semantic.

**2. Header icon-only buttons** (back button, notifications, etc.) lack visible text labels. They use `aria-label` for screen readers, which is correct, but visual-only users rely on tooltip/title attributes or icon recognition.

## Fix

### CollapsibleSection — remove Unicode indicators:
Remove the two `▼` / `▶` span elements. Keep `aria-expanded` on the button and the `ChevronUp`/`ChevronDown` icons, which adequately convey state.

### Header — confirm aria-labels present:
Verify the Header component (`src/components/layout/Header.tsx`) passes `aria-label` to all icon-only buttons. If a button lacks one, add it.

## Implementation Steps

### Step 1: CollapsibleSection — remove Unicode
Read `src/components/ui/CollapsibleSection.tsx`. Remove the two lines rendering `{isExpanded ? '▼' : '▶'}` and the surrounding empty `<span>` tag.

### Step 2: Verify Header aria-labels
Read `src/components/layout/Header.tsx`. Confirm all icon-only buttons have `aria-label`.

### Step 3: Verify
- `npm run lint` — no errors
- `npm run build` — passes
- Screen reader users can still understand expandable state via `aria-expanded` + chevron icons

## Files to Modify

- `src/components/ui/CollapsibleSection.tsx`
- `src/components/layout/Header.tsx` (verify only, fix if needed)

## Constraints

- DO NOT remove `aria-expanded` attribute
- DO NOT remove chevron icons
- DO NOT remove any existing `aria-label` attributes
- Keep `ChevronUp`/`ChevronDown` for visual expand/collapse indication