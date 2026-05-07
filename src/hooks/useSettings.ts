import { useState, useEffect } from 'react';
import { db } from '@/db/schema';
import type { AppSettings } from '@/db/schema';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'app-settings',
  selectedModelTier: 'default',
  lastUpdated: new Date(),
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from IndexedDB
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const stored = await db.settings.get('app-settings');

      if (stored) {
        setSettings(stored);
      } else {
        // Initialize with defaults
        await db.settings.put(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (
    updates: Partial<Omit<AppSettings, 'id'>>
  ): Promise<void> => {
    try {
      const newSettings: AppSettings = {
        ...settings,
        ...updates,
        id: 'app-settings',
        lastUpdated: new Date(),
      };

      // Optimistic update
      setSettings(newSettings);

      // Persist to IndexedDB
      await db.settings.put(newSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to save settings');
      // Revert optimistic update
      await loadSettings();
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
