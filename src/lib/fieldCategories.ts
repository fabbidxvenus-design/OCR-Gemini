/**
 * Field categorization logic for OCR results
 * Categorizes fields into 'main' (high priority) and 'other' (secondary)
 * Supports Vietnamese (Việt), English (Anh), and Japanese (Nhật)
 */

export type FieldCategory = 'main' | 'other';

interface CategorizedFieldInput {
  field: string;
  value: string;
  confidence?: 'high' | 'medium' | 'low';
  category?: FieldCategory;
}

function isSizeField(fieldName: string): boolean {
  return /^(size|サイズ|kích\s*thước|kich\s*thuoc)$/i.test(fieldName.trim());
}

function isQuantityField(fieldName: string): boolean {
  return /^(quantity|qty|数量|số\s*lượng|so\s*luong|sl)$/i.test(fieldName.trim());
}

function mergeConfidence(
  current: CategorizedFieldInput['confidence'],
  next: CategorizedFieldInput['confidence']
): CategorizedFieldInput['confidence'] {
  if (current === 'low' || next === 'low') return 'low';
  if (current === 'medium' || next === 'medium') return 'medium';
  return current || next;
}

export function groupSizeQuantityFields<T extends CategorizedFieldInput>(fields: T[]): T[] {
  const result: T[] = [];
  const sizeQuantities: string[] = [];
  let confidence: CategorizedFieldInput['confidence'];
  let insertedGroupedField = false;

  for (let index = 0; index < fields.length; index += 1) {
    const current = fields[index];
    const next = fields[index + 1];

    if (current && next && isSizeField(current.field) && isQuantityField(next.field)) {
      sizeQuantities.push(`${current.value}: ${next.value}`);
      confidence = mergeConfidence(confidence, mergeConfidence(current.confidence, next.confidence));

      if (!insertedGroupedField) {
        result.push({
          field: 'サイズ / 数量',
          value: '',
          category: 'main',
        } as T);
        insertedGroupedField = true;
      }

      index += 1;
      continue;
    }

    result.push(current);
  }

  if (sizeQuantities.length === 0) return result;

  return result.map((field) => {
    if (field.field !== 'サイズ / 数量') return field;

    return {
      ...field,
      value: sizeQuantities.join(', '),
      ...(confidence ? { confidence } : {}),
    };
  });
}

/**
 * Regex patterns for main fields (Vietnamese + English + Japanese)
 * Main fields: Barcode, Lot No, Product Name/Code, Quantity/Size, Contract No
 */
