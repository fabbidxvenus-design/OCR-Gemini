import { apiClient } from './apiClient';
import { BackendScanSchema, BackendScanListSchema, ApiKeyUsageStatsSchema, ScanUploadSchema, ScanUploadUrlSchema } from './apiTypes';
import type { BackendScanRecord, ScanUpload, ScanUploadUrl } from './apiTypes';
import type { z } from 'zod';

const UPLOAD_TIMEOUT_MS = 30_000;

export interface CreateScanUploadUrlInput {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface CreateScanPayload {
  timestamp: string;
  imageUrl?: string;
  imageDataUrl?: string;
  ocrRaw: string;
  ocrStructured: {
    title?: string;
    fields?: Array<{ field: string; value: string; confidence?: string; category?: string }>;
    sizes?: Array<{ size: string; quantity: number }>;
    rawText?: string;
    notes?: string[];
  };
  tokenUsage?: {
    input: number;
    output: number;
    cost: number;
  };
  apiKeyIndex?: number;
  edited?: boolean;
  modelTier?: string;
}

export interface UpdateScanPayload {
  ocrStructured: {
    title?: string;
    fields?: Array<{ field: string; value: string; confidence?: string; category?: string }>;
    sizes?: Array<{ size: string; quantity: number }>;
    rawText?: string;
    notes?: string[];
  };
}

export const scansApi = {
  createScanUploadUrl: (accessToken: string, data: CreateScanUploadUrlInput): Promise<ScanUploadUrl> =>
    apiClient.post<ScanUploadUrl>('/api/scans/upload-url', data, {
      accessToken,
      schema: ScanUploadUrlSchema,
    }),

  uploadScanThumbnail: async (accessToken: string, image: Blob): Promise<ScanUpload> => {
    const formData = new FormData();
    formData.append('image', image, `scan-thumbnail-${crypto.randomUUID()}.jpg`);

    return apiClient.postForm<ScanUpload>('/api/scans/upload', formData, {
      accessToken,
      schema: ScanUploadSchema,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
  },

  getScans: (accessToken: string, options?: { limit?: number; order?: 'asc' | 'desc' }) =>
    apiClient.get<BackendScanRecord[]>('/api/scans', {
      accessToken,
      schema: BackendScanListSchema,
      params: options,
    }),

  getScan: (accessToken: string, id: string) =>
    apiClient.get<BackendScanRecord>(`/api/scans/${id}`, {
      accessToken,
      schema: BackendScanSchema
    }),

  createScan: async (accessToken: string, data: CreateScanPayload): Promise<{ id: string }> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([key]) => key !== 'imageDataUrl')
    ) as Omit<CreateScanPayload, 'imageDataUrl'>;
    const created = await apiClient.post<BackendScanRecord>('/api/scans', payload, {
      accessToken,
      schema: BackendScanSchema,
    });
    return { id: created.id };
  },

  updateScan: (accessToken: string, id: string, updates: UpdateScanPayload) =>
    apiClient.patch<void>(`/api/scans/${id}`, updates, { accessToken }),

  deleteScan: (accessToken: string, id: string) =>
    apiClient.delete<void>(`/api/scans/${id}`, { accessToken }),

  getApiKeyUsageStats: (accessToken: string) =>
    apiClient.get<z.infer<typeof ApiKeyUsageStatsSchema>>('/api/scans/stats/api-keys', {
      accessToken,
      schema: ApiKeyUsageStatsSchema,
    }),
};
