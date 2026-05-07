# TIP-005: Routing + Protected Routes

## HEADER
- **TIP-ID**: TIP-005
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Routing
- **Priority**: P0
- **Depends on**: TIP-001, TIP-002
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + React Router 6 + Zustand 4
- **Key files to read first**: 
  - `src/App.tsx` (created in TIP-003, will be extended)
  - `src/store/authStore.ts` (created in TIP-002)
- **Patterns to follow**: Protected routes with auth check, automatic redirect to login, session expiry handling

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Implement complete routing system with protected routes that require authentication. Create ProtectedRoute wrapper component that checks auth state and session expiry before allowing access. Redirect unauthenticated users to login page. Handle session expiry gracefully by logging out and redirecting. Add 404 Not Found page for invalid routes.

---

## SPECIFICATIONS

### Business Rules

1. **Public routes**: `/login` only (accessible without authentication)
2. **Protected routes**: All other routes require authentication
3. **Session check**: Verify session is not expired before allowing access
4. **Auto-redirect**: Redirect to login if not authenticated or session expired
5. **Default route**: `/` redirects to `/camera` if authenticated, `/login` if not
6. **404 handling**: Show NotFoundPage for invalid routes
7. **Session expiry**: Auto-logout and redirect to login when session expires

### Protected Route Component

