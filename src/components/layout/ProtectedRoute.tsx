import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Set up hydration listener only once
  useEffect(() => {
    if (!hasHydrated) {
      const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
      return unsubscribe;
    }
  }, [hasHydrated]);

  // Pure function to check session validity (no state modification)
  const isSessionValid = useAuthStore().checkSession();

  useEffect(() => {
    if (!hasHydrated) return;
    // checkSession calls Date.now() inside the store method, not during render
    const valid = useAuthStore.getState().checkSession();
    queueMicrotask(() => setIsValidSession(valid));
  }, [hasHydrated, isAuthenticated, expiresAt]);

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface" role="status" aria-live="polite">
        <span className="text-body text-text-secondary">Đang kiểm tra phiên đăng nhập...</span>
      </main>
    );
  }

  if (!isSessionValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}