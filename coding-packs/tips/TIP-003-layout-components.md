# TIP-003: Layout Components (Header + BottomNav)

## HEADER
- **TIP-ID**: TIP-003
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Layout
- **Priority**: P0
- **Depends on**: TIP-001
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3 + Zustand 4 + React Router 6 + Lucide React
- **Key files to read first**: 
  - `BUILDER-HANDOFF.md` (folder structure, naming conventions)
  - `src/App.tsx` (will be modified to use Layout)
- **Patterns to follow**: Mobile-first responsive design, 44px minimum touch targets, Tailwind utility classes

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Create reusable layout components for the mobile web app: Header with title and logout button, BottomNav with 4 navigation items (Camera, History, Analytics, Profile), and Layout wrapper component. Components must be mobile-optimized with proper touch targets, responsive design, and active state indicators. Integrate with React Router for navigation.

---

## SPECIFICATIONS

### Business Rules

1. **Header**: Fixed top bar with app title and logout button (when authenticated)
2. **BottomNav**: Fixed bottom bar with 4 navigation items
3. **Layout**: Wrapper component that includes Header + content area + BottomNav
4. **Touch targets**: Minimum 44px × 44px for all interactive elements
5. **Active state**: Highlight current route in BottomNav
6. **Responsive**: Mobile-first, test at 375px, 390px, 428px viewports
7. **Logout**: Trigger auth store logout action and redirect to login

### Component Structure

**src/components/layout/Header.tsx**:
```typescript
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

export default function Header({ title = 'OCR Gemini', showLogout = true }: HeaderProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {showLogout && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 text-neutral hover:text-error transition-colors touch-target"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
```

**src/components/layout/BottomNav.tsx**:
```typescript
import { Camera, History, BarChart3, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/camera', icon: Camera, label: 'Chụp' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/analytics', icon: BarChart3, label: 'Thống kê' },
  { to: '/profile', icon: User, label: 'Cá nhân' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full touch-target transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-neutral hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-6 h-6 mb-1" />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
```

**src/components/layout/Layout.tsx**:
```typescript
import { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
  showLogout?: boolean;
}

export default function Layout({
  children,
  title,
  showHeader = true,
  showBottomNav = true,
  showLogout = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {showHeader && <Header title={title} showLogout={showLogout} />}
      <main
        className={`${showHeader ? 'pt-14' : ''} ${showBottomNav ? 'pb-16' : ''}`}
        style={{ minHeight: 'calc(100vh - 3.5rem - 4rem)' }}
      >
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
```

### Placeholder Pages (for navigation testing)

**src/pages/CameraPage.tsx**:
```typescript
import Layout from '@/components/layout/Layout';

export default function CameraPage() {
  return (
    <Layout title="Chụp ảnh">
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral">Camera page (TIP-006)</p>
      </div>
    </Layout>
  );
}
```

**src/pages/HistoryPage.tsx**:
```typescript
import Layout from '@/components/layout/Layout';

export default function HistoryPage() {
  return (
    <Layout title="Lịch sử">
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral">History page (TIP-013)</p>
      </div>
    </Layout>
  );
}
```

**src/pages/AnalyticsPage.tsx**:
```typescript
import Layout from '@/components/layout/Layout';

export default function AnalyticsPage() {
  return (
    <Layout title="Thống kê">
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral">Analytics page (TIP-015)</p>
      </div>
    </Layout>
  );
}
```

**src/pages/ProfilePage.tsx**:
```typescript
import Layout from '@/components/layout/Layout';

export default function ProfilePage() {
  return (
    <Layout title="Cá nhân">
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral">Profile page (TIP-016)</p>
      </div>
    </Layout>
  );
}
```

### Update App.tsx (temporary routing for testing)

**src/App.tsx**:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CameraPage from './pages/CameraPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Validation

1. **Touch targets**: All nav items and logout button must be ≥ 44px × 44px
2. **Active state**: Current route must be highlighted in BottomNav
3. **Logout**: Must clear auth state and redirect to login
4. **Responsive**: Must work at 375px, 390px, 428px viewports
5. **Fixed positioning**: Header and BottomNav must stay fixed during scroll

### Error Handling

