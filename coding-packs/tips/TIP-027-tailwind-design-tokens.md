# TIP-027: Extend Tailwind Config (Design Tokens)

## HEADER
- **TIP-ID**: TIP-027
- **Project**: OCR Gemini UI/UX Redesign
- **Module**: Foundation / Design System
- **Priority**: P0
- **Depends on**: None
- **Estimated**: S (1 hour)

## CONTEXT
- **Working dir**: `D:/scripts/ocr_gemini/ocr-mobile-web`
- **Tech stack**: React 19, Vite 8, Tailwind CSS 3.4, Lucide React 1.x
- **Key files to read first**: `tailwind.config.js`, `src/index.css`
- **Patterns to follow**: Tailwind utility classes, design tokens as CSS variables

## TASK
Extend `tailwind.config.js` with design tokens from `ui-spec.md`. These tokens will be used across all redesigned components. This is the foundation for all subsequent TIPs.

## SPECIFICATIONS

### Design Tokens to Add

```javascript
// tailwind.config.js extend
colors: {
  primary: '#2563EB',    // Blue 600 - CTAs, selection
  success: '#22C55E',    // Green 600 - Verified fields
  error: '#EF4444',      // Red 500 - Errors
  warning: '#FFFBEB',    // Amber soft - Low confidence bg
  'slate-900': '#0F172A', // Dark mode background
  'slate-800': '#1E293B', // Secondary dark elements
  surface: '#F8FAFC',    // Light mode background
  card: '#FFFFFF',       // Card backgrounds
  border: '#E2E8F0',     // Card borders
  text: '#111827',        // Primary text
  muted: '#64748B',       // Secondary text
}
```

### CSS Variables (for index.css)
Add CSS custom properties for runtime theming:
```css
:root {
  --color-primary: #2563EB;
  --color-success: #22C55E;
  --color-error: #EF4444;
  --color-warning: #FFFBEB;
  --color-slate-900: #0F172A;
  --color-slate-800: #1E293B;
  --color-surface: #F8FAFC;
  --color-card: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text: #111827;
  --color-muted: #64748B;
  --font-heading: 'Funnel Sans', system-ui, sans-serif;
  --font-main: 'Geist', system-ui, sans-serif;
  --shadow-card: 0 8px 18px -8px rgba(15,23,42,0.08);
  --radius-card: 12px;
  --touch-target: 48px;
}
```

### Google Fonts Import
Add to `index.html` or `index.css`:
```html
<link href="https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@400;500;600;700&family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
```

## ACCEPTANCE CRITERIA
- Given tailwind.config.js When extended Then design tokens are available as Tailwind classes (e.g., `bg-primary`, `text-success`)
- Given CSS variables When defined Then they match the hex values from ui-spec.md
- Given index.css When updated Then font families are configured (Funnel Sans + Geist)
- Given card shadow When defined Then matches `0 8px 18px -8px rgba(15,23,42,0.08)`

## CONSTRAINTS
- **DO NOT**: Add new components, modify existing pages, or change functionality
- **DO NOT**: Remove existing Tailwind configuration
- **REUSE**: Keep existing theme extensions intact

## FILES TO MODIFY
- `tailwind.config.js` — Add design token colors
- `src/index.css` — Add CSS custom properties + Google Fonts import

---

*TIP-027 | Foundation | P0 | 1h | No dependencies*