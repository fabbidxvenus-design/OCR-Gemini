# TIP-002: Auth System (PIN Login + Logout)

## HEADER
- **TIP-ID**: TIP-002
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Authentication
- **Priority**: P0
- **Depends on**: TIP-001
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Zustand 4 + Dexie.js 4 + bcryptjs 2.4 + Tailwind CSS 3
- **Key files to read first**: 
  - `BUILDER-HANDOFF.md` (auth patterns, IndexedDB schema)
  - `src/db/schema.ts` (will be created in this TIP)
- **Patterns to follow**: Simple PIN authentication with bcrypt hashing, localStorage for session state

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Implement a simple PIN-based authentication system with login and logout functionality. Users enter a 4-6 digit PIN which is hashed with bcrypt and stored in IndexedDB. Session state is managed with Zustand and persists in localStorage. Create LoginPage component with PIN input, validation, and error handling. Implement auth store with login/logout actions and session expiry (24 hours).

---

## SPECIFICATIONS

### Business Rules

1. **PIN format**: 4-6 digits only (numeric)
2. **PIN hashing**: Use bcryptjs with salt rounds = 10
3. **Session duration**: 24 hours from last login
4. **Session storage**: Zustand store persisted to localStorage
5. **First-time setup**: If no PIN exists in IndexedDB, user sets initial PIN
6. **PIN validation**: Check hashed PIN against stored hash
7. **Auto-logout**: Session expires after 24 hours

### Database Schema (Dexie)

**src/db/schema.ts**:
```typescript
import Dexie, { Table } from 'dexie';

export interface AuthState {
  id?: number;
  pinHash: string;
  lastLogin: Date;
  sessionExpiry: Date;
}

export interface ScanRecord {
  id?: string;
  timestamp: Date;
  imageBlob: Blob;
  imageDataUrl: string;
  ocrRaw: string;
  ocrStructured: any;
  edited: boolean;
  tokenUsage: {
    input: number;
    output: number;
    cost: number;
  };
}

export interface AnalyticsCache {
  id?: number;
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  topProducts: Array<{ name: string; count: number }>;
  lastUpdated: Date;
}

export class OCRDatabase extends Dexie {
  auth!: Table<AuthState, number>;
  scans!: Table<ScanRecord, string>;
  analytics!: Table<AnalyticsCache, number>;

  constructor() {
    super('OCRDatabase');
    this.version(1).stores({
      auth: '++id',
      scans: 'id, timestamp, edited',
      analytics: '++id',
    });
  }
}

export const db = new OCRDatabase();
```

### Auth Store (Zustand)

