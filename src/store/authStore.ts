import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type AuthSession, type UserProfile } from '@/lib/authApi';

interface AuthStore {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  error: string | null;
  isLoading: boolean;
  login: (email: string, pin: string) => Promise<void>;
  setSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: null,
      isLoading: false,

      login: async (email, pin) => {
        set({ isLoading: true, error: null });
        try {
          const session = await authApi.login(email, pin);
          set({
            isAuthenticated: true,
            user: session.user,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err.message || 'Đăng nhập thất bại',
            isLoading: false,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      setSession: (session) => {
        set({
          isAuthenticated: true,
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt,
        });
      },

      logout: async () => {
        const { accessToken } = get();
        if (accessToken) {
          try {
            await authApi.logout(accessToken);
          } catch (err) {
            console.error('Logout API error:', err);
          }
        }

        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        });
      },

      checkSession: () => {
        const { expiresAt, isAuthenticated } = get();
        if (!isAuthenticated || !expiresAt) return false;

        if (Date.now() >= Date.parse(expiresAt)) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
