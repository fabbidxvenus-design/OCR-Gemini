# TIP-024: Fix Search Bug in History Page

## HEADER
- TIP-ID: TIP-024
- Project: OCR Gemini Mobile Web
- Module: History/Search
- Priority: P1
- Depends on: TIP-013
- Estimated: S

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: Vite + React 18 + TypeScript + Tailwind CSS + Dexie.js
- Key files to read first:
  - `src/hooks/useScans.ts` (contains search function with bug)
  - `src/pages/HistoryPage.tsx` (uses search)
- Bug: Search crashes when field value is null/undefined

## APPLICABLE STANDARDS
- none

## TASK
Fix the search functionality in the history page. The current implementation crashes when a scan's field has a null or undefined `value` property, causing `.toLowerCase()` to throw an error.

## SPECIFICATIONS

### Bug Analysis
**Current Code (line 44-46 in useScans.ts):**
```typescript
if (scan.ocrStructured.fields?.some(
  (f) => f.value.toLowerCase().includes(lowerQuery)
)) {
```

**Problem:**
- `f.value` can be `null`, `undefined`, or not a string
- Calling `.toLowerCase()` on non-string throws TypeError

**Solution:**
- Add null check and type coercion: `f.value?.toLowerCase?.() ?? ''`
- This safely handles undefined/null values

### Fix Required
```typescript
// OLD (broken):
if (scan.ocrStructured.fields?.some(
  (f) => f.value.toLowerCase().includes(lowerQuery)
)) {

// NEW (fixed):
if (scan.ocrStructured.fields?.some(
  (f) => (f.value ?? '').toString().toLowerCase().includes(lowerQuery)
)) {
```

### Also Fix Same Issue for title
```typescript
// OLD:
if (scan.ocrStructured.title?.toLowerCase().includes(lowerQuery)) {

// NEW:
if ((scan.ocrStructured.title ?? '').toString().toLowerCase().includes(lowerQuery)) {
```

## ACCEPTANCE CRITERIA
- Given **Search with scans having null field values** When **User types in search** Then **No crash, results filter correctly**
- Given **Search with empty title** When **User types** Then **No crash**
- Given **Build** When **Run** Then **Pass without errors**

## CONSTRAINTS
- DO NOT: Change search logic or performance (only fix null safety)
- REUSE: Keep existing filter patterns
- SKIP: UI changes (search box already works)

## FILES TO MODIFY

1. **src/hooks/useScans.ts**
   - Fix `useSearchScans` function null safety
   - Lines 40 and 44-46 need null checks