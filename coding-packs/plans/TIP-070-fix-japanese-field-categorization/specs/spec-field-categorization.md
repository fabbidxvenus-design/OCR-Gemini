# SPEC: TIP-070 Japanese Contract Field Categorization

## Behavioral Specs

### SPEC-001: Japanese contract fields categorize as main
- Given OCR fields include `契約No.` or `契約No`
- When `categorizeFields` runs
- Then those fields receive category `main`

### SPEC-002: CT No variants categorize as main
- Given OCR fields include `CT No.` or `CT No` with case variants
- When `categorizeFields` runs
- Then those fields receive category `main`

### SPEC-003: Fixed scan field matching recognizes Japanese contract fields
- Given OCR result fields include `契約No.` and `CT No.`
- When `ScanFieldsTable` resolves the Contract No. fixed field via `findScanField`
- Then the Contract No. row receives the OCR value instead of rendering empty

### SPEC-004: Existing categorization remains unchanged
- Given existing barcode, lot, product, quantity, and contract patterns
- When categorization and fixed-field matching run
- Then their existing main-field behavior is preserved

## Verification Commands

```powershell
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
npx playwright test e2e/ocr-result.spec.ts --reporter=line
```

## Green Gate

All commands pass, or any E2E infrastructure issue is documented with evidence that the TIP-070 categorization assertions pass.
