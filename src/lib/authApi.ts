import { apiClient } from './apiClient';
import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'manager', 'user']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastLogin: z.string().optional().nullable(),
  displayName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const ProfileUpdatePayloadSchema = z.object({
  displayName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const AuthSessionSchema = z.object({
  user: UserProfileSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string(), // ISO timestamp from backend
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ProfileUpdatePayload = z.infer<typeof ProfileUpdatePayloadSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export function normalizeProfileUpdatePayload(input: ProfileUpdatePayload): ProfileUpdatePayload {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === 'string' && value.trim() === '' ? null : value,
    ])
  ) as ProfileUpdatePayload;
}

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

  updateProfile: (payload: ProfileUpdatePayload, accessToken: string) =>
    apiClient.patch<UserProfile, ProfileUpdatePayload>('/api/auth/me', normalizeProfileUpdatePayload(payload), {
      accessToken,
      schema: UserProfileSchema,
    }),
};
