import { SCAN_FIELDS, findScanField } from '@/lib/scanFields';
import type { OCRResponse, ScanRecord } from '@/db/schema';
import { updateScan } from '@/hooks/useScans';
import { createError } from '@/lib/errorUtils';

export async function updateOcrField(
  scanId: string,
  scan: ScanRecord,
  fieldKey: string,
  value: string,
): Promise<{ updatedScan: ScanRecord; toastMsg: string }> {
  const currentOCR = scan.ocrStructured ?? { fields: [] };
  const currentFields = currentOCR.fields || [];

  const updatedFields = currentFields.map((f) => {
    const matched = findScanField(f.field);
    return matched?.key === fieldKey ? { ...f, value, confidence: 'high' as const } : f;
  });

  if (!updatedFields.some((f) => findScanField(f.field)?.key === fieldKey)) {
    const scanField = SCAN_FIELDS.find((sf) => sf.key === fieldKey);
    if (scanField) {
      updatedFields.push({
        field: scanField.labelVi,
        value,
        confidence: 'high',
        category: 'main',
      });
    }
  }

  const updatedOCR: OCRResponse = { ...currentOCR, fields: updatedFields };
  const updatedScan: ScanRecord = { ...scan, ocrStructured: updatedOCR };

  try {
    await updateScan(scanId, { ocrStructured: updatedOCR });
  } catch (_err) {
    throw createError('Không thể cập nhật scan', _err);
  }
  return { updatedScan, toastMsg: 'Đã lưu thay đổi' };
}
