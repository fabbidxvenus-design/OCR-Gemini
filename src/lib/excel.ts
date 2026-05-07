import ExcelJS from 'exceljs';
import type { ScanRecord } from '@/db/schema';

// Helper to trigger download (works on desktop)
function triggerDownload(blob: Blob, filename: string): void {
  console.log('[Download] Attempting download:', filename, blob.size, 'bytes');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);

  // Force click for mobile browsers
  link.click();

  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  console.log('[Download] Download triggered');
}

// Helper to share file using Web Share API (best for mobile)
async function shareFile(blob: Blob, filename: string): Promise<boolean> {
  console.log('[Share] Attempting to share file:', filename, blob.size, 'bytes');

  // Check if Web Share API with file support is available
  if (navigator.share) {
    console.log('[Share] navigator.share exists');

    const file = new File([blob], filename, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
      console.log('[Share] navigator.canShare returns true');
      try {
        await navigator.share({
          files: [file],
          title: 'OCR Export',
          text: `Exported from OCR App`,
        });
        console.log('[Share] Share API success');
        return true;
      } catch (err) {
        // User cancelled or error - silently fallback to download
        // Do NOT show alert for recoverable errors (Permission denied, AbortError, etc.)
        console.log('[Share] Share API failed, falling back to download:', (err as Error).message);
      }
    } else {
      console.log('[Share] navigator.canShare not available or returns false');
    }
  } else {
    console.log('[Share] navigator.share not supported');
  }
  return false;
}

// Helper to save file using File System Access API
async function saveFileWithPicker(blob: Blob, filename: string): Promise<boolean> {
  console.log('[Picker] Attempting file picker:', filename);
  if ('showSaveFilePicker' in window) {
    console.log('[Picker] showSaveFilePicker exists');
    try {
      const handle = await (window as unknown as { showSaveFilePicker: (options: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Excel Files',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('[Picker] File picker success');
      return true;
    } catch (err) {
      console.log('[Picker] File picker cancelled or failed:', err);
      return false;
    }
  }
  console.log('[Picker] showSaveFilePicker not supported');
  return false;
}

export async function exportToExcel(scan: ScanRecord): Promise<void> {
  console.log('[Excel] exportToExcel called');
  console.log('[Excel] Scan title:', scan.ocrStructured?.title);
  console.log('[Excel] Image data URL length:', scan.imageDataUrl?.length);

  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
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
    const base64 = scan.imageDataUrl.split(',')[1];
    const imageId = workbook.addImage({
      base64,
      extension: 'jpeg',
    });

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

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Try different methods for mobile compatibility
  // Priority: Share > File Picker > Fallback download

  // 1. Try Web Share API (iOS/Android with file support)
  const shared = await shareFile(blob, filename);
  if (shared) {
    console.log('[Excel] Export successful via share:', filename);
    return;
  }

  // 2. Try File System Access API (Chrome desktop/Android)
  const saved = await saveFileWithPicker(blob, filename);
  if (saved) {
    console.log('[Excel] Export successful via file picker:', filename);
    return;
  }

  // 3. Fallback: trigger download (works on most browsers)
  triggerDownload(blob, filename);
  console.log('[Excel] Export successful via download:', filename);
}

/**
 * Export multiple scans to a single Excel file
 */
export async function exportMultipleToExcel(scans: ScanRecord[]): Promise<void> {
  console.log('[Excel] exportMultipleToExcel called, scans:', scans.length);

  const workbook = new ExcelJS.Workbook();

  scans.forEach((scan, index) => {
    const prefix = `Scan ${index + 1}`;
    const title = scan.ocrStructured?.title || `Scan ${index + 1}`;
    const safeName = title.substring(0, 25).replace(/[\\\\/:?*[\]]/g, '_');

    // Sheet: Summary
    const summarySheet = workbook.addWorksheet(`${prefix} ${safeName}`);
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

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Try different methods for mobile compatibility
  const shared = await shareFile(blob, filename);
  if (shared) {
    console.log('[Excel] Multi-export successful via share:', filename);
    return;
  }

  const saved = await saveFileWithPicker(blob, filename);
  if (saved) {
    console.log('[Excel] Multi-export successful via file picker:', filename);
    return;
  }

  triggerDownload(blob, filename);
  console.log('[Excel] Multi-export successful via download:', filename);
}