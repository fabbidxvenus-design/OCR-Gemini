import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  login: () => void;
  logout: () => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      sessionExpiry: null,

      login: () => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        set({ isAuthenticated: true, sessionExpiry: expiry });
      },

      logout: () => {
        set({ isAuthenticated: false, sessionExpiry: null });
      },

      checkSession: () => {
        const { sessionExpiry, isAuthenticated } = get();
        if (!isAuthenticated || !sessionExpiry) return false;

        const now = new Date();
        if (now > new Date(sessionExpiry)) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);