import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, expiresAt } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    return unsubscribe;
  }, []);

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface" role="status" aria-live="polite">
        <span className="text-body text-text-secondary">Đang kiểm tra phiên đăng nhập...</span>
      </main>
    );
  }

  const expiryTime = expiresAt ? Date.parse(expiresAt) : NaN;
  const isValidSession = Boolean(isAuthenticated && Number.isFinite(expiryTime) && Date.now() < expiryTime);

  if (!isValidSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}