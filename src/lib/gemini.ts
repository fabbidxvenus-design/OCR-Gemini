import type { OCRResponse, TokenUsage } from '@/db/schema';
import { apiClient } from './apiClient';
import { useAuthStore } from '@/store/authStore';
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
Use category "main" for barcode, product/code, lot, contract/order, quantity, size, price, date, unit. Use "other" for supplementary metadata or notes.
Only output fields with a readable label and matching value; never use the label as its own value. Put unlabeled values in notes.
Combine repeated size/quantity rows into one main field like {"field":"サイズ / 数量","value":"M: 10, L: 10","confidence":"high","category":"main"} and also populate sizes.
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
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

function toMobileOCRResponse(result: OCRResult): OCRResponse {
  return {
    title: result.ocrStructured.title,
    fields: result.ocrStructured.fields || [],
    sizes: result.ocrStructured.sizes || [],
    raw_text: result.ocrStructured.rawText ?? result.ocrStructured.raw_text ?? result.ocrRaw,
    notes: result.ocrStructured.notes || [],
  };
}

function calculateEstimatedCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * GEMINI_INPUT_COST_PER_MILLION + (outputTokens / 1_000_000) * GEMINI_OUTPUT_COST_PER_MILLION;
}

function getImageData(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  return {
    mimeType: match?.[1] ?? 'image/jpeg',
    data: match?.[2] ?? dataUrl,
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
  } catch {
    throw new Error('OCR provider returned an invalid JSON response');
  }
}

async function fetchDirectGeminiResult(imageBlob: Blob): Promise<OCRResult> {
  if (DIRECT_GEMINI_KEYS.length === 0) {
    throw new Error('VITE_GEMINI_API_KEY chưa được cấu hình');
  }

  const image = getImageData(await blobToDataUrl(imageBlob));
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
        if ([401, 403, 429].includes(response.status) && index < DIRECT_GEMINI_KEYS.length - 1) continue;
        throw new Error('Gemini OCR request failed');
      }

      const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
      const structuredResult = OCRStructuredSchema.safeParse(extractJsonObject(rawText));
      if (!structuredResult.success) {
        throw new Error('OCR provider returned an invalid JSON response');
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
        throw new Error('OCR provider returned an invalid JSON response');
      }

      return result.data;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw new Error('Gemini OCR request failed');
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
  const tier = OCRModelTierSchema.catch('default').parse(tierOverride);
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

