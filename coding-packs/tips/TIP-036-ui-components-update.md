# TIP-036: Update UI Components (Skeleton, Toast)

## HEADER
- **TIP-ID**: TIP-036
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Polish / UI Components
- **Priority**: P1
- **Depends on**: TIP-027 (Tailwind design tokens)
- **Estimated**: S (1 hour)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/components/ui/SkeletonCard.tsx`, `src/components/ui/Toast.tsx`
- **Reference**: `design/ui-spec.md` — Component Specs

## TASK
Update SkeletonCard and Toast components to match the new design system. Apply consistent styling tokens and ensure proper loading/error states with the updated color palette.

## SPECIFICATIONS

### SkeletonCard Component

#### Current State Review
- Check existing implementation for:
  - Animation (pulse or shimmer)
  - Color palette usage
  - Border radius
  - Shadow

#### Updates Needed
- **Background**: Animated gradient (light gray to lighter gray)
- **Border radius**: 12px (matching card spec)
- **Animation**: Pulse or shimmer effect, 1.5s duration
- **Usage**: Replace inline skeletons with this component

### Toast Component

#### Current State Review
- Check existing implementation for:
  - Position (top/bottom)
  - Animation (slide/fade)
  - Color for success/error/warning states
  - Duration before auto-dismiss

#### Updates Needed
- **Success toast**: Green left border (`border-l-success`), white background
- **Error toast**: Red left border (`border-l-error`), white background
- **Warning toast**: Amber left border, white background
- **Position**: Bottom center, above BottomNav
- **Duration**: 3000ms default
- **Animation**: 300ms ease-out slide up + fade
- **Border radius**: 12px
- **Shadow**: Card shadow

### Animation Specs
```css
/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Toast slide up */
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## ACCEPTANCE CRITERIA
- Given SkeletonCard When rendered Then shows loading animation
- Given SkeletonCard When rendered Then uses 12px border radius
- Given Toast When success Then green accent styling
- Given Toast When error Then red accent styling
- Given Toast When appears Then slides up with fade
- Given Toast When timeout Then auto-dismisses

## CONSTRAINTS
- **DO NOT**: Add confidence badges
- **DO NOT**: Use inline styles
- **DO NOT**: Change toast API/props interface
- **REUSE**: Keep existing props interface for backward compatibility

## FILES TO MODIFY
- `src/components/ui/SkeletonCard.tsx` — Theme updates
- `src/components/ui/Toast.tsx` — Theme updates

---

*TIP-036 | Polish | P1 | 1h | Depends on TIP-027*