import { apiClient } from './apiClient';
import { BackendScanSchema, BackendScanListSchema, ApiKeyUsageStatsSchema } from './apiTypes';
import type { BackendScanRecord } from './apiTypes';
import type { z } from 'zod';

export const scansApi = {
  getScans: (accessToken: string, options?: { limit?: number; order?: 'asc' | 'desc' }) =>
    apiClient.get<BackendScanRecord[]>('/api/scans', {
      accessToken,
      schema: BackendScanListSchema,
      params: options as any,
    }),

  getScan: (accessToken: string, id: string) =>
    apiClient.get<BackendScanRecord>(`/api/scans/${id}`, {
      accessToken,
      schema: BackendScanSchema
    }),

  createScan: (accessToken: string, data: any) =>
    apiClient.post<{ id: string }>('/api/scans', data, { accessToken }),

  updateScan: (accessToken: string, id: string, updates: any) =>
    apiClient.patch<void>(`/api/scans/${id}`, updates, { accessToken }),

  deleteScan: (accessToken: string, id: string) =>
    apiClient.delete<void>(`/api/scans/${id}`, { accessToken }),

  getApiKeyUsageStats: (accessToken: string) =>
    apiClient.get<z.infer<typeof ApiKeyUsageStatsSchema>>('/api/scans/stats/api-keys', {
      accessToken,
      schema: ApiKeyUsageStatsSchema,
    }),
};
