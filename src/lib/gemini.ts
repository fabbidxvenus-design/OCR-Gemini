import type { OCRResponse, TokenUsage } from '@/db/schema';
import { apiClient } from './apiClient';
import { useAuthStore } from '@/store/authStore';
import { findScanField } from './scanFields';
import { z } from 'zod';

const OCRModelTierSchema = z.enum(['free', 'default', 'high']);
type OCRModelTier = z.infer<typeof OCRModelTierSchema>;

const OCRStructuredSchema = z.object({
  title: z.string().optional(),
  fields: z.array(z.object({
    field: z.string(),
    value: z.string(),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
    category: z.enum(['main', 'other']).optional(),
  })).optional(),
  sizes: z.array(z.object({
    size: z.string(),
    quantity: z.number(),
  })).optional(),
  rawText: z.string().optional(),
  raw_text: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

const OCRResultSchema = z.object({
  ocrRaw: z.string(),
  ocrStructured: OCRStructuredSchema,
  tokenUsage: z.object({
    input: z.number(),
    output: z.number(),
    cost: z.number(),
    model: z.string().optional(),
  }),
  apiKeyIndex: z.number(),
});

type OCRResult = z.infer<typeof OCRResultSchema>;

type ProcessOCRResult = {
  structured: OCRResponse;
  ocrRaw: string;
  tokenUsage: TokenUsage;
  apiKeyIndex: number;
  modelTier: OCRModelTier;
};

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_INPUT_COST_PER_MILLION = 0.10;
const GEMINI_OUTPUT_COST_PER_MILLION = 0.40;
const GEMINI_MAX_OUTPUT_TOKENS = 1536;
const GEMINI_ATTEMPT_TIMEOUT_MS = 8000;
const DEFAULT_SYSTEM_PROMPT = `Extract text from the document image and return only valid JSON.
Schema: {"title":"string","fields":[{"field":"string","value":"string","confidence":"high|medium|low","category":"main|other"}],"sizes":[{"size":"string","quantity":number}],"notes":["string"]}
Use category "main" only for these canonical business fields: "barcode", "lot no", "product name", "quantity", "contract no". Use these exact lowercase field names so the app can fill the 5 fixed scan fields. Do not output alternate labels like "Quantity (Qty/Size)" or "Size / Qty".
Use semantic context, not exact labels only: "Lot No", "Lot", "Batch", "Lô", or a value near "No." can be the lot number; extract it as field "lot no" when the nearby value is an alphanumeric production/batch code.
For size/quantity tables, read rows or columns together. If sizes (S, M, L, XL, LL, 3L, 4L, etc.) have quantities beside or below them, return one main field {"field":"quantity","value":"M: 10, L: 10","confidence":"high","category":"main"} and also populate sizes as [{"size":"M","quantity":10},{"size":"L","quantity":10}]. Keep the value format exactly "Size: Qty" pairs separated by comma.
Only output fields with a readable label and matching value; never use the label as its own value. Put truly unlabeled values in notes, but prefer assigning barcode, lot no, product name, quantity, and contract no when nearby context makes the meaning clear.
Omit unreadable empty fields or use low confidence with empty value. Category is required for every field. No markdown or explanation.`;
const DEFAULT_USER_PROMPT = 'Extract OCR fields from this image. JSON only.';
const GEMINI_DIRECT_ENABLED = import.meta.env.VITE_USE_DIRECT_GEMINI === 'true';
const DIRECT_GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
].filter((key): key is string => typeof key === 'string' && key.length > 0);

export function blobToDataUrl(imageBlob: Blob): Promise<string> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(Object.assign(new Error('Failed to read image blob'), { cause: reader.error }));
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Checks whether a field with matching name already exists and has a non-empty value.
 */
function hasFieldValue(fields: OCRResponse['fields'], ...keywords: string[]): boolean {
  return (fields ?? []).some((f) => {
    const lower = f.field.toLowerCase();
    return keywords.some((k) => lower.includes(k)) && !!f.value?.trim();
  });
}

/**
 * Promotes a numeric barcode string from `notes` into a `Barcode` field.
 * UPC/EAN/JAN barcodes are typically 8–13 pure digit strings.
 */
function promoteBarcode(ocr: OCRResponse): OCRResponse {
  if (!ocr.notes?.length || hasFieldValue(ocr.fields, 'bar', 'mã vạch')) return ocr;

  const BARCODE_RE = /^\d{8,13}$/;
  const match = ocr.notes.find((n) => BARCODE_RE.test(n.trim()));
  if (!match) return ocr;

  return {
    ...ocr,
    fields: [...(ocr.fields ?? []), { field: 'Barcode', value: match.trim(), confidence: 'medium', category: 'main' }],
    notes: ocr.notes.filter((n) => n !== match),
  };
}

/**
 * Promotes lot/batch numbers from `notes` into a `Lot No` field.
 * Matches patterns like "Lot: ABC123", "No. 12345", "Batch 456", "Lô 789".
 */
function promoteLotNo(ocr: OCRResponse): OCRResponse {
  if (!ocr.notes?.length || hasFieldValue(ocr.fields, 'lot', 'lô', 'batch')) return ocr;

  const LOT_RE = /(?:lot|lô|batch|no)\s*[.:#]?\s*([a-zA-Z0-9][a-zA-Z0-9-]{2,19})/i;
  for (const note of ocr.notes) {
    const m = note.match(LOT_RE);
    if (m?.[1]) {
      return {
        ...ocr,
        fields: [...(ocr.fields ?? []), { field: 'Lot No', value: m[1], confidence: 'medium', category: 'main' }],
        notes: ocr.notes.filter((n) => n !== note),
      };
    }
  }
  return ocr;
}

function parseSizeLabel(note: string): string | undefined {
  const value = note.trim().toUpperCase();
  const directSize = value.match(/^(S|M|L|XL|XXL|XXXL|LL|[2-9]L)$/)?.[1];
  if (directSize) return directSize;

  const prefixedSize = value.match(/^(S|M|L|XL|XXL|XXXL|LL|[2-9]L)-/)?.[1];
  return prefixedSize;
}

function parseQuantity(note: string): number | undefined {
  const value = note.trim();
  if (!/^\d{1,5}$/.test(value)) return undefined;
  return Number(value);
}

function promoteSizeQty(ocr: OCRResponse): OCRResponse {
  // Skip if any quantity field already has a value (use findScanField so field name doesn't matter)
  const hasQty = (ocr.fields ?? []).some((f) => findScanField(f.field)?.key === 'quantity' && !!f.value?.trim());
  if (!ocr.notes?.length || hasQty) return ocr;

  const sizeEntries: Array<{ note: string; size: string }> = [];
  const quantityEntries: Array<{ note: string; quantity: number }> = [];

  for (const note of ocr.notes) {
    const size = parseSizeLabel(note);
    if (size) {
      sizeEntries.push({ note, size });
      continue;
    }

    const quantity = parseQuantity(note);
    if (quantity !== undefined) {
      quantityEntries.push({ note, quantity });
    }
  }

  if (!sizeEntries.length || quantityEntries.length < sizeEntries.length) return ocr;

  const sizes = sizeEntries.map((entry, index) => ({
    size: entry.size,
    quantity: quantityEntries[index].quantity,
  }));
  const value = sizes.map((entry) => `${entry.size}: ${entry.quantity}`).join(', ');
  const usedNotes = new Set([...sizeEntries.map((entry) => entry.note), ...quantityEntries.slice(0, sizeEntries.length).map((entry) => entry.note)]);

  return {
    ...ocr,
    fields: [...(ocr.fields ?? []), { field: 'quantity', value, confidence: 'medium', category: 'main' }],
    sizes: [...(ocr.sizes || []), ...sizes],
    notes: ocr.notes.filter((note) => !usedNotes.has(note)),
  };
}

/**
 * Post-process OCR response: promote recognizable values from notes into typed fields.
 * Pipeline: Barcode → Lot No → Size/Qty (each runs only if field not already present).
 */
function promoteFieldsFromNotes(ocr: OCRResponse): OCRResponse {
  let result = ocr;
  result = promoteBarcode(result);
  result = promoteLotNo(result);
  result = promoteSizeQty(result);
  return result;
}

function toMobileOCRResponse(result: OCRResult): OCRResponse {
  const base: OCRResponse = {
    title: result.ocrStructured.title,
    fields: result.ocrStructured.fields || [],
    sizes: result.ocrStructured.sizes || [],
    raw_text: result.ocrStructured.rawText ?? result.ocrStructured.raw_text ?? result.ocrRaw,
    notes: result.ocrStructured.notes || [],
  };
  return promoteFieldsFromNotes(base);
}

function calculateEstimatedCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * GEMINI_INPUT_COST_PER_MILLION + (outputTokens / 1_000_000) * GEMINI_OUTPUT_COST_PER_MILLION;
}

function getImageData(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) {
    throw Object.assign(new Error(`Failed to extract base64 data from image URL — expected data URL format, got: ${dataUrl.slice(0, 20)}`), { cause: new Error('Invalid URL scheme') });
  }
  return {
    mimeType: match[1],
    data: match[2],
  };
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1];
  const candidate = fenced ?? trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('OCR provider returned an invalid JSON response');
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as unknown;
  } catch (err) {
    const snippet = candidate.slice(start, end + 1).slice(0, 100);
    throw Object.assign(new Error(`Failed to parse Gemini response as JSON — LLM output may be malformed: ${snippet}`), { cause: err });
  }
}

