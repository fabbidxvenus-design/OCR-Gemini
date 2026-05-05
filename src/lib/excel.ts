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
  if (scan.ocrStructured?.title) {
    summarySheet.addRow(['Title', scan.ocrStructured.title]);
    summarySheet.getRow(1).font = { bold: true };
  }

  // Structured fields
  if (scan.ocrStructured?.fields && scan.ocrStructured.fields.length > 0) {
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

  if (scan.ocrStructured?.sizes && scan.ocrStructured.sizes.length > 0) {
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

  if (scan.ocrStructured?.raw_text) {
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

/**
 * Export multiple scans to a single Excel file
 * Each scan gets its own section with Summary, Sizes, and Raw text sheets
 */
export async function exportMultipleToExcel(scans: ScanRecord[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  scans.forEach((scan, index) => {
    const prefix = `Scan ${index + 1}`;
    const title = scan.ocrStructured?.title || `Scan ${index + 1}`;
    const safeName = title.substring(0, 25).replace(/[\\/?*[\]]/g, '_');

    // Sheet: Summary
    const summarySheet = workbook.addWorksheet(`${prefix}: ${safeName}`);
    summarySheet.columns = [
      { width: 25 },
      { width: 40 },
    ];

    if (scan.ocrStructured?.title) {
      summarySheet.addRow(['Title', scan.ocrStructured.title]);
      summarySheet.getRow(1).font = { bold: true };
    }

    if (scan.ocrStructured?.fields && scan.ocrStructured.fields.length > 0) {
      summarySheet.addRow([]);
      summarySheet.addRow(['Field', 'Value']);
      summarySheet.getRow(summarySheet.rowCount).font = { bold: true };

      scan.ocrStructured.fields.forEach((field) => {
        summarySheet.addRow([field.field, field.value]);
      });
    }

    // Sheet: Sizes
    const sizesSheet = workbook.addWorksheet(`${prefix} Sizes`);
    sizesSheet.columns = [
      { header: 'Size', key: 'size', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 15 },
    ];
    sizesSheet.getRow(1).font = { bold: true };

    if (scan.ocrStructured?.sizes && scan.ocrStructured.sizes.length > 0) {
      scan.ocrStructured.sizes.forEach((size) => {
        sizesSheet.addRow({
          size: size.size,
          quantity: size.quantity,
        });
      });
    }

    // Sheet: Raw OCR
    const rawSheet = workbook.addWorksheet(`${prefix} Raw`);
    rawSheet.columns = [{ width: 80 }];

    if (scan.ocrStructured?.raw_text) {
      const cell = rawSheet.getCell('A1');
      cell.value = scan.ocrStructured.raw_text;
      cell.alignment = { wrapText: true, vertical: 'top' };
      cell.font = { name: 'Courier New', size: 10 };
    }
  });

  // Generate filename with count
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
  const filename = `OCR_${scans.length}scans_${timestamp}.xlsx`;

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('[Excel] Multi-export successful:', filename, `(${scans.length} scans)`);
}