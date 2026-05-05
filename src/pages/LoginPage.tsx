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