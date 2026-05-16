# SPEC: TIP-072 Fix OCR Result E2E Table Locators

## Behavioral Specs

### SPEC-001: E2E uses table-row locators instead of card selectors
- Given `OCRResultPage` renders `ScanFieldsTable`
- When `e2e/ocr-result.spec.ts` locates fixed-field label/value pairs
- Then assertions use table-visible UI (row text, role-based, label-based) instead of `.rounded-2xl` card selectors

### SPEC-002: Contract field assertions aligned with table UI
- Given mocked scan data includes `契約No.` and `CT No.`
- When the OCR result page renders
- Then the E2E verifies the Contract No row contains the contract value through table-visible text

### SPEC-003: Product field assertions aligned with table UI
- Given mocked product data includes `商品名 = Test Product`
- When the field rendering E2E runs
- Then it verifies the product row/value is visible through the current table structure

## Verification Commands
```powershell
npx playwright test e2e/ocr-result.spec.ts --reporter=line
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
```

## Green Gate

All commands pass, or unblocking infrastructure issues are documented with evidence.