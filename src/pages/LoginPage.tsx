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
import { Lock, Camera, Shield } from 'lucide-react';

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
    } catch {
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
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg shadow-primary/25">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            OCR App
          </h1>
          <p className="text-text-secondary text-sm">
            Quét hóa đơn bằng AI
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-sm animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                {isFirstTime ? 'Thiết lập PIN' : 'Đăng nhập'}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {isFirstTime
                  ? 'Tạo mã PIN 4-6 chữ số'
                  : 'Nhập mã PIN để tiếp tục'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                  Mã PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-surface border border-card-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl font-mono tracking-[0.3em]"
                  placeholder="••••"
                  autoFocus
                  required
                />
              </div>

              {isFirstTime && (
                <div className="animate-fade-in">
                  <label htmlFor="confirmPin" className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
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
                    className="w-full px-4 py-4 bg-surface border border-card-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl font-mono tracking-[0.3em]"
                    placeholder="••••"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="bg-error/10 border border-error/20 rounded-xl p-3">
                  <p className="text-sm text-error text-center font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pin || (isFirstTime && pin.length < 4)}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-target active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : isFirstTime ? 'Tạo PIN' : 'Đăng nhập'}
              </button>
            </form>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-text-secondary">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Dữ liệu được lưu trữ cục bộ</span>
          </div>
        </div>
      </div>
    </div>
  );
}