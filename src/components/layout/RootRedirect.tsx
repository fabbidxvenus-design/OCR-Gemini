import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function RootRedirect() {
  const { isAuthenticated, checkSession } = useAuthStore();

  if (isAuthenticated && checkSession()) {
    return <Navigate to="/camera" replace />;
  }

  return <Navigate to="/" replace />;
}