export const MAIN_FIELD_PATTERNS: RegExp[] = [
  // Barcode - Anh / Việt / Nhật
  /^bar\s*code$/i,
  /^barcode$/i,
  /^mã\s*vạch$/i,
  /^ma\s*vach$/i,
  /^バーコード$/i,
  /^bar_code$/i,

  // Lot No / Batch - Anh / Việt / Nhật
  /^lot\s*no\.?$/i,
  /^lot\s*number$/i,
  /^batch\s*no\.?$/i,
  /^batch\s*number$/i,
  /^lote?\s*no\.?$/i,
  /^số\s*lô$/i,
  /^so\s*lo$/i,
  /^lô\s*sx$/i,
  /^lo\s*sx$/i,
  /^batch$/i,
  /^ロット$/i,
  /^lot_no$/i,
  /^batch_no$/i,

  // Product Name - Anh / Việt / Nhật
  /^tên\s*sản\s*phẩm$/i,
  /^ten\s*san\s*pham$/i,
  /^product\s*name$/i,
  /^product_name$/i,
  /^item\s*name$/i,
  /^tên\s*sp$/i,
  /^ten\s*sp$/i,
  /^tên\s*hàng$/i,
  /^ten\s*hang$/i,
  /^商品名$/i,
  /^製品名$/i,
  /^sản\s*phẩm$/i,
  /^san\s*pham$/i,
  /^sp$/i,
  /^product$/i,

  // Product Code - Anh / Việt / Nhật
  /^mã\s*sản\s*phẩm$/i,
  /^ma\s*san\s*pham$/i,
  /^product\s*code$/i,
  /^product_code$/i,
  /^item\s*code$/i,
  /^code$/i,
  /^mã\s*sp$/i,
  /^ma\s*sp$/i,
  /^mã\s*hàng$/i,
  /^ma\s*hang$/i,
  /^mã$/i,
  /^code\s*no$/i,
  /^商品コード$/i,
  /^製品コード$/i,
  /^code$/i,

  // Quantity - Anh / Việt / Nhật
  /^số\s*lượng$/i,
  /^so\s*luong$/i,
  /^quantity$/i,
  /^qty$/i,
  /^sl$/i,
  /^amount$/i,
  /^number$/i,
  /^count$/i,
  /^数量$/i,
  /^个数$/i,
  /^qty$/i,

  // Size - Anh / Việt / Nhật
  /^size$/i,
  /^kích\s*thước$/i,
  /^kich\s*thuoc$/i,
  /^dimension$/i,
  /^サイズ$/i,
  /^大きさ$/i,

  // Contract No - Anh / Việt / Nhật
  /^contract[\s_]*no\.?$/i,
  /^contract\s*number$/i,
  /^contract_no$/i,
  /^contract$/i,
  /^ct[\s_]*no\.?$/i,
  /^ct_n[oọ]$/i,
  /^số\s*hợp\s*đồng$/i,
  /^so\s*hop\s*dong$/i,
  /^số\s*hđ$/i,
  /^so\s*hd$/i,
  /^hợp\s*đồng$/i,
  /^hop\s*dong$/i,
  /^đơn\s*hàng$/i,
  /^don\s*hang$/i,
  /^order[\s_]*no\.?$/i,
  /^order\s*number$/i,
  /^order_no$/i,
  /^注文番号$/i,
  /^契約\s*no\.?$/i,
  /^契約\s*番号$/i,
  /^契約No\.?$/i,
  /^CT\s+No\.?$/i,
  /^order$/i,

  // Price / Cost - Anh / Việt / Nhật
  /^price$/i,
  /^giá$/i,
  /^gia$/i,
  /^price\s*no\.?$/i,
  /^giá\s*tiền$/i,
  /^gia\s*tien$/i,
  /^単価$/i,
  /^価格$/i,

  // Date - Anh / Việt / Nhật
  /^date$/i,
  /^ngày$/i,
  /^ngay$/i,
  /^date\s*no\.?$/i,
  /^manufacture\s*date$/i,
  /^ngày\s*sản\s*xuất$/i,
  /^ngay\s*san\s*xuat$/i,
  /^sx$/i,
  /^mfg$/i,
  /^exp$/i,
  /^hạn\s*sử\s*dụng$/i,
  /^han\s*su\s*dung$/i,
  /^期限$/i,
  /^有効期限$/i,
  /^製造日$/i,

  // Unit - Anh / Việt / Nhật
  /^unit$/i,
  /^đơn\s*vị$/i,
  /^don\s*vi$/i,
  /^đv$/i,
  /^dv$/i,
  /^ واحد$/i,
  /^单位$/i,
];

/**
 * Categorize a single field name
 * @param fieldName - The field name to categorize
 * @returns 'main' if matches main patterns, 'other' otherwise
 */
export function categorizeField(fieldName: string): FieldCategory {
  const normalized = fieldName.trim();

  for (const pattern of MAIN_FIELD_PATTERNS) {
    if (pattern.test(normalized)) {
      return 'main';
    }
  }

  return 'other';
}

/**
 * Categorize multiple fields at once
 * Prefers existing category from OCR, falls back to regex categorization
 * @param fields - Array of field objects with 'field' property
 * @returns Array of fields with 'category' property added
 */
export function categorizeFields<T extends { field: string; category?: FieldCategory }>(
  fields: T[]
): Array<T & { category: FieldCategory }> {
  return fields.map((field) => ({
    ...field,
    category: field.category || categorizeField(field.field),
  }));
}

/**
 * Split fields into main and other categories
 * @param fields - Array of field objects with 'field' property
 * @returns Object with 'main' and 'other' arrays
 */
export function splitFieldsByCategory<T extends { field: string }>(
  fields: T[]
): { main: T[]; other: T[] } {
  const categorized = categorizeFields(fields);

  return {
    main: categorized.filter((f) => f.category === 'main'),
    other: categorized.filter((f) => f.category === 'other'),
  };
}
