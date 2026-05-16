# SPEC: TIP-074 localOcrScans writeLocalRemoteIds Quota Error Handling

## Behavioral Specs

### SPEC-001: writeLocalRemoteIds handles quota errors gracefully
- Given `writeLocalRemoteIds()` is called when localStorage is full
- When the call happens
- Then no exception propagates; a warning is logged and the function returns normally

### SPEC-002: Normal path behavior unchanged
- Given `writeLocalRemoteIds()` is called with valid data and localStorage is not full
- When the call happens
- Then data is persisted as before

## Verification Commands
```powershell
npm run build
npx tsc --noEmit
npx eslint --max-warnings 0 src/
npm exec vitest run
```

## Green Gate

All commands pass.