# TIP-054: AnalyticsPage Responsive KPIs

## HEADER
- TIP-ID: TIP-054
- Project: OCR Gemini Mobile Web
- Module: UI/Frontend
- Priority: P1
- Depends on: TIP-050
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 18, Tailwind CSS
- Key files to read first:
    - `src/pages/AnalyticsPage.tsx`

## TASK
Cập nhật AnalyticsPage KPI layout để responsive theo viewport.

## SPECIFICATIONS

### KPI Grid Breakpoints
```tsx
// Current (mobile): grid-cols-1 (stacked)
// Tablet (md): grid-cols-2 (2x2)
// Desktop (lg): grid-cols-4 (inline)

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-section">
  {/* KPI cards */}
</div>
```

### Other Responsive Adjustments
1. **Top Products chart**: Full width on mobile, max-w-2xl on tablet+
2. **Date range chips**: Flex wrap on mobile, flex-1 on tablet+
3. **KPI card content**: Stack icon above text on mobile, inline on tablet+

### KPI Card Responsive Layout
```tsx
// Mobile: Icon above content, centered
// Tablet+: Icon left, content right, inline

<div className="flex flex-col md:flex-row items-center md:items-start gap-4">
  <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
    {kpi.icon}
  </div>
  <div className="text-center md:text-left">
    <p className="text-label font-medium text-text-secondary uppercase tracking-wider">{kpi.label}</p>
    <p className="text-2xl font-bold text-text-primary mt-0.5">{kpi.value}</p>
  </div>
</div>
```

## ACCEPTANCE CRITERIA
- **Given** AnalyticsPage **When** on mobile **Then** shows KPI cards stacked vertically
- **Given** AnalyticsPage **When** on tablet (768px+) **Then** shows KPI cards in 2x2 grid
- **Given** AnalyticsPage **When** on desktop (1024px+) **Then** shows KPI cards in single row
- **Given** KPI cards **When** on tablet+ **Then** icon left, text right (inline layout)

## CONSTRAINTS
- DO NOT: Change KPI calculation logic
- DO NOT: Change card colors or icons
- REUSE: Existing KPICard structure, flex gap classes