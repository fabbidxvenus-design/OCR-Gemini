import { NavLink } from 'react-router-dom';
import { Camera, History, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { to: '/camera', icon: Camera, label: 'Chụp ảnh' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/analytics', icon: BarChart3, label: 'Thống kê' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-card-border safe-area-bottom">
      <div className="flex items-center justify-around h-bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
