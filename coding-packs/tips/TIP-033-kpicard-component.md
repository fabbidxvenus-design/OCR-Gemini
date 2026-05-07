# TIP-033: Create KPICard Component

## HEADER
- **TIP-ID**: TIP-033
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Components / KPICard
- **Priority**: P0
- **Depends on**: TIP-027 (Tailwind design tokens)
- **Estimated**: S (1 hour)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `src/components/analytics/KPICard.tsx` (new), `design/ui-spec.md`
- **Reference**: `00-PROJECT-CONTEXT-REDESIGN.md` — Screen 4: Analytics (Dark Mode)

## TASK
Create a new `KPICard` component for displaying analytics KPI values. These cards show icon + label + value format. Used in AnalyticsPage dashboard with dark mode styling.

## SPECIFICATIONS

### Component Props
```typescript
interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
}
```

### Component Structure
```
┌─────────────────────────────┐
│ 📊                        │  ← Icon (32px)
│                             │
│ Total Scans                │  ← Label (uppercase, muted)
│ 1,240                      │  ← Value (large, bold)
└─────────────────────────────┘
```

### Visual Specs
- **Background**: `bg-card` (#FFFFFF)
- **Border**: 1px `border-border` (#E2E8F0)
- **Border radius**: 12px
- **Shadow**: `shadow-[0_8px_18px_-8px_rgba(15,23,42,0.08)]`
- **Padding**: 16px
- **Min height**: 100px (for consistent sizing)

### Content Layout
- **Icon**: 32px, colored with primary blue (`text-primary`)
- **Label**: Uppercase, small font, `text-muted`
- **Value**: Large font (2xl), bold, `text-text`

### Trend Indicator (Optional)
- **Up**: Green arrow + percentage
- **Down**: Red arrow + percentage
- **Neutral**: Gray text

## ACCEPTANCE CRITERIA
- Given KPICard When rendered Then shows icon, label, and value
- Given KPICard When trend provided Then shows trend indicator
- Given KPICard When rendered Then matches card design specs
- Given KPICard When rendered Then all text is legible

## CONSTRAINTS
- **DO NOT**: Use inline styles
- **DO NOT**: Add confidence badges
- **REUSE**: Lucide icons for icon prop

## FILES TO CREATE
- `src/components/analytics/KPICard.tsx` — New KPICard component

---

*TIP-033 | Components | P0 | 1h | Depends on TIP-027*