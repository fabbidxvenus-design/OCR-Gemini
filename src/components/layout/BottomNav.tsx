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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 h-full touch-target transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-neutral hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}