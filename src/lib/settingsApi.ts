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

  updateSettings: (accessToken: string, updates: Partial<AppSettings>) =>
    apiClient.patch<AppSettings>('/api/settings', updates, {
      accessToken,
      schema: AppSettingsSchema,
    }),
};