- **Logout failure**: If logout action fails, still redirect to login (fail-safe)
- **Navigation error**: React Router will handle invalid routes (404 in TIP-005)

---

## ACCEPTANCE CRITERIA

### AC-001: Header Component
- **Given**: User is on any authenticated page
- **When**: Header renders
- **Then**: 
  - App title "OCR Gemini" displays on the left
  - Logout button (LogOut icon) displays on the right
  - Header is fixed at top with white background
  - Height is 56px (h-14)

### AC-002: Logout Button
- **Given**: User is authenticated and on any page
- **When**: User taps logout button
- **Then**:
  - Auth store `logout()` is called
  - User is redirected to `/login`
  - Session state is cleared

### AC-003: BottomNav Component
- **Given**: User is on any authenticated page
- **When**: BottomNav renders
- **Then**:
  - 4 nav items display: Chụp, Lịch sử, Thống kê, Cá nhân
  - Each item has icon + label
  - BottomNav is fixed at bottom with white background
  - Height is 64px (h-16)

### AC-004: Active State
- **Given**: User is on `/camera` page
- **When**: BottomNav renders
- **Then**:
  - Camera nav item is highlighted (text-primary, font-semibold)
  - Other nav items are neutral (text-neutral, font-normal)

### AC-005: Navigation
- **Given**: User is on `/camera` page
- **When**: User taps "Lịch sử" nav item
- **Then**:
  - User navigates to `/history`
  - History nav item becomes active
  - Camera nav item becomes inactive

### AC-006: Layout Component
- **Given**: Any page uses Layout wrapper
- **When**: Page renders
- **Then**:
  - Header displays at top (if showHeader=true)
  - Content area has correct padding (pt-14 pb-16)
  - BottomNav displays at bottom (if showBottomNav=true)
  - No content is hidden behind fixed elements

### AC-007: Touch Targets
- **Given**: User is on mobile device
- **When**: User taps any nav item or logout button
- **Then**:
  - Touch target is ≥ 44px × 44px
  - Tap registers correctly
  - No accidental taps on adjacent items

### AC-008: Responsive Design
- **Given**: User views app at 375px, 390px, 428px viewports
- **When**: Layout renders
- **Then**:
  - No horizontal scroll
  - Nav items are evenly spaced
  - Text is readable
  - Icons are properly sized

---

## CONSTRAINTS

### DO NOT:
- ❌ Use absolute positioning for content — use padding to avoid overlap
- ❌ Hardcode routes — use React Router NavLink
- ❌ Use custom CSS classes — use Tailwind utilities only
- ❌ Implement profile/settings features yet — placeholder only
- ❌ Add animations yet — keep simple for MVP
- ❌ Create mobile menu/hamburger — bottom nav is primary navigation

### REUSE:
- ✅ Tailwind utility classes for styling
- ✅ Lucide React icons (Camera, History, BarChart3, User, LogOut)
- ✅ React Router NavLink for active state
- ✅ Zustand auth store for logout action

### SKIP (out of scope for TIP-003):
- ⏭️ Protected routes (will be in TIP-005)
- ⏭️ Profile page content (will be in TIP-016)
- ⏭️ Animations/transitions
- ⏭️ Dark mode toggle
- ⏭️ Notification badges

---

## COMPLETION CHECKLIST

- [ ] `src/components/layout/Header.tsx` created
- [ ] `src/components/layout/BottomNav.tsx` created
- [ ] `src/components/layout/Layout.tsx` created
- [ ] `src/pages/CameraPage.tsx` created (placeholder)
- [ ] `src/pages/HistoryPage.tsx` created (placeholder)
- [ ] `src/pages/AnalyticsPage.tsx` created (placeholder)
- [ ] `src/pages/ProfilePage.tsx` created (placeholder)
- [ ] `src/App.tsx` updated with routing
- [ ] Header displays with title and logout button
- [ ] BottomNav displays with 4 nav items
- [ ] Active state works (current route highlighted)
- [ ] Logout button clears auth and redirects
- [ ] Touch targets are ≥ 44px × 44px
- [ ] Responsive at 375px, 390px, 428px
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-003 | Generated: 2026-05-05 | Vibecode Kit v5.0*
