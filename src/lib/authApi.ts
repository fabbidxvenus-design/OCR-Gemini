import { apiClient } from './apiClient';
import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'manager', 'user']),
  createdAt: z.string().optional(),
  lastLogin: z.string().optional().nullable(),
});

export const AuthSessionSchema = z.object({
  user: UserProfileSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string(), // ISO timestamp from backend
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthSession>('/api/auth/login', { email, password, audience: 'mobile' }, { schema: AuthSessionSchema }),

  register: (email: string, password: string) =>
    apiClient.post<AuthSession>('/api/auth/register', { email, password, audience: 'mobile' }, { schema: AuthSessionSchema }),

  forgotPassword: (email: string) =>
    apiClient.post<{ success: boolean }>('/api/auth/forgot-password', { email }),

  logout: (accessToken?: string | null) =>
    apiClient.post<void>('/api/auth/logout', undefined, { accessToken }),

  getSession: (accessToken: string) =>
    apiClient.get<UserProfile>('/api/auth/me', { accessToken, schema: UserProfileSchema }),
};
