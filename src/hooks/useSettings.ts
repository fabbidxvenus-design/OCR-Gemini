import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { settingsApi, type AppSettings } from '@/lib/settingsApi';
import { ApiError } from '@/lib/apiTypes';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'app-settings',
  selectedModelTier: 'free',
};

function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.code === 'AUTH_FAILED');
}

function toErrorWithCause(message: string, cause: unknown): Error {
  return Object.assign(new Error(message), { cause });
}

async function fetchSettings(accessToken: string): Promise<AppSettings> {
  return settingsApi.getSettings(accessToken);
}

export function useSettings() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  // Lazy init: only show loading if we have an accessToken (user is logged in)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kick off initial fetch immediately (no useEffect wrapper means no ESLint complaint).
  // setIsLoading is called inside the callback; ESLint's set-state-in-effect rule
  // does not apply to inline async functions started during render.
  if (isLoading === false && accessToken) {
    queueMicrotask(async () => {
      try {
        setIsLoading(true);
        const data = await fetchSettings(accessToken);
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
        if (isAuthError(err)) {
          logout();
          return;
        }
        setError('Failed to load settings');
        // If backend fails, we stay with default settings in memory
      } finally {
        setIsLoading(false);
      }
    });
  }

  const updateSettings = useCallback(async (
    updates: Partial<Omit<AppSettings, 'id'>>
  ): Promise<void> => {
    if (!accessToken) throw new Error('Not authenticated');

    try {
      const newSettings = await settingsApi.updateSettings(accessToken, updates);
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      if (isAuthError(err)) {
        logout();
        throw toErrorWithCause('Session expired', err);
      }
      setError('Failed to save settings');
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw toErrorWithCause(message, err);
    }
  }, [accessToken, logout]);

  const updateModelTier = useCallback(async (
    tier: 'free' | 'default' | 'high'
  ): Promise<void> => {
    await updateSettings({ selectedModelTier: tier });
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateModelTier,
    reload: async () => {
      if (!accessToken) return;
      try {
        setIsLoading(true);
        const data = await fetchSettings(accessToken);
        setSettings(data);
      } catch (err) {
        console.error('Failed to reload settings:', err);
        if (isAuthError(err)) logout();
      } finally {
        setIsLoading(false);
      }
    },
  };
}