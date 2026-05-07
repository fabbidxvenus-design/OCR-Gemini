# TIP-038: Field Categorization - Main vs Other

## HEADER
- TIP-ID: TIP-038
- Project: OCR Mobile Web
- Module: OCR Display & Edit
- Priority: P1
- Depends on: TIP-009 (OCR Display), TIP-010 (Edit Fields)
- Estimated: M (4-6 hours)

## CONTEXT
- Working dir: `D:\scripts\ocr_gemini\ocr-mobile-web`
- Tech stack: React 18 + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB)
- Key files to read first:
  - `src/db/schema.ts` - OCRField interface
  - `src/lib/gemini.ts` - OCR prompt
  - `src/pages/OCRResultPage.tsx` - Display OCR results
  - `src/pages/EditPage.tsx` - Edit fields form
- Patterns to follow:
  - Immutable state updates
  - TypeScript interfaces for data models
  - Tailwind utility classes for styling

## APPLICABLE STANDARDS
none

## TASK
Categorize OCR fields into two groups: **Main** (critical fields) and **Other** (additional fields). Main fields include: Barcode, Lot No, Tên/Mã sản phẩm, Số lượng/Size, Contract No. All other detected fields go into Other category. Update UI to display fields in separate sections with visual hierarchy.

## SPECIFICATIONS

### Business Rules

1. **Main Fields** (Priority fields - always displayed first):
   - Barcode
   - Lot No
   - Tên sản phẩm / Mã sản phẩm
   - Số lượng / Size
   - Contract No

2. **Other Fields** (Additional fields - displayed after Main):
   - Any field not matching Main category
   - Examples: Ngày sản xuất, Xuất xứ, Ghi chú, etc.

3. **Field Matching Logic**:
   - Case-insensitive matching
   - Partial match allowed (e.g., "Barcode", "Bar code", "Mã vạch" all match Barcode)
   - Vietnamese and English variants supported

4. **Display Order**:
   - Main section first (with visual emphasis)
   - Other section second (collapsible or less prominent)
   - Within each section: preserve OCR detection order

### Database Schema Updates

Update `src/db/schema.ts`:

```typescript
export interface OCRField {
  field: string;
  value: string;
  confidence?: 'high' | 'medium' | 'low';
  category?: 'main' | 'other'; // Add this field
}
```

### Field Categorization Logic

Create `src/lib/fieldCategories.ts`:

```typescript
export type FieldCategory = 'main' | 'other';

export const MAIN_FIELD_PATTERNS = [
  // Barcode
  /barcode/i,
  /bar\s*code/i,
  /mã\s*vạch/i,
  
  // Lot No
  /lot\s*no/i,
  /lot\s*number/i,
  /số\s*lô/i,
  /lô\s*hàng/i,
  
  // Product name/code
  /tên\s*sản\s*phẩm/i,
  /mã\s*sản\s*phẩm/i,
  /product\s*name/i,
  /product\s*code/i,
  /item\s*name/i,
  /item\s*code/i,
  
  // Quantity/Size
  /số\s*lượng/i,
  /quantity/i,
  /qty/i,
  /size/i,
  /kích\s*thước/i,
  
  // Contract No
  /contract\s*no/i,
  /contract\s*number/i,
  /số\s*hợp\s*đồng/i,
  /hợp\s*đồng/i,
];

export function categorizeField(fieldName: string): FieldCategory {
  const normalized = fieldName.trim();
  
  for (const pattern of MAIN_FIELD_PATTERNS) {
    if (pattern.test(normalized)) {
      return 'main';
    }
  }
  
  return 'other';
}

export function categorizeFields(fields: OCRField[]): OCRField[] {
  return fields.map(field => ({
    ...field,
    category: categorizeField(field.field)
  }));
}
```

### OCR Prompt Update

Update `src/lib/gemini.ts` OCR_PROMPT to prioritize Main fields:

```typescript
const OCR_PROMPT = `OCR hóa đơn/nhãn dán tiếng Việt. Trả về JSON:
{"title":"","fields":[{"field":"","value":"","conf":"high/medium/low"}],"sizes":[{"size":"","qty":0}],"raw":"","notes":[]}

Ưu tiên đọc các trường QUAN TRỌNG:
- Barcode / Mã vạch
- Lot No / Số lô
- Tên sản phẩm / Mã sản phẩm
- Số lượng / Size
- Contract No / Số hợp đồng

Sau đó đọc các trường khác. conf: high(>90%), medium(70-90%), low(<70%).`;
```

### UI Updates

#### OCRResultPage.tsx - Display with Categories

