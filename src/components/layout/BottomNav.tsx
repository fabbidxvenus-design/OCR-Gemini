import { NavLink } from 'react-router-dom';
import { Camera, History, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { to: '/camera', icon: Camera, label: 'Quét' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/analytics', icon: BarChart3, label: 'Phân tích' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function BottomNav() {
  return (
    <nav aria-label="Điều hướng chính" className="fixed bottom-0 left-0 right-0 z-40 border-t border-card-border/80 bg-surface/95 safe-area-bottom backdrop-blur-xl">
      <div className="flex h-bottom-nav items-stretch justify-around px-1 pt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-1/2 top-1 h-1 w-10 -translate-x-1/2 rounded-full bg-primary" />
                )}
                <Icon className={`mt-2 h-6 w-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-caption font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
