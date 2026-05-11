import { describe, expect, it } from 'vitest';
import { AuthSessionSchema } from '@/lib/authApi';

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