```tsx
// Group fields by category
const mainFields = fields.filter(f => f.category === 'main');
const otherFields = fields.filter(f => f.category === 'other');

// Render Main section
<div className="bg-card rounded-xl border border-card-border p-4 mb-3">
  <h3 className="text-sm font-semibold text-primary uppercase mb-3">
    Thông tin chính
  </h3>
  {mainFields.map((field, index) => (
    <div key={index} className="mb-2">
      <span className="text-xs text-text-secondary">{field.field}</span>
      <p className="text-base font-semibold text-text-primary">{field.value}</p>
    </div>
  ))}
</div>

// Render Other section (collapsible)
{otherFields.length > 0 && (
  <div className="bg-surface rounded-xl border border-card-border p-4">
    <button onClick={() => setShowOther(!showOther)} className="w-full flex justify-between">
      <h3 className="text-sm font-medium text-text-secondary uppercase">
        Thông tin khác ({otherFields.length})
      </h3>
      <ChevronDown className={showOther ? 'rotate-180' : ''} />
    </button>
    {showOther && (
      <div className="mt-3">
        {otherFields.map((field, index) => (
          <div key={index} className="mb-2">
            <span className="text-xs text-text-secondary">{field.field}</span>
            <p className="text-sm text-text-primary">{field.value}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

#### EditPage.tsx - Edit with Categories

Similar grouping in edit form:
- Main fields: Larger inputs, always visible
- Other fields: Smaller inputs, collapsible section

### Validation

1. All fields must have a category ('main' or 'other')
2. Field categorization must be deterministic (same input → same category)
3. Empty field names default to 'other' category

### Error Handling

1. If categorization fails → default to 'other' category
2. If no main fields detected → show message "Không tìm thấy thông tin chính"
3. If field.category is undefined → auto-categorize on display

## ACCEPTANCE CRITERIA

**Given** OCR detects fields including "Barcode" and "Ngày sản xuất"  
**When** user views OCR result  
**Then** "Barcode" appears in "Thông tin chính" section and "Ngày sản xuất" appears in "Thông tin khác" section

**Given** OCR detects "Lot No" field  
**When** user views OCR result  
**Then** "Lot No" is categorized as 'main' and displayed prominently

**Given** OCR detects "Mã vạch" (Vietnamese for Barcode)  
**When** field categorization runs  
**Then** "Mã vạch" is correctly matched as 'main' category

**Given** user edits a scan with categorized fields  
**When** user saves changes  
**Then** field categories are preserved in IndexedDB

**Given** OCR detects 10 fields (3 main, 7 other)  
**When** user views result  
**Then** Main section shows 3 fields prominently, Other section is collapsible with 7 fields

## CONSTRAINTS

### DO NOT
- Do not remove existing fields from OCR response
- Do not change field names during categorization
- Do not modify confidence scores
- Do not break existing Edit functionality

### REUSE
- Existing `OCRField` interface from `src/db/schema.ts`
- Existing field display components
- Existing Tailwind design tokens

### SKIP
- Custom field category configuration (hardcoded patterns for MVP)
- Multi-language UI (Vietnamese only)
- Field reordering within categories
- Analytics per field category

## IMPLEMENTATION CHECKLIST

- [ ] Update `src/db/schema.ts` - Add `category` field to `OCRField`
- [ ] Create `src/lib/fieldCategories.ts` - Categorization logic
- [ ] Update `src/lib/gemini.ts` - Enhanced OCR prompt
- [ ] Create `src/hooks/useCategorizedFields.ts` - Hook to categorize fields
- [ ] Update `src/pages/OCRResultPage.tsx` - Display Main/Other sections
- [ ] Update `src/pages/EditPage.tsx` - Edit form with categories
- [ ] Update `src/pages/HistoryDetailPage.tsx` - Detail view with categories
- [ ] Test field matching with Vietnamese and English variants
- [ ] Test collapsible Other section
- [ ] Verify categories persist in IndexedDB

## FILES TO CREATE
- `src/lib/fieldCategories.ts` - Field categorization logic
- `src/hooks/useCategorizedFields.ts` - Categorization hook (optional)

## FILES TO MODIFY
- `src/db/schema.ts` - Add `category` to `OCRField`
- `src/lib/gemini.ts` - Update OCR prompt
- `src/pages/OCRResultPage.tsx` - Display with categories
- `src/pages/EditPage.tsx` - Edit with categories
- `src/pages/HistoryDetailPage.tsx` - Detail view with categories

---

**Quality Gate: Self-Review**

✅ Task clearly defined: Categorize fields into Main (5 types) and Other  
✅ Field patterns specified: Regex patterns for Vietnamese + English  
✅ Database schema updated: Add `category` field to `OCRField`  
✅ UI mockups provided: Main section (prominent) + Other section (collapsible)  
✅ Acceptance criteria: 5 scenarios covering categorization, display, and persistence  
✅ Constraints documented: DO NOT, REUSE, SKIP sections  
✅ Implementation checklist: 10 steps with file paths  

⚠️ **Open item**: Field pattern matching may need tuning based on real invoice data. Consider adding pattern configuration in future.

**Confidence**: 90% - Clear requirements, straightforward categorization logic, main risk is pattern matching accuracy on real data.

---

*TIP-038 | Generated: 2026-05-07 | Framework: Vibecode Kit v5.0*
