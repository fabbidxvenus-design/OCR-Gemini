/**
 * Fixed scan field definitions for HLVN OCR
 * 5 hardcoded main fields with required/optional status
 */

export interface ScanField {
  /** Unique field key */
  key: 'barcode' | 'lotNo' | 'productName' | 'quantity' | 'contractNo';
  /** Vietnamese label */
  labelVi: string;
  /** English label */
  labelEn: string;
  /** Field name pattern for OCR matching */
  patterns: string[];
  /** Whether this field is required */
  required: boolean;
  /** Display order */
  order: number;
}

export const SCAN_FIELDS: ScanField[] = [
  {
    key: 'barcode',
    labelVi: 'Mã vạch',
    labelEn: 'Barcode',
    patterns: [
      'barcode', 'bar_code', 'mã vạch', 'ma vach',
      'バーコード', 'バーコード番号', 'bar code',
    ],
    required: true,
    order: 1,
  },
  {
    key: 'lotNo',
    labelVi: 'Lot No.',
    labelEn: 'Lot No.',
    patterns: [
      'lot no.', 'lot no', 'lot number', 'batch no.', 'batch number',
      'lote no', 'số lô', 'so lo', 'lô sx', 'lo sx',
      'batch', 'ロット', 'lot_no', 'batch_no',
    ],
    required: true,
    order: 2,
  },
  {
    key: 'productName',
    labelVi: 'Tên/Mã sản phẩm',
    labelEn: 'Product Name/Code',
    patterns: [
      'tên sản phẩm', 'ten san pham', 'product name', 'product_name',
      'item name', 'tên sp', 'ten sp', 'tên hàng', 'ten hang',
      'mã sản phẩm', 'ma san pham', 'product code', 'product_code',
      'item code', 'mã sp', 'ma sp', 'mã hàng', 'ma hang',
      'mã', 'code', 'code no', '商品名', '製品名', '商品コード',
      'sp', 'product',
    ],
    required: true,
    order: 3,
  },
  {
    key: 'quantity',
    labelVi: 'Số lượng (Qty/Size)',
    labelEn: 'Quantity (Qty/Size)',
    patterns: [
      'số lượng', 'so luong', 'quantity', 'qty', 'sl',
      'size', 'kích thước', 'kich thuoc', 'dimension',
      '数量', '个数', 'qty',
    ],
    required: true,
    order: 4,
  },
  {
    key: 'contractNo',
    labelVi: 'Contract No. (Số HĐ)',
    labelEn: 'Contract No.',
    patterns: [
      'contract no.', 'contract no', 'contract number', 'contract_no',
      'contract', 'ct no.', 'ct no', 'số hợp đồng', 'so hop dong',
      'số hđ', 'so hd', 'hợp đồng', 'hop dong',
      'đơn hàng', 'don hang', 'order no.', 'order number', 'order_no',
      '注文番号', '契約 no.', '契約番号', '契約No.', '契約No', 'order',
    ],
    required: false,
    order: 5,
  },
];

/**
 * Find the best matching scan field for an OCR field
 */
export function findScanField(fieldName: string): ScanField | undefined {
  const normalized = fieldName.trim().toLowerCase();

  for (const scanField of SCAN_FIELDS) {
    for (const pattern of scanField.patterns) {
      if (normalized === pattern.toLowerCase()) {
        return scanField;
      }
    }
  }
  return undefined;
}

/**
 * Check if a field matches any scan field patterns
 */
export function matchesScanField(fieldName: string): boolean {
  return findScanField(fieldName) !== undefined;
}

/**
 * Normalize OCR fields for edit surfaces
 * Always returns all 5 required scan fields with values from OCR or empty string
 * Preserves extra/other fields from OCR for the "other" section
 */
import type { OCRField } from '@/db/schema';

export interface NormalizedField {
  field: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export function normalizeFieldsForEdit(ocrFields: OCRField[]): NormalizedField[] {
  const processedFields = ocrFields.filter((f) => f.field !== 'rawText' && f.field !== 'raw_text');
  const result: NormalizedField[] = [];
  const usedKeys = new Set<string>();

  // Map OCR field names to SCAN_FIELDS keys
  const ocrToScanKey: Record<string, ScanField['key']> = {
    barcode: 'barcode',
    'mã vạch': 'barcode',
    'バーコード': 'barcode',
    'lot no.': 'lotNo',
    'lot no': 'lotNo',
    'số lô': 'lotNo',
    'lot number': 'lotNo',
    'batch number': 'lotNo',
    'tên sản phẩm': 'productName',
    'product name': 'productName',
    'ten san pham': 'productName',
    'tên sp': 'productName',
    'ten sp': 'productName',
    'mã sản phẩm': 'productName',
    'ma san pham': 'productName',
    '商品名': 'productName',
    '製品名': 'productName',
    'số lượng': 'quantity',
    quantity: 'quantity',
    qty: 'quantity',
    sl: 'quantity',
    '数量': 'quantity',
    'contract no.': 'contractNo',
    'contract no': 'contractNo',
    'số hợp đồng': 'contractNo',
    'so hop dong': 'contractNo',
    'số hđ': 'contractNo',
    'order no.': 'contractNo',
    '注文番号': 'contractNo',
  };

  function matchScanKey(fieldName: string): ScanField['key'] | undefined {
    const normalized = fieldName.trim().toLowerCase();
    // Try direct mapping
    if (ocrToScanKey[normalized]) return ocrToScanKey[normalized];
    // Try pattern matching
    for (const sf of SCAN_FIELDS) {
      for (const pattern of sf.patterns) {
        if (normalized === pattern.toLowerCase()) return sf.key;
      }
    }
    return undefined;
  }

  // First pass: collect all non-scan fields as "other"
  const otherFields: NormalizedField[] = [];

  for (const f of processedFields) {
    const matchedKey = matchScanKey(f.field);
    if (!matchedKey) {
      otherFields.push({
        field: f.field,
        value: f.value || '',
        confidence: f.confidence || 'medium',
      });
    } else {
      usedKeys.add(matchedKey);
    }
  }

  // Second pass: emit all 5 required fields in stable order, using OCR value or empty
  for (const sf of SCAN_FIELDS) {
    if (!sf.required) continue;

    let value = '';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Find matching OCR field
    const matched = processedFields.find((f) => {
      const key = matchScanKey(f.field);
      return key === sf.key;
    });

    if (matched) {
      value = matched.value || '';
      confidence = matched.confidence || 'medium';
    }

    result.push({
      field: sf.labelVi,
      value,
      confidence,
    });
  }

  // Append other fields
  result.push(...otherFields);

  return result;
}

/**
 * Get scan field by key
 */
export function getScanField(key: ScanField['key']): ScanField | undefined {
  return SCAN_FIELDS.find((f) => f.key === key);
}