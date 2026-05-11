# Excel Multi-Sheet Structure

## Rule

Export OCR scans as multi-sheet Excel workbooks: Summary (fields), Sizes (table), Raw OCR (text), Image (embedded), Billing (token usage).

**Why:** Warehouse users need structured data (Summary/Sizes) for data entry, raw text for verification, embedded image for visual reference, and billing for cost tracking. Separate sheets keep each concern isolated and easy to navigate.

**How to apply:**

- Sheet 1 (Summary): Two-column layout, field names in column A, values in column B. Bold header row.
- Sheet 2 (Sizes): Table with headers "Size" and "Quantity". Bold header row.
- Sheet 3 (Raw OCR): Single column, full-width, wrap text, monospace font (Courier New).
- Sheet 4 (Image): Embedded JPEG from base64 data URL, scaled to ~600x800px.
- Sheet 5 (Billing): Two-column layout, metrics (Input Tokens, Output Tokens, Cost, Timestamp) in column A, values in column B.
- For multi-scan exports, prefix each sheet with "Scan N" (e.g., "Scan 1 Summary", "Scan 1 Sizes").

## Code Example

```typescript
// src/lib/excel.ts pattern
const workbook = new ExcelJS.Workbook();

// Sheet 1: Summary
const summarySheet = workbook.addWorksheet('Summary');
summarySheet.columns = [{ width: 25 }, { width: 40 }];
if (scan.ocrStructured?.title) {
  summarySheet.addRow(['Title', scan.ocrStructured.title]);
  summarySheet.getRow(1).font = { bold: true };
}
summarySheet.addRow([]);
summarySheet.addRow(['Field', 'Value']);
summarySheet.getRow(summarySheet.rowCount).font = { bold: true };
scan.ocrStructured.fields.forEach((field) => {
  summarySheet.addRow([field.field, field.value]);
});

// Sheet 2: Sizes
const sizesSheet = workbook.addWorksheet('Sizes');
sizesSheet.columns = [
  { header: 'Size', key: 'size', width: 15 },
  { header: 'Quantity', key: 'quantity', width: 15 },
];
sizesSheet.getRow(1).font = { bold: true };
scan.ocrStructured.sizes.forEach((size) => {
  sizesSheet.addRow({ size: size.size, quantity: size.quantity });
});

// Sheet 3: Raw OCR
const rawSheet = workbook.addWorksheet('Raw OCR');
rawSheet.columns = [{ width: 80 }];
const cell = rawSheet.getCell('A1');
cell.value = scan.ocrStructured.raw_text;
cell.alignment = { wrapText: true, vertical: 'top' };
cell.font = { name: 'Courier New', size: 10 };

// Sheet 4: Image
const imageSheet = workbook.addWorksheet('Image');
const base64 = scan.imageDataUrl.split(',')[1];
const imageId = workbook.addImage({ base64, extension: 'jpeg' });
imageSheet.addImage(imageId, {
  tl: { col: 0, row: 0 },
  ext: { width: 600, height: 800 },
});

// Sheet 5: Billing
const billingSheet = workbook.addWorksheet('Billing');
billingSheet.columns = [{ width: 25 }, { width: 20 }];
billingSheet.addRow(['Metric', 'Value']);
billingSheet.getRow(1).font = { bold: true };
billingSheet.addRow(['Input Tokens', scan.tokenUsage.input]);
billingSheet.addRow(['Output Tokens', scan.tokenUsage.output]);
billingSheet.addRow(['Cost (USD)', `$${scan.tokenUsage.cost.toFixed(6)}`]);
```

## Exceptions

- For bulk exports with >10 scans, omit Image sheets to reduce file size.
- For internal analytics exports, add a sixth sheet with aggregated stats.
