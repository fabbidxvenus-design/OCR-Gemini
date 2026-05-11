# INTAKE — api-client

## Goal

[CORE] Create a zflow implementation plan for migrating frontend services from local browser source-of-truth behavior to `localhost:3001` API-backed services using TIP-055 through TIP-061.

## Scope

[CORE] This plan covers planning artifacts only. No functional source code implementation is part of this phase.

Included TIPs:

| TIP | Scope | Priority | Estimate |
|---|---|---|---|
| TIP-055 | API client foundation | P0 | S |
| TIP-056 | Auth flow API migration | P0 | M |
| TIP-057 | Scan storage API migration | P0 | L |
| TIP-058 | OCR backend API migration | P0 | M |
| TIP-059 | Settings and analytics API migration | P1 | M |
| TIP-060 | Export backend API migration | P1 | M |
| TIP-061 | Local persistence cutover and regression cleanup | P0 | M |

## Complexity Score

[DECISION] Tier: STANDARD

| Axis | Score | Rationale |
|---|---:|---|
| Scope | 18 | Seven TIPs across API client, auth, scan CRUD, OCR, settings/analytics, export, cleanup/tests |
| Uncertainty | 17 | Backend contracts are assumed and must be aligned during execution |
| Risk | 17 | Auth/session, storage source-of-truth, offline failure behavior, and export blob handling are user-critical |
| Total | 52 | STANDARD tier required |

## Key Risks

- [RISK] Backend endpoint shapes may differ from TIP assumptions.
- [RISK] Removing Dexie/localStorage fallbacks too early may break flows before backend parity exists.
- [RISK] Test suite currently likely assumes Dexie/local UI behavior and will require API mocks.
- [RISK] Offline behavior must be explicit; silent fallback to stale local data is forbidden.

## Plan Mode Notes

- [DECISION] RRI/SDD/PROPOSAL are skipped because TIP-055 through TIP-061 are the approved design inputs.
- [DECISION] State is scoped to `coding-packs/plans/api-client/.zflow/`.
- [DECISION] Plan-local TIP copies are stored in `coding-packs/plans/api-client/tips/`.