async function fetchDirectGeminiResult(imageBlob: Blob): Promise<OCRResult> {
  if (!DIRECT_GEMINI_KEYS.length) {
    throw new Error('VITE_GEMINI_API_KEY chưa được cấu hình');
  }

  const dataUrl = await blobToDataUrl(imageBlob);
  if (!dataUrl.startsWith('data:')) {
    throw Object.assign(new Error(`Failed to extract base64 data from image URL — expected data URL format, got: ${dataUrl.slice(0, 20)}`), { cause: new Error('Invalid URL scheme') });
  }

  const image = getImageData(dataUrl);
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: image.mimeType, data: image.data } },
          { text: `${DEFAULT_SYSTEM_PROMPT}\n\n${DEFAULT_USER_PROMPT}` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
      response_mime_type: 'application/json',
    },
  };

  const keyFailures: string[] = [];

  for (let index = 0; index < DIRECT_GEMINI_KEYS.length; index += 1) {
    const apiKey = DIRECT_GEMINI_KEYS[index];
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), GEMINI_ATTEMPT_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const retryable = [401, 403, 429].includes(response.status);
        keyFailures.push(`Key ${index + 1}: HTTP ${response.status}${retryable ? ' (retryable)' : ''}`);
        if (retryable && index < DIRECT_GEMINI_KEYS.length - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 200));
          continue;
        }
        throw Object.assign(new Error(`Gemini OCR request failed — Key ${index + 1} returned HTTP ${response.status}`), { cause: response });
      }

      const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
      const structuredResult = OCRStructuredSchema.safeParse(extractJsonObject(rawText));
      if (!structuredResult.success) {
        throw Object.assign(new Error('OCR provider returned an invalid JSON response'), { cause: structuredResult.error });
      }
      const structured = structuredResult.data;
      const inputTokens = data.usageMetadata?.promptTokenCount ?? 0;
      const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;

      const result = OCRResultSchema.safeParse({
        ocrRaw: structured.rawText ?? structured.raw_text ?? rawText,
        ocrStructured: structured,
        tokenUsage: {
          input: inputTokens,
          output: outputTokens,
          cost: calculateEstimatedCost(inputTokens, outputTokens),
          model: GEMINI_MODEL,
        },
        apiKeyIndex: index + 1,
      });
      if (!result.success) {
        throw Object.assign(new Error('OCR provider returned an invalid JSON response'), { cause: result.error });
      }

      return result.data;
    } catch (err) {
      const reason = err instanceof Error ? `${err.name}: ${err.message}` : 'Unknown error';
      keyFailures.push(`Key ${index + 1}: ${reason}`);
      if (index < DIRECT_GEMINI_KEYS.length - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 200));
        continue;
      }
      // Distinguish AbortError (timeout) from other failures so network/DNS issues are surfaced
      const nonAbortFailures = keyFailures.filter(f => !f.includes('AbortError'));
      const abortFailures = keyFailures.filter(f => f.includes('AbortError'));
      const summaryParts: string[] = [];
      if (nonAbortFailures.length > 0) summaryParts.push(nonAbortFailures.join('; '));
      if (abortFailures.length > 0) summaryParts.push(`${abortFailures.length} timeout(s)`);
      throw Object.assign(new Error(`Gemini OCR request failed — ${summaryParts.join(' | ')}`), { cause: err });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw Object.assign(new Error(`Gemini OCR request failed — ${keyFailures.join('; ') || 'All API keys failed'}`), { cause: new Error('All API keys failed') });
}

async function fetchBackendOCRResult(imageBlob: Blob, tier: OCRModelTier): Promise<OCRResult> {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error('Bạn cần đăng nhập để xử lý OCR');
  }

  return apiClient.post<OCRResult>('/api/ocr/process', {
    imageBase64: await blobToDataUrl(imageBlob),
    modelTier: tier,
  }, {
    accessToken,
    schema: OCRResultSchema,
  });
}

export async function processOCR(
  imageBlob: Blob,
  tierOverride?: OCRModelTier
): Promise<ProcessOCRResult> {
  const parsed = OCRModelTierSchema.safeParse(tierOverride);
  const tier = parsed.success ? parsed.data : 'default';
  if (!parsed.success && tierOverride !== undefined) {
    // Silently fall back to 'default' tier
  }
  const result = GEMINI_DIRECT_ENABLED
    ? await fetchDirectGeminiResult(imageBlob)
    : await fetchBackendOCRResult(imageBlob, tier);

  return {
    structured: toMobileOCRResponse(result),
    ocrRaw: result.ocrRaw,
    tokenUsage: result.tokenUsage,
    apiKeyIndex: result.apiKeyIndex,
    modelTier: tier,
  };
}

