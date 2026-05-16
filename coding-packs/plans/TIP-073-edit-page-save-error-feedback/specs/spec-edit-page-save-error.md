# SPEC: TIP-073 Edit Page Save Error Feedback

## Behavioral Specs

### SPEC-001: Failed save shows accessible error
- Given `updateScan()` rejects
- When the user submits `EditPage`
- Then the page shows a Vietnamese save error and does not navigate away

### SPEC-002: Successful save behavior preserved
- Given `updateScan()` resolves
- When the user submits `EditPage`
- Then the page navigates to `/ocr-result/:scanId` as before

### SPEC-003: Retry clears previous save error
- Given a save error is visible
- When the user submits again
- Then the previous error is cleared before the new save attempt

### SPEC-004: Duplicate submit guarded while saving
- Given a save is in progress
- When the user attempts another save
- Then duplicate save submission is prevented by disabled UI or submit guard

## Verification Commands
```powershell
npm exec vitest run src/__tests__/pages/EditPage.test.tsx
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
```

## Green Gate

All commands pass.
