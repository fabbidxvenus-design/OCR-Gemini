# TIP-053: HistoryPage Responsive Grid

## HEADER
- TIP-ID: TIP-053
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-050
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS
- Key files to read first:
    - `src/pages/HistoryPage.tsx`

## TASK
Cập nhật HistoryPage grid layout để responsive theo viewport.

## SPECIFICATIONS

### Grid Breakpoints
```tsx
// Current (mobile): grid-cols-2
// Tablet (md): grid-cols-3
// Desktop (lg): grid-cols-4

// In HistoryPage render:
<div className={`
  grid gap-section
  ${viewMode === 'grid' ? `
    grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
  ` : 'grid-cols-1'}
`}>
  {/* scan cards */}
</div>
```

### Other Responsive Adjustments
1. **List view**: Full width on mobile, max-w-3xl centered on tablet+
2. **Header area**: Stack filters vertically on mobile, horizontal on tablet+
3. **Floating export bar**: Full width on mobile, max-w-2xl centered on tablet+

## ACCEPTANCE CRITERIA
- **Given** HistoryPage **When** on mobile **Then** shows 2-column grid
- **Given** HistoryPage **When** on tablet (768px+) **Then** shows 3-column grid
- **Given** HistoryPage **When** on desktop (1024px+) **Then** shows 4-column grid
- **Given** list view **When** on tablet+ **Then** content is centered with max-width

## CONSTRAINTS
- DO NOT: Change card styling significantly
- REUSE: Existing card components, grid gap spacing
- SKIP: No changes to filter/search logic