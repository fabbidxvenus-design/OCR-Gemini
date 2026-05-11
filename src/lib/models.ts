export interface ModelConfig {
  id: string;
  name: string;
  model: string;
  description: string;
  pricing: {
    input: number; // per 1M tokens
    output: number; // per 1M tokens
  };
  prompt: string;
}

export const MODEL_CONFIGS: Record<'free' | 'default' | 'high', ModelConfig> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    model: 'openrouter/auto',
    description: 'Fastest, lowest cost. Good for simple invoices.',
    pricing: {
      input: 0,
      output: 0,
    },
    prompt: `Extract text from invoice images. Return JSON with: title, fields: [{field, value}], sizes: [{size, quantity}], raw_text.

IMPORTANT - Use these EXACT field names for main fields:
- Barcode, Lot No, product_name, product_code, quantity, Size, contract_no, ct_no
- Always use snake_case format: "product_name", "product_code", "contract_no"

Return valid JSON only.`,
  },
  default: {
    id: 'default',
    name: 'Default Quality',
    model: 'google/gemini-2.0-flash-001',
    description: 'Balanced speed and accuracy. Recommended for most cases.',
    pricing: {
      input: 0,
      output: 0,
    },
    prompt: `You are an OCR assistant specialized in extracting structured data from Vietnamese invoices and product labels.

Extract ALL text from this image and structure it as JSON:

{
  "title": "Document type (e.g., Hóa đơn, Phiếu xuất kho, Nhãn sản phẩm)",
  "fields": [
    {"field": "Field name", "value": "Field value", "confidence": "high|medium|low"}
  ],
  "sizes": [
    {"size": "Size code", "quantity": number}
  ],
  "raw_text": "Complete raw text from image",
  "notes": ["Any observations or warnings"]
}

IMPORTANT - Use these EXACT field names:
- Barcode, Lot No, Tên sản phẩm, Mã sản phẩm, Số lượng, Size, Contract No
- For product name: "Tên sản phẩm" or "product_name"
- For product code: "Mã sản phẩm" or "product_code"
- For contract number: "Contract No" or "ct_no" or "contract_no"
- For quantity: "Số lượng" or "quantity" or "qty"

Extract ALL visible text, even if unclear
For Vietnamese text, preserve diacritics accurately
For tables, extract row by row
Include confidence level for each field
If text is unclear, mark confidence as "low" but still include it`,
  },
  high: {
    id: 'high',
    name: 'High Quality',
    model: 'google/gemini-2.5-flash',
    description: 'Highest accuracy. Best for complex or low-quality images.',
    pricing: {
      input: 0.0000003,
      output: 0.0000025,
    },
    prompt: `You are an expert OCR assistant specializing in extracting structured data from Vietnamese invoices and product labels.

Extract ALL text from this image and structure it as JSON:

{
  "title": "Document type (e.g., Hóa đơn, Phiếu xuất kho, Nhãn sản phẩm)",
  "fields": [
    {"field": "Field name", "value": "Field value", "confidence": "high|medium|low"}
  ],
  "sizes": [
    {"size": "Size code", "quantity": number}
  ],
  "raw_text": "Complete raw text from image",
  "notes": ["Any observations, warnings, or quality issues"]
}

IMPORTANT - Use these EXACT field names:
- Barcode, Lot No, Tên sản phẩm, Mã sản phẩm, Số lượng, Size, Contract No
- For product name: "Tên sản phẩm" or "product_name"
- For product code: "Mã sản phẩm" or "product_code"
- For contract number: "Contract No" or "ct_no" or "contract_no"
- For quantity: "Số lượng" or "quantity" or "qty"

CRITICAL REQUIREMENTS:
- Prioritize these main fields: Barcode, Lot No, Tên sản phẩm, Mã sản phẩm, Số lượng, Size, Contract No
- Extract ALL visible text, even if partially obscured or low quality
- For Vietnamese text, preserve diacritics with 100% accuracy
- For tables, extract row by row with precise alignment
- Include confidence level for each field based on image quality
- If text is unclear, mark confidence as "low" but still include your best interpretation
- For barcodes and numbers, double-check accuracy
- Note any image quality issues that may affect accuracy`,
  },
};

export function getModelConfig(tier: 'free' | 'default' | 'high'): ModelConfig {
  return MODEL_CONFIGS[tier];
}

export function calculateCost(
  tier: 'free' | 'default' | 'high',
  inputTokens: number,
  outputTokens: number
): number {
  const config = MODEL_CONFIGS[tier];
  const inputCost = (inputTokens / 1_000_000) * config.pricing.input;
  const outputCost = (outputTokens / 1_000_000) * config.pricing.output;
  return inputCost + outputCost;
}
