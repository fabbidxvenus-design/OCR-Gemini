# TIP-061: Local Persistence Cutover and Regression Cleanup

## HEADER
- TIP-ID: TIP-061
- Project: ocr-mobile-web
- Module: api-cutover-cleanup
- Priority: P0
- Depends on: TIP-056, TIP-057, TIP-058, TIP-059, TIP-060
- Estimated: M

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Tech stack: React 19, TypeScript 6, Vite 8, backend API target `localhost:3001`
- Key files to read first:
  - `src/db/schema.ts`
  - `src/lib/auth.ts`
  - `src/hooks/useScans.ts`
  - `src/lib/gemini.ts`
  - `src/lib/excel.ts`
  - `src/hooks/useSettings.ts`
  - `src/store/authStore.ts`
  - `package.json`
- Patterns to follow:
  - Remove unused code only after all imports are migrated
  - Keep UI behavior unchanged
  - Run build/lint/test verification before marking complete

## APPLICABLE STANDARDS
Builder MUST conform to:
- [database/dexie-live-queries](../standards/database/dexie-live-queries.md) — verify Dexie is no longer used for migrated source-of-truth flows
- [database/scan-record-immutability](../standards/database/scan-record-immutability.md) — preserve immutable updates in API-backed state
- [api/openrouter-integration](../standards/api/openrouter-integration.md) — verify provider calls are backend-only
- [export/excel-mobile-fallback](../standards/export/excel-mobile-fallback.md) — verify export fallback behavior remains intact

## TASK
Perform the final frontend cutover from local persistence/direct-provider behavior to backend API behavior. Remove or quarantine unused Dexie/auth/OpenRouter/ExcelJS browser code only after all feature flows use `localhost:3001` APIs, then run regression checks.

## SPECIFICATIONS
### Business Rules
1. Frontend must not use Dexie as source of truth for auth, scans, settings, analytics, or export after cutover.
2. Frontend must not call OpenRouter directly after cutover.
3. Frontend must not require `VITE_OPENROUTER_API_KEY_*` env variables after cutover.
4. Zustand may keep UI session state but backend session remains source of truth.
5. User-facing routes and visual layout must remain unchanged.
6. All migrated flows must fail visibly when backend is offline; no silent fallback to local data.

### Files to Modify
- Remove or update imports across `src/**/*` that still reference:
  - `db` from `src/db/schema.ts`
  - local auth helpers from `src/lib/auth.ts`
  - direct OpenRouter env keys in `src/lib/gemini.ts`
  - browser ExcelJS generation if replaced by backend export
- `package.json` only if dependencies become truly unused and removal is explicitly safe.
- Tests under `src/__tests__/**/*` to reflect API-backed behavior.

### Validation
1. Search source for direct local persistence usage after migration:
   - `db.`
   - `localStorage`
   - `VITE_OPENROUTER_API_KEY`
   - `ExcelJS` browser import
2. Confirm any remaining usage is intentional and documented.
3. Run TypeScript build.
4. Run lint.
5. Run existing tests.
6. Manually verify key routes against local backend:
   - `/login`
   - `/camera`
   - `/history`
   - `/history/:scanId`
   - `/analytics`
   - `/settings`

### Error Handling
1. If API backend is not running, app must show clear errors and not display stale local data.
2. If build fails, fix compile errors before proceeding.
3. If tests fail due to old Dexie assumptions, update tests to mock API client instead of Dexie.
4. If dependency removal breaks build, restore dependency and document why it remains.

## ACCEPTANCE CRITERIA
- Given source search after migration When checking for `VITE_OPENROUTER_API_KEY` Then no frontend runtime dependency remains.
- Given source search after migration When checking scan/auth/settings flows Then Dexie is not used as source of truth.
- Given backend is running When user logs in, scans, edits, views history, views analytics, changes settings, and exports Then all flows call `localhost:3001` APIs and work end-to-end.
- Given backend is stopped When user opens protected/data routes Then UI shows connection/session errors and does not fall back to stale local data.
- Given `npm run build` is executed Then TypeScript and Vite build pass.
- Given test suite is executed Then migrated tests pass with API mocks.

## CONSTRAINTS
- DO NOT delete dependencies or files just because they appear old; confirm imports and behavior first.
- DO NOT change UI design or route structure.
- DO NOT implement new backend features here.
- DO NOT silently swallow API failures.
- REUSE existing tests where possible; update mocks from Dexie to API client.

## QUALITY GATE SELF-REVIEW
- [x] TIP is final cutover only, dependent on all migration TIPs.
- [x] Explicit search terms and verification commands are specified.
- [x] Acceptance criteria cover online, offline, build, and tests.
- Gap: true E2E verification requires backend service running locally at implementation time.
