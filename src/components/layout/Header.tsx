import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-card-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-semibold text-text-primary">
          {title || 'OCR Gemini'}
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors touch-target p-2"
          aria-label="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}