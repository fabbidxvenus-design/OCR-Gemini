import type { ScanRecord } from '@/db/schema';
import { categorizeField, type FieldCategory } from './fieldCategories';

/**
 * Priority order for display name field selection
 */
const FIELD_PRIORITY_PATTERNS = [
  // Priority 1: product_name (most important for identification)
  /^product_name$/i,
  /^product name$/i,
  /^tên\s*sản\s*phẩm$/i,
  /^ten\s*san\s*pham$/i,
  /^tên\s*sp$/i,
  /^ten\s*sp$/i,
  /^item\s*name$/i,
  /^item_name$/i,
  /^san\s*pham$/i,
  /^san_pham$/i,
  /^sp$/i,
  /^商品名$/i,
  /^製品名$/i,
  /^product$/i,

  // Priority 2: contract_no (important for business context)
  /^contract_no$/i,
  /^contract\s*no\.?$/i,
  /^số\s*hợp\s*đồng$/i,
  /^so\s*hop\s*dong$/i,
  /^order_no$/i,
  /^order\s*no\.?$/i,

  // Priority 3: lot_no (important for batch tracking)
  /^lot_no$/i,
  /^lot\s*number$/i,
  /^số\s*lô$/i,
  /^so\s*lo$/i,
  /^batch$/i,

  // Priority 4: barcode (important for scanning)
  /^barcode$/i,
  /^bar\s*code$/i,
  /^mã\s*vạch$/i,
  /^ma\s*vach$/i,
  /^バーコード$/i,
];

/**
 * Normalize a field name for comparison
 * - Trim whitespace
 * - Lowercase for case-insensitive matching
 * - Collapse multiple spaces
 */
function normalizeFieldName(name: string | null | undefined): string {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Find a field matching any of the given patterns
 */
function findFieldByPatterns(
  fields: Array<{ field: string; value: string }>,
  patterns: RegExp[]
): { field: string; value: string } | null {
  for (const field of fields) {
    const normalizedName = normalizeFieldName(field.field);
    for (const pattern of patterns) {
      if (pattern.test(normalizedName)) {
        return field;
      }
    }
  }
  return null;
}

/**
 * Get the first non-empty field value from a list
 */
function getFirstNonEmptyField(
  fields: Array<{ field: string; value: string }>,
  category?: FieldCategory
): { field: string; value: string } | null {
  for (const field of fields) {
    const fieldCategory = category || categorizeField(field.field);
    if (category && fieldCategory !== category) {
      continue;
    }
    if (field.value && field.value.trim().length > 0) {
      return field;
    }
  }
  return null;
}

/**
 * Generate a fallback display name based on timestamp
 */
function generateFallbackName(scan: ScanRecord): string {
  const date = new Date(scan.timestamp);
  const dateStr = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
  const timeStr = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Scan ${dateStr} ${timeStr}`;
}

/**
 * Determine the display name for a scan record
 *
 * Priority order:
 * 0. ocrStructured.title (if present)
 * 1. product_name field (or similar)
 * 2. contract_no / order_no field
 * 3. lot_no / batch field
 * 4. barcode field
 * 5. First field from main category
 * 6. First field from other category
 * 7. Fallback: "Scan #[date-timestamp]"
 */
export function scanDisplayName(scan: ScanRecord): string {
  // Priority 0: Use ocrStructured.title if present
  if (scan.ocrStructured?.title && scan.ocrStructured.title.trim().length > 0) {
    return scan.ocrStructured.title.trim();
  }

  const fields = scan.ocrStructured?.fields;

  // Check if fields array exists and has entries
  if (!fields || fields.length === 0) {
    return generateFallbackName(scan);
  }

  // Priority 1: Try product_name patterns
  const productField = findFieldByPatterns(fields, FIELD_PRIORITY_PATTERNS.slice(0, 14));
  if (productField && productField.value.trim().length > 0) {
    return productField.value.trim();
  }

  // Priority 2: Try contract/order patterns (index 14-21)
  const contractField = findFieldByPatterns(fields, FIELD_PRIORITY_PATTERNS.slice(14, 22));
  if (contractField && contractField.value.trim().length > 0) {
    return contractField.value.trim();
  }

  // Priority 3: Try lot_no patterns (index 22-29)
  const lotField = findFieldByPatterns(fields, FIELD_PRIORITY_PATTERNS.slice(22, 30));
  if (lotField && lotField.value.trim().length > 0) {
    return lotField.value.trim();
  }

  // Priority 4: Try barcode patterns (index 30-34)
  const barcodeField = findFieldByPatterns(fields, FIELD_PRIORITY_PATTERNS.slice(30));
  if (barcodeField && barcodeField.value.trim().length > 0) {
    return barcodeField.value.trim();
  }

  // Priority 5: First field from main category
  const mainField = getFirstNonEmptyField(fields, 'main');
  if (mainField) {
    return mainField.value.trim();
  }

  // Priority 6: First field from other category
  const otherField = getFirstNonEmptyField(fields, 'other');
  if (otherField) {
    return otherField.value.trim();
  }

  // Priority 7: First field with any value
  const anyField = getFirstNonEmptyField(fields);
  if (anyField) {
    return anyField.value.trim();
  }

  // Fallback: Generate timestamp-based name
  return generateFallbackName(scan);
}

export default scanDisplayName;