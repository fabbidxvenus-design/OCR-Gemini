import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';

vi.mock('@/lib/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/authApi')>();
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      updateProfile: vi.fn(),
    },
  };
});

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
});