**src/store/authStore.ts**:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  login: () => void;
  logout: () => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      sessionExpiry: null,

      login: () => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        set({ isAuthenticated: true, sessionExpiry: expiry });
      },

      logout: () => {
        set({ isAuthenticated: false, sessionExpiry: null });
      },

      checkSession: () => {
        const { sessionExpiry, isAuthenticated } = get();
        if (!isAuthenticated || !sessionExpiry) return false;
        
        const now = new Date();
        if (now > new Date(sessionExpiry)) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Auth Utilities

**src/lib/auth.ts**:
```typescript
import bcrypt from 'bcryptjs';
import { db } from '@/db/schema';

const SALT_ROUNDS = 10;

export async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function getStoredPINHash(): Promise<string | null> {
  const authRecords = await db.auth.toArray();
  if (authRecords.length === 0) return null;
  return authRecords[0].pinHash;
}

export async function storePINHash(pinHash: string): Promise<void> {
  const now = new Date();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);

  await db.auth.clear();
  await db.auth.add({
    pinHash,
    lastLogin: now,
    sessionExpiry: expiry,
  });
}

export async function updateLastLogin(): Promise<void> {
  const authRecords = await db.auth.toArray();
  if (authRecords.length === 0) return;

  const now = new Date();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);

  await db.auth.update(authRecords[0].id!, {
    lastLogin: now,
    sessionExpiry: expiry,
  });
}

export function validatePINFormat(pin: string): { valid: boolean; error?: string } {
  if (!pin) return { valid: false, error: 'PIN không được để trống' };
  if (!/^\d+$/.test(pin)) return { valid: false, error: 'PIN chỉ được chứa số' };
  if (pin.length < 4) return { valid: false, error: 'PIN phải có ít nhất 4 chữ số' };
  if (pin.length > 6) return { valid: false, error: 'PIN không được quá 6 chữ số' };
  return { valid: true };
}
```

### Login Page Component

**src/pages/LoginPage.tsx**:
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  getStoredPINHash, 
  hashPIN, 
  verifyPIN, 
  storePINHash, 
  updateLastLogin,
  validatePINFormat 
} from '@/lib/auth';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    checkFirstTime();
  }, []);

  async function checkFirstTime() {
    const storedHash = await getStoredPINHash();
    setIsFirstTime(storedHash === null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isFirstTime) {
        await handleFirstTimeSetup();
      } else {
        await handleLogin();
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFirstTimeSetup() {
    const validation = validatePINFormat(pin);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    if (pin !== confirmPin) {
      setError('PIN xác nhận không khớp');
      return;
    }

    const pinHash = await hashPIN(pin);
    await storePINHash(pinHash);
    login();
    navigate('/camera');
  }

  async function handleLogin() {
    const validation = validatePINFormat(pin);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const storedHash = await getStoredPINHash();
    if (!storedHash) {
      setError('Không tìm thấy PIN. Vui lòng thiết lập lại.');
      setIsFirstTime(true);
      return;
    }

    const isValid = await verifyPIN(pin, storedHash);
    if (!isValid) {
      setError('PIN không đúng');
      return;
    }

    await updateLastLogin();
    login();
    navigate('/camera');
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isFirstTime ? 'Thiết lập PIN' : 'Đăng nhập'}
          </h1>
          <p className="text-neutral">
            {isFirstTime 
              ? 'Tạo mã PIN 4-6 chữ số để bảo mật ứng dụng' 
              : 'Nhập mã PIN để tiếp tục'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstTime ? 'Mã PIN mới' : 'Mã PIN'}
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="••••"
              autoFocus
              required
            />
          </div>

          {isFirstTime && (
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận PIN
              </label>
              <input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-sm text-error text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin || (isFirstTime && !confirmPin)}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
          >
            {loading ? 'Đang xử lý...' : isFirstTime ? 'Tạo PIN' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral">
            OCR Gemini Mobile Web POC
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Validation

1. **PIN format**: 4-6 digits, numeric only
2. **First-time setup**: PIN and confirm PIN must match
3. **Login**: PIN must match stored hash
4. **Session**: Check expiry before allowing access

### Error Handling

- **Empty PIN**: "PIN không được để trống"
- **Non-numeric**: "PIN chỉ được chứa số"
- **Too short**: "PIN phải có ít nhất 4 chữ số"
- **Too long**: "PIN không được quá 6 chữ số"
- **Mismatch**: "PIN xác nhận không khớp"
- **Wrong PIN**: "PIN không đúng"
- **Database error**: "Đã xảy ra lỗi. Vui lòng thử lại."

---

## ACCEPTANCE CRITERIA

### AC-001: First-Time Setup
- **Given**: No PIN exists in IndexedDB
- **When**: User opens app
- **Then**: 
  - Login page shows "Thiết lập PIN" heading
  - Two input fields appear (PIN + Confirm PIN)
  - Submit button is disabled until both fields filled

### AC-002: PIN Creation
- **Given**: First-time setup mode
- **When**: User enters "1234" in both fields and submits
- **Then**:
  - PIN is hashed with bcrypt
  - Hash is stored in IndexedDB
  - User is logged in (Zustand state updated)
  - User is redirected to /camera

### AC-003: PIN Validation
- **Given**: First-time setup mode
- **When**: User enters "123" (too short)
- **Then**: Error message "PIN phải có ít nhất 4 chữ số" appears

### AC-004: PIN Mismatch
- **Given**: First-time setup mode
- **When**: User enters "1234" and "5678" (different)
- **Then**: Error message "PIN xác nhận không khớp" appears

### AC-005: Login Success
- **Given**: PIN "1234" already exists in IndexedDB
- **When**: User enters "1234" and submits
- **Then**:
  - PIN is verified against stored hash
  - User is logged in
  - Session expiry is set to 24 hours from now
  - User is redirected to /camera

### AC-006: Login Failure
- **Given**: PIN "1234" exists in IndexedDB
- **When**: User enters "5678" (wrong PIN)
- **Then**: Error message "PIN không đúng" appears

### AC-007: Session Persistence
- **Given**: User logged in successfully
- **When**: User refreshes page
- **Then**: 
  - Zustand state persists from localStorage
  - User remains logged in (no redirect to login)

### AC-008: Logout
- **Given**: User is logged in
- **When**: `logout()` is called from auth store
- **Then**:
  - `isAuthenticated` becomes false
  - `sessionExpiry` is cleared
  - localStorage is updated

---

## CONSTRAINTS

### DO NOT:
- ❌ Use plain text PIN storage — must hash with bcrypt
- ❌ Use cookies or sessionStorage — must use Zustand + localStorage
- ❌ Implement "forgot PIN" feature — out of scope for POC
- ❌ Add biometric auth — PIN only for MVP
- ❌ Create separate registration page — first-time setup is inline
- ❌ Implement multi-user support — single user only

### REUSE:
- ✅ Tailwind utility classes for styling
- ✅ Lucide React icons (Lock icon)
- ✅ Dexie.js for IndexedDB operations
- ✅ Zustand persist middleware for localStorage

### SKIP (out of scope for TIP-002):
- ⏭️ Protected routes (will be in TIP-005)
- ⏭️ Session timeout UI notification
- ⏭️ PIN reset functionality
- ⏭️ Remember me checkbox
- ⏭️ Login attempt limiting

---

## COMPLETION CHECKLIST

- [ ] `src/db/schema.ts` created with Dexie schema
- [ ] `src/store/authStore.ts` created with Zustand store
- [ ] `src/lib/auth.ts` created with auth utilities
- [ ] `src/pages/LoginPage.tsx` created
- [ ] First-time setup flow works (create PIN)
- [ ] Login flow works (verify PIN)
- [ ] PIN validation works (4-6 digits, numeric only)
- [ ] Error messages display correctly
- [ ] Session persists across page refresh
- [ ] Logout clears session state
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-002 | Generated: 2026-05-05 | Vibecode Kit v5.0*