import { apiClient } from './apiClient';
import { z } from 'zod';

const AppSettingsSchema = z.object({
  id: z.string(),
  selectedModelTier: z.enum(['free', 'default', 'high']),
  lastUpdated: z.string().optional(),
});

export const SettingsSchema = AppSettingsSchema;

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export const settingsApi = {
  getSettings: (accessToken: string) =>
    apiClient.get<AppSettings>('/api/settings', {
      accessToken,
      schema: AppSettingsSchema,
    }),

  updateSettings: async (accessToken: string, updates: Partial<AppSettings>): Promise<AppSettings> => {
    const result = await apiClient.patch<AppSettings>('/api/settings', updates, {
      accessToken,
      schema: AppSettingsSchema,
    });
    if (!result) {
      throw Object.assign(new Error('Không thể cập nhật cài đặt'), { cause: null });
    }
    return result;
  },
};
