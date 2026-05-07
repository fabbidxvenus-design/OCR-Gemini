# TIP-012: Excel Export (ExcelJS)

## HEADER
- **TIP-ID**: TIP-012
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Export
- **Priority**: P0
- **Depends on**: TIP-010, TIP-011
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + ExcelJS 4
- **Key files to read first**: 
  - `BUILDER-HANDOFF.md` (Excel multi-sheet structure from Python scripts)
  - `src/pages/OCRResultPage.tsx` (export button)
- **Patterns to follow**: Multi-sheet Excel format matching Python script output (Summary, Sizes, Raw OCR, Image, Billing)

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Implement Excel export functionality using ExcelJS library. Create multi-sheet workbook matching Python script format: Summary (structured fields), Sizes (size table), Raw OCR (raw text), Image (embedded image), and Billing (token usage and cost). Generate downloadable .xlsx file with proper formatting and column widths.

---

## SPECIFICATIONS

### Business Rules

1. **Sheet structure**: 5 sheets - Summary, Sizes, Raw OCR, Image, Billing
2. **Summary sheet**: Title + structured fields in 2-column layout
3. **Sizes sheet**: Table with Size and Quantity columns
4. **Raw OCR sheet**: Raw text in single merged cell
5. **Image sheet**: Embedded captured image
6. **Billing sheet**: Token usage (input, output, total, cost)
7. **Filename**: `OCR_[timestamp].xlsx` (e.g., `OCR_20260505_025703.xlsx`)
8. **Download**: Trigger browser download automatically

### Excel Export Utility

**src/lib/excel.ts**:
```typescript
import ExcelJS from 'exceljs';
import type { ScanRecord } from '@/db/schema';

export async function exportToExcel(scan: ScanRecord): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { width: 25 },
    { width: 40 },
  ];

  // Title
  if (scan.ocrStructured.title) {
    summarySheet.addRow(['Title', scan.ocrStructured.title]);
    summarySheet.getRow(1).font = { bold: true };
  }

  // Structured fields
  if (scan.ocrStructured.fields && scan.ocrStructured.fields.length > 0) {
    summarySheet.addRow([]); // Empty row
    summarySheet.addRow(['Field', 'Value']);
    summarySheet.getRow(summarySheet.rowCount).font = { bold: true };
    
    scan.ocrStructured.fields.forEach((field) => {
      summarySheet.addRow([field.field, field.value]);
    });
  }

  // Sheet 2: Sizes
  const sizesSheet = workbook.addWorksheet('Sizes');
  sizesSheet.columns = [
    { header: 'Size', key: 'size', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 15 },
  ];
  sizesSheet.getRow(1).font = { bold: true };

  if (scan.ocrStructured.sizes && scan.ocrStructured.sizes.length > 0) {
    scan.ocrStructured.sizes.forEach((size) => {
      sizesSheet.addRow({
        size: size.size,
        quantity: size.quantity,
      });
    });
  }

  // Sheet 3: Raw OCR
  const rawSheet = workbook.addWorksheet('Raw OCR');
  rawSheet.columns = [{ width: 80 }];
  
  if (scan.ocrStructured.raw_text) {
    const cell = rawSheet.getCell('A1');
    cell.value = scan.ocrStructured.raw_text;
    cell.alignment = { wrapText: true, vertical: 'top' };
    cell.font = { name: 'Courier New', size: 10 };
  }

  // Sheet 4: Image
  const imageSheet = workbook.addWorksheet('Image');
  
  try {
    // Convert blob to base64
    const base64 = scan.imageDataUrl.split(',')[1];
    const imageId = workbook.addImage({
      base64,
      extension: 'jpeg',
    });

    // Add image to sheet (A1, scaled to fit)
    imageSheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 600, height: 800 },
    });
  } catch (error) {
    console.error('[Excel] Failed to add image:', error);
    imageSheet.getCell('A1').value = 'Failed to embed image';
  }

  // Sheet 5: Billing
  const billingSheet = workbook.addWorksheet('Billing');
  billingSheet.columns = [
    { width: 25 },
    { width: 20 },
  ];

  billingSheet.addRow(['Metric', 'Value']);
  billingSheet.getRow(1).font = { bold: true };
  
  billingSheet.addRow(['Input Tokens', scan.tokenUsage.input]);
  billingSheet.addRow(['Output Tokens', scan.tokenUsage.output]);
  billingSheet.addRow(['Total Tokens', scan.tokenUsage.input + scan.tokenUsage.output]);
  billingSheet.addRow(['Cost (USD)', `$${scan.tokenUsage.cost.toFixed(6)}`]);
  billingSheet.addRow(['Timestamp', scan.timestamp.toLocaleString('vi-VN')]);

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
  const filename = `OCR_${timestamp}.xlsx`;

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('[Excel] Export successful:', filename);
}
```

