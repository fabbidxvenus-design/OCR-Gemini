import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';
import { createLocalOcrScan, getLocalOcrScan } from '@/lib/localOcrScans';
import type { ScanRecord } from '@/db/schema';

vi.mock('@/lib/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/authApi')>();
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      logout: vi.fn(),
      updateProfile: vi.fn(),
    },
  };
});

function buildScan(): Omit<ScanRecord, 'id'> {
  return {
    timestamp: new Date('2026-05-14T10:00:00.000Z'),
    imageDataUrl: 'data:image/png;base64,should-not-persist',
    ocrRaw: '商品名 VES 529CT',
    ocrStructured: {
      title: 'Mock OCR Result',
      fields: [{ field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' }],
      sizes: [],
      raw_text: '商品名 VES 529CT',
      notes: [],
    },
    edited: false,
    tokenUsage: { input: 10, output: 20, cost: 0.001, model: 'gemini-2.5-flash-lite' },
    apiKeyIndex: 1,
    modelTier: 'default',
  };
}

const user = {
  id: 'user-1',
  email: 'user@example.com',
  role: 'user' as const,
  createdAt: '2026-05-10T00:00:00.000Z',
  lastLogin: null,
  displayName: 'Nguyen Van A',
  description: null,
  phone: null,
  jobTitle: null,
  department: null,
  company: null,
  avatarUrl: null,
};

describe('authStore profile updates', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: null,
      isLoading: false,
    });
  });

  it('updates the profile while preserving tokens and expiry', async () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-05-10T01:00:00.000Z',
    });
    vi.mocked(authApi.updateProfile).mockResolvedValue({
      ...user,
      displayName: 'Tran Thi B',
      description: null,
    });

    await useAuthStore.getState().updateUserProfile({
      displayName: 'Tran Thi B',
      description: '',
    });

    expect(authApi.updateProfile).toHaveBeenCalledWith(
      { displayName: 'Tran Thi B', description: null },
      'access-token',
    );
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      user: { ...user, displayName: 'Tran Thi B', description: null },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-05-10T01:00:00.000Z',
      error: null,
      isLoading: false,
    });
  });

  it('clears stale local OCR scans when a new session is set', () => {
    const scanId = createLocalOcrScan(buildScan());

    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-05-10T01:00:00.000Z',
    });

    expect(getLocalOcrScan(scanId)).toBeUndefined();
  });

  it('clears local OCR scans on logout', async () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-05-10T01:00:00.000Z',
    });
    const scanId = createLocalOcrScan(buildScan());
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    expect(authApi.logout).toHaveBeenCalledWith('access-token');
    expect(getLocalOcrScan(scanId)).toBeUndefined();
  });
});