**src/components/routing/ProtectedRoute.tsx**:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkSession } = useAuthStore();

  // Check if session is still valid
  const sessionValid = checkSession();

  if (!isAuthenticated || !sessionValid) {
    // Redirect to login if not authenticated or session expired
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Root Redirect Component

**src/components/routing/RootRedirect.tsx**:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function RootRedirect() {
  const { isAuthenticated, checkSession } = useAuthStore();

  // Check if session is still valid
  const sessionValid = isAuthenticated && checkSession();

  // Redirect to camera if authenticated, login if not
  return <Navigate to={sessionValid ? '/camera' : '/login'} replace />;
}
```

### Not Found Page

**src/pages/NotFoundPage.tsx**:
```typescript
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-neutral mb-8">
          Không tìm thấy trang
        </p>
        <button
          onClick={() => navigate('/camera')}
          className="inline-flex items-center gap-2 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors touch-target"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
```

### Updated App.tsx with Protected Routes

**src/App.tsx**:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RootRedirect from './components/routing/RootRedirect';
import LoginPage from './pages/LoginPage';
import CameraPage from './pages/CameraPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Protected routes */}
        <Route
          path="/camera"
          element={
            <ProtectedRoute>
              <CameraPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Update LoginPage to Redirect After Login

**src/pages/LoginPage.tsx** (modify handleLogin and handleFirstTimeSetup):
```typescript
// In handleFirstTimeSetup function, replace:
// navigate('/camera');
// With:
const from = location.state?.from?.pathname || '/camera';
navigate(from, { replace: true });

// In handleLogin function, replace:
// navigate('/camera');
// With:
const from = location.state?.from?.pathname || '/camera';
navigate(from, { replace: true });
```

Add import at top:
```typescript
import { useNavigate, useLocation } from 'react-router-dom';
```

Update component:
```typescript
export default function LoginPage() {
  // ... existing state ...
  const navigate = useNavigate();
  const location = useLocation();
  
  // ... rest of component ...
}
```

### Session Expiry Handling

The session expiry is already handled in `authStore.ts` (created in TIP-002):
- `checkSession()` returns false if session expired
- `ProtectedRoute` calls `checkSession()` on every render
- If expired, user is redirected to login

### Validation

1. **Protected routes**: All routes except `/login` require authentication
2. **Session check**: Session expiry is checked before allowing access
3. **Auto-redirect**: Unauthenticated users are redirected to `/login`
4. **Root redirect**: `/` redirects based on auth state
5. **404 handling**: Invalid routes show NotFoundPage
6. **Return URL**: After login, user returns to originally requested page

### Error Handling

- **Invalid route**: Show 404 page with "Về trang chủ" button
- **Session expired**: Auto-logout and redirect to login
- **Auth check failure**: Treat as unauthenticated, redirect to login

---

## ACCEPTANCE CRITERIA

### AC-001: Protected Route Access (Authenticated)
- **Given**: User is authenticated with valid session
- **When**: User navigates to `/camera`
- **Then**:
  - CameraPage renders
  - No redirect occurs
  - User can access the page

### AC-002: Protected Route Access (Unauthenticated)
- **Given**: User is not authenticated
- **When**: User navigates to `/camera`
- **Then**:
  - User is redirected to `/login`
  - CameraPage does not render
  - URL changes to `/login`

### AC-003: Protected Route Access (Session Expired)
- **Given**: User was authenticated but session expired (>24 hours)
- **When**: User navigates to `/camera`
- **Then**:
  - `checkSession()` returns false
  - User is logged out automatically
  - User is redirected to `/login`

### AC-004: Root Redirect (Authenticated)
- **Given**: User is authenticated with valid session
- **When**: User navigates to `/`
- **Then**:
  - User is redirected to `/camera`
  - URL changes to `/camera`

### AC-005: Root Redirect (Unauthenticated)
- **Given**: User is not authenticated
- **When**: User navigates to `/`
- **Then**:
  - User is redirected to `/login`
  - URL changes to `/login`

### AC-006: Login Page Access
- **Given**: User is not authenticated
- **When**: User navigates to `/login`
- **Then**:
  - LoginPage renders
  - No redirect occurs
  - User can access the page

### AC-007: 404 Not Found
- **Given**: User navigates to invalid route `/invalid-page`
- **When**: Page loads
- **Then**:
  - NotFoundPage renders with "404" heading
  - "Không tìm thấy trang" message displays
  - "Về trang chủ" button is visible

### AC-008: 404 Navigation
- **Given**: User is on NotFoundPage
- **When**: User clicks "Về trang chủ" button
- **Then**:
  - User navigates to `/camera` (if authenticated)
  - User navigates to `/login` (if not authenticated)

### AC-009: Return URL After Login
- **Given**: Unauthenticated user tries to access `/history`
- **When**: User is redirected to login and logs in successfully
- **Then**:
  - User is redirected back to `/history`
  - Not to default `/camera` route

### AC-010: All Protected Routes
- **Given**: User is authenticated
- **When**: User navigates to `/camera`, `/history`, `/analytics`, `/profile`
- **Then**:
  - All pages render without redirect
  - BottomNav shows correct active state
  - Session check passes for all routes

---

## CONSTRAINTS

### DO NOT:
- ❌ Use localStorage directly for auth check — use Zustand store
- ❌ Implement role-based access control — single user only for POC
- ❌ Add route transitions/animations yet — keep simple
- ❌ Implement deep linking — basic routing only
- ❌ Add route guards beyond authentication — no permissions system
- ❌ Create nested routes — flat structure for MVP

### REUSE:
- ✅ React Router 6 for routing
- ✅ Zustand auth store for authentication state
- ✅ Existing LoginPage from TIP-002
- ✅ Existing layout pages from TIP-003
- ✅ Tailwind utility classes for styling

### SKIP (out of scope for TIP-005):
- ⏭️ Route transitions/animations
- ⏭️ Breadcrumbs
- ⏭️ Route-based code splitting
- ⏭️ Deep linking with query params
- ⏭️ Browser back button handling (React Router handles this)
- ⏭️ Route guards for specific features

---

## COMPLETION CHECKLIST

- [ ] `src/components/routing/ProtectedRoute.tsx` created
- [ ] `src/components/routing/RootRedirect.tsx` created
- [ ] `src/pages/NotFoundPage.tsx` created
- [ ] `src/App.tsx` updated with protected routes
- [ ] `src/pages/LoginPage.tsx` updated with return URL handling
- [ ] Protected routes require authentication
- [ ] Session expiry triggers logout and redirect
- [ ] Root `/` redirects based on auth state
- [ ] 404 page shows for invalid routes
- [ ] Return URL works after login
- [ ] All routes accessible when authenticated
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-005 | Generated: 2026-05-05 | Vibecode Kit v5.0*
