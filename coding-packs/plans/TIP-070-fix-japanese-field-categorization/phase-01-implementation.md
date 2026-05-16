# Phase 01: TIP-070 Implementation Plan

## Goal

Fix Japanese contract number field recognition so `契約No.`, `契約No`, `CT No.`, and `CT No` are treated as main contract fields in both categorization and fixed scan-field rendering.

## Context

Root cause is split across two match layers:
- `src/lib/fieldCategories.ts` decides `main` vs `other` for OCR field sectioning.
- `src/lib/scanFields.ts` powers `findScanField`, which `ScanFieldsTable` uses to populate the fixed Contract No. row.

The fix must update both layers without changing UI structure, backend contracts, dependencies, or E2E assertions.

## Implementation Steps

1. Update `MAIN_FIELD_PATTERNS` in `src/lib/fieldCategories.ts` to explicitly match:
   - `契約No.`
   - `契約No`
   - `CT No.`
   - `CT No`
   - case variants through regex `i` behavior where applicable.
2. Update `contractNo.patterns` in `src/lib/scanFields.ts` to include exact fixed-field matching strings for:
   - `ct no`
   - `契約No.`
   - `契約No`
   - Preserve existing patterns.
3. Add or update focused tests if an existing `fieldCategories`/`scanFields` test file exists; otherwise keep code-only patch and rely on existing E2E plus full Vitest regression.
4. Run verification commands from `specs/spec-field-categorization.md`.
5. Send diff to reviewer agents and address any CRITICAL/HIGH findings.

## Constraints

- `gsd-executor` is the only code writer.
- Do not change E2E assertions.
- Do not alter OCR model behavior or backend APIs.
- Do not add dependencies.
- Do not introduce console debug output.
