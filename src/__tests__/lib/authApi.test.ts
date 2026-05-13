import { describe, expect, it } from 'vitest';
import { AuthSessionSchema, UserProfileSchema, normalizeProfileUpdatePayload } from '@/lib/authApi';

describe('AuthSessionSchema', () => {
  it('accepts the backend ISO expiresAt value', () => {
    const session = AuthSessionSchema.parse({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
        createdAt: '2026-05-10T00:00:00.000Z',
        lastLogin: null,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-05-10T01:00:00.000Z',
    });

    expect(session.expiresAt).toBe('2026-05-10T01:00:00.000Z');
  });
});

describe('UserProfileSchema', () => {
  it('accepts null or missing optional profile fields', () => {
    const profile = UserProfileSchema.parse({
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
      createdAt: '2026-05-10T00:00:00.000Z',
      lastLogin: null,
      displayName: null,
      description: null,
      phone: null,
    });

    expect(profile.displayName).toBeNull();
    expect(profile.jobTitle).toBeUndefined();
  });
});

describe('normalizeProfileUpdatePayload', () => {
  it('converts empty profile strings to null', () => {
    expect(normalizeProfileUpdatePayload({
      displayName: 'Tran Thi B',
      description: '',
      phone: '   ',
    })).toEqual({
      displayName: 'Tran Thi B',
      description: null,
      phone: null,
    });
  });
});
