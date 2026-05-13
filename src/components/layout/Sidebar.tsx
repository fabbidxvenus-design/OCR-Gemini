import { NavLink } from 'react-router-dom';
import { Camera, History, BarChart3, Settings, LogOut, Wifi } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/camera', icon: Camera, label: 'Quét scan' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/analytics', icon: BarChart3, label: 'Phân tích' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-sidebar flex-col border-r border-card-border bg-surface md:flex">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-card-border px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-md">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-primary">HLVN</p>
          <p className="font-display text-body-lg font-semibold text-text-primary">OCR App</p>
        </div>
      </div>

      {/* Status */}
      <div className="border-b border-card-border px-6 py-4">
        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-light px-3 py-2">
          <Wifi className="h-4 w-4 text-success" />
          <span className="text-small font-semibold text-success">API Online</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex h-12 items-center gap-3 rounded-xl px-4 transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-secondary hover:bg-card hover:text-text-primary'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-body font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-card-border p-4">
        <button
          onClick={handleLogout}
          className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-text-secondary transition-colors hover:bg-error-light hover:text-error focus:outline-none focus:ring-2 focus:ring-error"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-body font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
