import { LogOut, ChevronLeft, Wifi } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useIsTablet } from '@/hooks/useMediaQuery';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title, showBack }: HeaderProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const profileInitial = (user?.displayName || user?.email || 'U').trim().slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-card-border/80 bg-surface/95 safe-area-top backdrop-blur-xl">
      <div className={`flex h-header items-center justify-between ${isTablet ? 'px-8' : 'px-screen'}`}>
        <div className="flex min-w-0 items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="touch-target -ml-3 flex items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-card hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Quay lại"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-caption font-semibold uppercase tracking-[0.18em] text-primary">HLVN OCR</p>
            <h1 className="truncate font-display text-heading text-text-primary">
              {title || 'Quét tài liệu'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-success/20 bg-success-light px-3 py-1.5 text-caption font-semibold text-success sm:flex">
            <Wifi className="h-3.5 w-3.5" />
            API Online
          </div>
          <button
            type="button"
            onClick={handleProfile}
            className="touch-target flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-small font-bold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Mở hồ sơ cá nhân"
            title={user?.displayName || user?.email || 'Hồ sơ'}
          >
            {profileInitial}
          </button>
          {!isTablet && (
            <button
              onClick={handleLogout}
              className="touch-target flex items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-card hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
