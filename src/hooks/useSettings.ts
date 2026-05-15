import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { settingsApi, type AppSettings } from '@/lib/settingsApi';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'app-settings',
  selectedModelTier: 'free',
};

export function useSettings() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await settingsApi.getSettings(accessToken);
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      if (err.status === 401 || err.code === 'AUTH_FAILED') {
        logout();
        return;
      }
      setError('Failed to load settings');
      // If backend fails, we stay with default settings in memory
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout]);

  // Load settings from backend on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (
    updates: Partial<Omit<AppSettings, 'id'>>
  ): Promise<void> => {
    if (!accessToken) throw new Error('Not authenticated');

    try {
      const newSettings = await settingsApi.updateSettings(accessToken, updates);
      setSettings(newSettings);
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      if (err.status === 401 || err.code === 'AUTH_FAILED') {
        logout();
        throw new Error('Session expired');
      }
      setError('Failed to save settings');
      throw err;
    }
  };

  const updateModelTier = async (
    tier: 'free' | 'default' | 'high'
  ): Promise<void> => {
    await updateSettings({ selectedModelTier: tier });
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateModelTier,
    reload: loadSettings,
  };
}

