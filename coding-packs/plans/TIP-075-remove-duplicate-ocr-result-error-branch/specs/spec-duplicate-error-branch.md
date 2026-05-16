# SPEC: TIP-075 Remove Duplicate OCR Result Error Branch

## Behavioral Specs

### SPEC-001: Single error branch remains
- Given `OCRResultPage.tsx` has consecutive duplicate `if (error)` blocks
- When TIP-075 is implemented
- Then only one branch remains with unchanged behavior

### SPEC-002: Error rendering behavior preserved
- Given `useScan()` returns an error
- When `OCRResultPage` renders
- Then it still displays the same accessible `ErrorMessage` with retry

## Verification Commands
```powershell
npm exec vitest run src/__tests__/pages/OCRResultPage.test.tsx
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
```

## Green Gate

All commands pass.
