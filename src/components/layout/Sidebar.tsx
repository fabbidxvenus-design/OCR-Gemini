import { NavLink } from 'react-router-dom';
import { Camera, History, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { to: '/camera', icon: Camera, label: 'Quét scan' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/analytics', icon: BarChart3, label: 'Thống kê' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="hidden md:flex w-sidebar flex-col h-screen bg-card border-r border-card-border fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-card-border">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <span className="text-body font-semibold text-text-primary">OCR App</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 h-12 px-4 rounded-xl mb-1 transition-all duration-150 ${
                isActive
                  ? 'bg-primary-light text-primary border-l-[3px] border-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-body font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-card-border">
        <button
          onClick={async () => {
            await logout();
          }}
          className="flex items-center gap-3 w-full h-12 px-4 rounded-xl text-text-secondary hover:bg-error-light hover:text-error transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-body font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