### Export Hook

**src/hooks/useExport.ts**:
```typescript
import { useState } from 'react';
import { exportToExcel } from '@/lib/excel';
import type { ScanRecord } from '@/db/schema';

interface UseExportReturn {
  isExporting: boolean;
  error: string | null;
  exportScan: (scan: ScanRecord) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportScan = async (scan: ScanRecord) => {
    setIsExporting(true);
    setError(null);

    try {
      await exportToExcel(scan);
    } catch (err) {
      console.error('[Export] Error:', err);
      setError('Không thể xuất file Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportScan,
  };
}
```

### Updated OCR Result Page

**src/pages/OCRResultPage.tsx** (update handleExport):
```typescript
import { useExport } from '@/hooks/useExport';

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isExporting, error: exportError, exportScan } = useExport();
  const [expandedSections, setExpandedSections] = useState({
    fields: true,
    sizes: true,
    rawText: false,
    notes: false,
  });

  // ... existing code ...

  const handleExport = async () => {
    if (!scan) return;
    await exportScan(scan);
  };

  // ... rest of component ...

  return (
    <Layout title="Kết quả OCR">
      <div className="p-4 space-y-4 pb-20">
        {/* ... existing sections ... */}

        {/* Export Error */}
        {exportError && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <p className="text-error text-sm">{exportError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors touch-target"
            >
              <Edit className="w-5 h-5" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Xuất Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

### Validation

1. **Sheet structure**: 5 sheets with correct names
2. **Summary formatting**: Bold headers, proper column widths
3. **Sizes table**: Headers in row 1, data below
4. **Raw text**: Wrapped text, monospace font
5. **Image**: Embedded and scaled properly
6. **Billing**: Token usage and cost formatted correctly
7. **Download**: File downloads automatically with correct filename

### Error Handling

- **Export failure**: Show error message, allow retry
- **Image embed failure**: Log error, show placeholder text
- **Missing data**: Handle gracefully (empty sheets)

---

## ACCEPTANCE CRITERIA

### AC-001: Export Button
- **Given**: User is on OCR result page
- **When**: User taps "Xuất Excel" button
- **Then**:
  - Button shows loading state: "Đang xuất..."
  - Button is disabled during export
  - Export process starts

### AC-002: Summary Sheet
- **Given**: Scan has title "INVOICE #12345" and 3 fields
- **When**: Excel file is generated
- **Then**:
  - Sheet 1 is named "Summary"
  - Row 1: "Title" | "INVOICE #12345" (bold)
  - Row 3: "Field" | "Value" (bold, header row)
  - Rows 4-6: Field data
  - Column widths: 25, 40

### AC-003: Sizes Sheet
- **Given**: Scan has sizes [{"size": "M", "quantity": 10}, {"size": "L", "quantity": 15}]
- **When**: Excel file is generated
- **Then**:
  - Sheet 2 is named "Sizes"
  - Row 1: "Size" | "Quantity" (bold headers)
  - Row 2: "M" | 10
  - Row 3: "L" | 15
  - Column widths: 15, 15

### AC-004: Raw OCR Sheet
- **Given**: Scan has raw_text with multiple lines
- **When**: Excel file is generated
- **Then**:
  - Sheet 3 is named "Raw OCR"
  - Cell A1 contains full raw text
  - Text wrapping is enabled
  - Font is Courier New, size 10
  - Column width: 80

### AC-005: Image Sheet
- **Given**: Scan has imageDataUrl
- **When**: Excel file is generated
- **Then**:
  - Sheet 4 is named "Image"
  - Image is embedded starting at A1
  - Image is scaled to 600x800
  - Image is visible when opening Excel

### AC-006: Billing Sheet
- **Given**: Scan has tokenUsage {input: 1000, output: 500, cost: 0.000125}
- **When**: Excel file is generated
- **Then**:
  - Sheet 5 is named "Billing"
  - Row 1: "Metric" | "Value" (bold)
  - Row 2: "Input Tokens" | 1000
  - Row 3: "Output Tokens" | 500
  - Row 4: "Total Tokens" | 1500
  - Row 5: "Cost (USD)" | "$0.000125"
  - Row 6: "Timestamp" | [formatted date]

### AC-007: Filename
- **Given**: Current time is 2026-05-05 02:57:03
- **When**: Excel file is generated
- **Then**:
  - Filename is "OCR_20260505_025703.xlsx"
  - File downloads automatically
  - No prompt for save location (browser default)

### AC-008: Download Success
- **Given**: Export completes successfully
- **When**: File is generated
- **Then**:
  - File downloads to browser's default download folder
  - Console logs: "[Excel] Export successful: OCR_20260505_025703.xlsx"
  - Button returns to normal state
  - No error message displays

### AC-009: Export Error
- **Given**: Export fails (e.g., out of memory)
- **When**: Error occurs
- **Then**:
  - Error message displays: "Không thể xuất file Excel. Vui lòng thử lại."
  - Button returns to normal state
  - User can retry export

### AC-010: Empty Data Handling
- **Given**: Scan has no sizes
- **When**: Excel file is generated
- **Then**:
  - Sizes sheet exists but is empty (only headers)
  - No error occurs
  - Other sheets populate normally

---

## CONSTRAINTS

### DO NOT:
- ❌ Use server-side export — client-side only for POC
- ❌ Add PDF export — Excel only for MVP
- ❌ Implement custom templates — use standard format
- ❌ Add chart generation — data only
- ❌ Support .xls format — .xlsx only
- ❌ Add password protection — open files only

### REUSE:
- ✅ ExcelJS library (matches Python openpyxl functionality)
- ✅ Multi-sheet structure from Python scripts
- ✅ Existing scan data from IndexedDB
- ✅ useExport hook pattern

### SKIP (out of scope for TIP-012):
- ⏭️ PDF export
- ⏭️ CSV export
- ⏭️ Custom templates
- ⏭️ Charts and graphs
- ⏭️ Password protection
- ⏭️ Email integration

---

## COMPLETION CHECKLIST

- [ ] `src/lib/excel.ts` created
- [ ] `src/hooks/useExport.ts` created
- [ ] `src/pages/OCRResultPage.tsx` updated
- [ ] ExcelJS installed (`npm install exceljs`)
- [ ] Summary sheet generates correctly
- [ ] Sizes sheet generates correctly
- [ ] Raw OCR sheet generates correctly
- [ ] Image sheet embeds image
- [ ] Billing sheet shows token usage
- [ ] Filename format correct
- [ ] File downloads automatically
- [ ] Loading state works
- [ ] Error handling works
- [ ] Empty data handled gracefully
- [ ] No TypeScript errors
- [ ] No console errors

---

## NOTES FOR BUILDER

1. **Install dependency**: `npm install exceljs` and `npm install --save-dev @types/exceljs`
2. **Image format**: ExcelJS expects base64 without data URL prefix
3. **Column widths**: Match Python script output for consistency
4. **Filename**: Use ISO format without colons (Windows compatibility)
5. **Testing**: Test with real scan data, verify Excel opens correctly
6. **Mobile**: File downloads work on mobile browsers (may save to Downloads folder)

---

*TIP-012 | Generated: 2026-05-05 | Vibecode Kit v5.0*
