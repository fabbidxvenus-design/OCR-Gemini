# TIP-059: Settings and Analytics API Migration

## HEADER
- TIP-ID: TIP-059
- Project: ocr-mobile-web
- Module: settings-analytics-api
- Priority: P1
- Depends on: TIP-055, TIP-057
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, Dexie currently stores settings, AnalyticsPage currently derives stats from scans
- Key files to read first:
  - `src/lib/apiClient.ts`
  - `src/hooks/useSettings.ts`
  - `src/pages/SettingsPage.tsx`
  - `src/pages/AnalyticsPage.tsx`
  - `src/hooks/useScans.ts`
  - `src/db/schema.ts`
  - `src/lib/fieldCategories.ts`
- Patterns to follow:
  - Existing settings UI behavior
  - Existing AnalyticsPage KPI layout and date filter behavior
  - Existing model tier values: `free`, `default`, `high`

## APPLICABLE STANDARDS
Builder MUST conform to:
- [database/dexie-live-queries](../standards/database/dexie-live-queries.md) — current settings/scans-derived behavior to replace carefully
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — central API error mapping
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — preserve analytics responsive layout

## TASK
Move app settings and analytics data from local Dexie/derived client calculations to backend API endpoints. Keep the same Settings and Analytics UI while making backend the source of truth.

## SPECIFICATIONS
### Business Rules
1. SettingsPage must load and save model tier through backend `/settings` endpoints.
2. AnalyticsPage must fetch aggregated stats from backend `/analytics` endpoint instead of deriving everything from local scans.
3. Date range filtering must be sent to backend where supported (`7d`, `30d`, `90d`, `all`).
4. Analytics UI must preserve existing KPI labels and top products display.
5. If backend does not support a derived value yet, show `0` or empty state rather than falling back to Dexie.

### Files to Create
- `src/lib/settingsApi.ts`
- `src/lib/analyticsApi.ts`

### Files to Modify
- `src/hooks/useSettings.ts`
- `src/pages/SettingsPage.tsx`
- `src/pages/AnalyticsPage.tsx`

### Backend Endpoint Contract
Assume these endpoints unless backend differs:
- `GET /settings` → `{ selectedModelTier: 'free' | 'default' | 'high', lastUpdated: string }`
- `PATCH /settings` → updated settings
- `GET /analytics?range=30d` →
  ```ts
  {
    totalScans: number;
    totalCost: number;
    apiKeyUsage: {
      key1Count: number;
      key2Count: number;
    };
    topProducts: Array<{ title: string; count: number }>;
  }
  ```

### Validation
1. Settings response must validate `selectedModelTier` before applying.
2. Analytics response must coerce missing numeric fields to `0` only after response validation.
3. Date range must be limited to `7d`, `30d`, `90d`, `all`.
4. Top products must be an array before rendering.

### Error Handling
1. Settings load failure: show existing settings page error/toast pattern.
2. Settings save failure: keep previous selected tier in UI and show error.
3. Analytics load failure: show empty KPI values and visible error state.
4. Backend offline: do not derive analytics from local Dexie as fallback.

## ACCEPTANCE CRITERIA
- Given backend has selected model tier When SettingsPage loads Then the current tier is fetched from `/settings`.
- Given user changes model tier When save succeeds Then frontend calls `PATCH /settings` and UI reflects saved value.
- Given AnalyticsPage opens with 30d selected When data loads Then frontend calls `/analytics?range=30d`.
- Given user selects 7d When range changes Then frontend refetches analytics for `7d`.
- Given backend returns top products When AnalyticsPage renders Then top products list matches backend response.
- Given backend is offline When AnalyticsPage loads Then UI shows an error/empty state and does not use Dexie fallback.

## CONSTRAINTS
- DO NOT change visual design of SettingsPage or AnalyticsPage.
- DO NOT fallback to local Dexie-derived settings/analytics after this migration.
- DO NOT migrate scan CRUD here; depends on TIP-057.
- REUSE existing `FilterChip` and KPI layout classes.
- SKIP export/OCR behavior changes.

## QUALITY GATE SELF-REVIEW
- [x] TIP scopes settings and analytics only.
- [x] Endpoint contracts and validation are explicit.
- [x] Acceptance criteria cover load/save/refetch/offline behavior.
- Gap: backend may not expose analytics aggregation yet; builder should confirm before implementation.
