# TIP-041: Scan Display Name - Product Name Priority

## HEADER
- TIP-ID: TIP-041
- Project: OCR Gemini Mobile Web
- Module: Display Logic (src/lib/scanDisplayName.ts)
- Priority: P1
- Depends on: TIP-038 (Field categorization)
- Estimated: S (2 hours)

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18 + TypeScript + Dexie (IndexedDB)
- Key files to read first:
  - `src/lib/fieldCategories.ts` (field patterns for categorization)
  - `src/db/schema.ts` (OCRResponse type definition)
  - `src/pages/HistoryPage.tsx` (display usage)
- Patterns to follow: Immutable data transformation, single source of truth

## TASK
Create a utility function that determines the display name for a scan based on product_name priority with fallback to other important main fields. This ensures consistent naming across all scan displays (History, Detail, Excel export).

## SPECIFICATIONS

### Business Rules

1. **Primary: product_name field**
   - If `fields` contains a field with normalized name matching product_name patterns, use its `value`
   - Patterns to match (case-insensitive):
     - `product_name`, `product name`
     - `tên sản phẩm`, `ten san pham`, `tên sp`, `ten sp`
     - `item name`, `item_name`
     - `san pham`, `san_pham`, `sp`
     - `商品名`, `製品名`, `product`

2. **Fallback priority order** (when product_name is missing):
   - `contract_no`, `contract no`, `số hợp đồng`, `so hop dong`, `order_no`
   - `lot_no`, `lot number`, `số lô`, `so lo`
   - `barcode`, `mã vạch`, `バーコード`
   - First available field from main category
   - First available field from other category
   - Fallback: `"Scan #[timestamp]"`

3. **Normalization rules**:
   - Trim whitespace from field names before matching
   - Case-insensitive matching
   - Handle both snake_case and spaces

### Data Flow
```
ScanRecord (ocrStructured: OCRResponse)
  ↓
scanDisplayName(scan) → string
  ↓
Used by: HistoryPage, HistoryDetailPage, ExcelExport, etc.
```

### Implementation Location
Create `src/lib/scanDisplayName.ts` with:
- `scanDisplayName(scan: ScanRecord): string` - Main function
- Helper: `normalizeFieldName(name: string): string`
- Helper: `findFieldByPattern(fields: Field[], patterns: RegExp[]): Field | null`

## ACCEPTANCE CRITERIA

- Given a scan with `product_name: "áo phông ABC"` in fields
- When displaying in History list
- Then the title should show "áo phông ABC" instead of raw OCR text

- Given a scan without product_name but has `contract_no: "HD-2024-001"`
- When displaying in History list
- Then the title should show "HD-2024-001"

- Given a scan with only non-main fields (e.g., address, phone)
- When displaying in History list
- Then use the first available field value

- Given a scan with no fields (empty array)
- When displaying in History list
- Then use fallback format "Scan #[date-timestamp]"

- Given a scan with all field values as empty strings
- When displaying in History list
- Then use fallback format

## CONSTRAINTS
- DO NOT: Modify database schema - use existing OCRResponse structure
- DO NOT: Hardcode Vietnamese text - support i18n later
- REUSE: `categorizeField()` and `MAIN_FIELD_PATTERNS` from `src/lib/fieldCategories.ts`
- SKIP: Excel export filename (already handled in TIP-012)
- SKIP: Localization of fallback message

## FILES TO CREATE
- `src/lib/scanDisplayName.ts` - New utility with display name logic

## FILES TO MODIFY
- `src/pages/HistoryPage.tsx` - Use `scanDisplayName()` for title display
- `src/pages/HistoryDetailPage.tsx` - Use `scanDisplayName()` for header
- Other places where `scan.ocrStructured?.title` is used for display

## DEBUG STEPS
1. Log field names and values to verify categorization
2. Test with various OCR responses (product_name only, contract only, mixed)
3. Verify fallback works when no meaningful fields exist