import type { OCRResponse, TokenUsage } from '@/db/schema';
import { apiClient } from './apiClient';
import { useAuthStore } from '@/store/authStore';
import { z } from 'zod';

const BackendOCRStructuredSchema = z.object({
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
  notes: z.array(z.string()).optional(),
});

const BackendOCRResultSchema = z.object({
  ocrRaw: z.string(),
  ocrStructured: BackendOCRStructuredSchema,
  tokenUsage: z.object({
    input: z.number(),
    output: z.number(),
    cost: z.number(),
  }),
  apiKeyIndex: z.number(),
});

type BackendOCRResult = z.infer<typeof BackendOCRResultSchema>;

function blobToDataUrl(imageBlob: Blob): Promise<string> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

function toMobileOCRResponse(result: BackendOCRResult): OCRResponse {
  return {
    title: result.ocrStructured.title,
    fields: result.ocrStructured.fields || [],
    sizes: result.ocrStructured.sizes || [],
    raw_text: result.ocrStructured.rawText ?? result.ocrRaw,
    notes: result.ocrStructured.notes || [],
  };
}

export async function processOCR(
  imageBlob: Blob,
  tierOverride?: 'free' | 'default' | 'high'
): Promise<{
  structured: OCRResponse;
  ocrRaw: string;
  tokenUsage: TokenUsage;
  apiKeyIndex: number;
  modelTier: 'free' | 'default' | 'high';
}> {
  // Model tier is now handled by the UI/Settings and passed here.
  // Default to 'default' if not provided.
  const tier = tierOverride || 'default';
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error('Bạn cần đăng nhập để xử lý OCR');
  }

  const result = await apiClient.post<BackendOCRResult>('/api/ocr/process', {
    imageBase64: await blobToDataUrl(imageBlob),
    modelTier: tier,
  }, {
    accessToken,
    schema: BackendOCRResultSchema
  });

  return {
    structured: toMobileOCRResponse(result),
    ocrRaw: result.ocrRaw,
    tokenUsage: result.tokenUsage,
    apiKeyIndex: result.apiKeyIndex,
    modelTier: tier,
  };
}

