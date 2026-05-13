# TIP-062: User Profile Multi-Agent Orchestration

## HEADER
- TIP-ID: TIP-062
- Project: ocr-mobile-web
- Module: user-profile-orchestration
- Priority: P1
- Depends on: TIP-056, TIP-061
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\HLVN\ocr-mobile-web`
- Backend dir: `D:\scripts\HLVN\HLVN-serverless`
- Tech stack: React 19 + TypeScript + Vite + React Router + Tailwind + Zustand frontend; Next.js serverless backend + Supabase users table.
- Product decision from UYQ: Profile is a full feature, opened from Header avatar, backend API is source of truth, fields include display name, description/bio, contact info, company/department/job title, and avatar URL/data URL.
- Key files to read first:
  - `coding-packs/tips/TIP-063-user-profile-backend-schema-api.md`
  - `coding-packs/tips/TIP-064-user-profile-frontend-contract-store.md`
  - `coding-packs/tips/TIP-065-user-profile-page-header-entry.md`
  - `coding-packs/tips/TIP-066-user-profile-validation-tests.md`
  - `coding-packs/tips/TIP-067-user-profile-e2e-a11y-polish.md`

## APPLICABLE STANDARDS
Builder MUST conform to:
- [ui/mobile-first-responsive](../standards/ui/mobile-first-responsive.md) — profile page/header entry must be mobile-first.
- [ui/runtime-responsive-hooks](../standards/ui/runtime-responsive-hooks.md) — use runtime hooks only when CSS cannot express behavior.

## TASK
Orchestrate the user profile feature across focused implementation TIPs. The orchestrator must dispatch independent work to specialized agents where safe, enforce dependency order, and integrate outputs only after each TIP passes its quality gate.

## MULTI-AGENT EXECUTION PLAN
### Phase 1 — Parallel planning/review
- `@code-architect` or planner agent: review TIP-063..067 dependency order and confirm no missing contracts.
- `@a11y-architect`: pre-review Profile UI acceptance criteria and Header avatar touch/focus requirements.
- `@security-reviewer`: pre-review backend profile update surface for auth, validation, and data exposure risks.

### Phase 2 — Backend foundation
- Execute TIP-063 first. It owns DB migration, backend profile type, repository/service updates, and authenticated `GET/PATCH /api/auth/me` behavior.
- Use `typescript-reviewer` and `security-reviewer` after backend code changes.

### Phase 3 — Frontend contract/store
- Execute TIP-064 after TIP-063 contract is clear. It owns frontend Zod schemas, `authApi.updateProfile`, and Zustand user sync action.
- Use `typescript-reviewer` after frontend contract/store changes.

### Phase 4 — UI implementation
- Execute TIP-065 after TIP-064. It owns `/profile`, `ProfilePage`, Header avatar entry, responsive layout, and Vietnamese copy.
- Use `a11y-architect` after UI changes.

### Phase 5 — Verification
- Execute TIP-066 for unit/integration tests.
- Execute TIP-067 for browser/E2E/a11y polish on mobile and tablet breakpoints.

## ACCEPTANCE CRITERIA
- Given TIP-063..067 exist When an orchestrator reads TIP-062 Then the orchestrator can assign work without asking for scope clarification.
- Given backend and frontend work are separate When multiple agents run Then no two agents edit the same file concurrently except by explicit orchestrator sequencing.
- Given TIP-063 completes When TIP-064 starts Then the frontend contract matches the backend response/request shape.
- Given TIP-064 completes When TIP-065 starts Then Profile UI can call a real typed API method and update auth store.
- Given TIP-065 completes When TIP-066 and TIP-067 run Then tests and browser verification cover save success, validation failure, auth failure, responsive layout, keyboard/focus, and touch targets.

## CONSTRAINTS
- DO NOT: implement code directly from this orchestration TIP; implement only the child TIPs.
- DO NOT: run UI work before API/store contract exists.
- DO NOT: let backend and frontend agents invent different profile field names.
- REUSE: child TIP API contract exactly.
- SKIP: password change, email change, account deletion, admin role management, binary avatar upload.

## QUALITY GATE: /vibecode:tip Self-Review
- Completeness: PASS — child TIPs cover backend, frontend contract/store, UI, tests, E2E/a11y.
- Multi-agent suitability: PASS — explicit phase ordering and file ownership reduce conflicts.
- Acceptance criteria: PASS — orchestration-level Given/When/Then scenarios define integration readiness.
- Gaps declared: PASS — this TIP is orchestration only and intentionally delegates implementation to TIP-063..067.
