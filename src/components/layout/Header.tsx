import { LogOut, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title, showBack }: HeaderProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-card-border safe-area-top">
      <div className="flex items-center justify-between h-header px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-11 h-11 -ml-2 text-text-secondary hover:text-text-primary transition-colors rounded-sm"
              aria-label="Quay lại"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-heading text-text-primary">
            {title || 'OCR App'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
