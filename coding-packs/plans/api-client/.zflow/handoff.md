# HANDOFF — api-client

## Status

[CORE] Plan created. Implementation has not started.

## Plan Directory

`D:\scripts\HLVN\ocr-mobile-web\coding-packs\plans\api-client`

## Artifacts

- `.zflow/state.json`
- `.zflow/pipeline.json`
- `.zflow/intake-report.md`
- `.zflow/SPEC.md`
- `.zflow/DECOMPOSE.md`
- `.zflow/handoff.md`
- `tips/TIP-055-api-client-foundation.md`
- `tips/TIP-056-auth-api-migration.md`
- `tips/TIP-057-scans-storage-api-migration.md`
- `tips/TIP-058-ocr-backend-api-migration.md`
- `tips/TIP-059-settings-analytics-api-migration.md`
- `tips/TIP-060-export-backend-api-migration.md`
- `tips/TIP-061-local-persistence-cutover-cleanup.md`

## Execution Command

Use this plan when ready to implement:

```text
/zflow --plan api-client --phase execute
```

## Implementation Order

1. TIP-055
2. TIP-056 and TIP-057
3. TIP-058, TIP-059, and TIP-060
4. TIP-061

## Critical Rules

- Do not implement backend endpoints in this frontend plan.
- Do not keep localStorage/Dexie as silent fallback after each corresponding migration TIP.
- Do not expose OpenRouter provider keys in frontend after TIP-058.
- Do not delete dependencies until TIP-061 confirms imports and build behavior.
- Preserve existing routes and UI.
- Add/update tests during execution.
- Run build/lint/tests before final completion.

## Open Questions for Execute Phase

- What is the exact `localhost:3001` auth payload shape?
- Does OCR endpoint expect multipart form data or JSON data URL?
- Does analytics endpoint already support date range filters?
- Does export endpoint return filenames via `Content-Disposition`?
- Is backend already running during manual verification?

## Quality Gate Snapshot

- Complexity scored: STANDARD / 52
- TIPs copied into plan-local scope: yes
- G/W/T specs written: yes
- Dependency order written: yes
- Implementation: not started
- Verification: not run
- EVOLVE: not dispatched because this is plan creation only
