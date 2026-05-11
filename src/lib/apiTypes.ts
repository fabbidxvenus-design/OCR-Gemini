import { z } from 'zod';

const BackendOCRStructuredSchema = z.object({
  title: z.string().optional(),
  fields: z.array(
    z.object({
      field: z.string(),
      value: z.string(),
      confidence: z.enum(['high', 'medium', 'low']).optional(),
    })
  ).optional(),
  sizes: z.array(
    z.object({
      size: z.string(),
      quantity: z.number(),
    })
  ).optional(),
  rawText: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

// Generic API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

// Base error structure for API client
export class ApiError extends Error {
  status: number;
  code: string;
  data?: any;

  constructor(message: string, options: { status: number; code: string; data?: any }) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
  }
}

export const SuccessSchema = z.object({
  success: z.literal(true),
  data: z.any(),
});

export const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

// Example schema for a single scan from backend
export const BackendScanSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  imageUrl: z.string().nullable(),
  ocrRaw: z.string(),
  ocrStructured: BackendOCRStructuredSchema,
  tokenUsage: z.object({
    input: z.number(),
    output: z.number(),
    cost: z.number(),
  }),
  apiKeyIndex: z.number(),
  edited: z.boolean(),
});

export const BackendScanListSchema = z.array(BackendScanSchema);

export type BackendScanRecord = z.infer<typeof BackendScanSchema>;

// Example schema for a single scan
export const ScanSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  imageDataUrl: z.string().optional(),
  ocrStructured: z.object({
    title: z.string().optional(),
    fields: z.array(
      z.object({
        field: z.string(),
        value: z.string(),
        confidence: z.enum(['high', 'medium', 'low']).optional(),
      })
    ).optional(),
    sizes: z.array(
      z.object({
        size: z.string(),
        quantity: z.number(),
      })
    ).optional(),
    raw_text: z.string().optional(),
    notes: z.array(z.string()).optional(),
  }),
  edited: z.boolean().optional(),
  tokenUsage: z.object({
    input: z.number(),
    output: z.number(),
    cost: z.number(),
  }).optional(),
  apiKeyIndex: z.number().optional(),
  modelTier: z.enum(['free', 'default', 'high']).optional(),
});

export const ScanListSchema = z.array(ScanSchema);

export const ApiKeyUsageStatsSchema = z.object({
  key1Count: z.number(),
  key2Count: z.number(),
  key1Cost: z.number(),
  key2Cost: z.number(),
});
