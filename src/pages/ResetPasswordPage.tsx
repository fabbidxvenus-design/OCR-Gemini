import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, ChevronLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { PrimaryButton, InputField } from '@/components/ui';
import { authApi, type ResetPasswordCredential } from '@/lib/authApi';

const MIN_PASSWORD_LENGTH = 8;
const RESET_CREDENTIAL_STORAGE_KEY = 'hlvn.resetPasswordCredential';

function readStoredCredential(): ResetPasswordCredential | null {
  const stored = sessionStorage.getItem(RESET_CREDENTIAL_STORAGE_KEY);
  if (!stored) return null;

  try {
    const credential = JSON.parse(stored) as unknown;
    if (credential && typeof credential === 'object' && 'accessToken' in credential && typeof credential.accessToken === 'string') {
      return { accessToken: credential.accessToken };
    }
    if (credential && typeof credential === 'object' && 'code' in credential && typeof credential.code === 'string') {
      return { code: credential.code };
    }
  } catch {
    sessionStorage.removeItem(RESET_CREDENTIAL_STORAGE_KEY);
  }

  return null;
}

function getResetPasswordCredential(): ResetPasswordCredential | null {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);
  const type = hashParams.get('type') ?? queryParams.get('type');
  const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
  const code = queryParams.get('code') ?? hashParams.get('code');

  if (accessToken && (!type || type === 'recovery')) {
    const credential = { accessToken };
    sessionStorage.setItem(RESET_CREDENTIAL_STORAGE_KEY, JSON.stringify(credential));
    window.history.replaceState(null, '', '/reset-password');
    return credential;
  }

  if (code) {
    const credential = { code };
    sessionStorage.setItem(RESET_CREDENTIAL_STORAGE_KEY, JSON.stringify(credential));
    window.history.replaceState(null, '', '/reset-password');
    return credential;
  }

  return readStoredCredential();
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const credential = useMemo(() => getResetPasswordCredential(), []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => sessionStorage.removeItem(RESET_CREDENTIAL_STORAGE_KEY);
  }, []);

  function validatePassword(): string | undefined {
    if (password.length < MIN_PASSWORD_LENGTH) return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    const passwordErr = validatePassword();
    setError(passwordErr);
    if (passwordErr) return;

    if (!credential) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(password, credential);
      sessionStorage.removeItem(RESET_CREDENTIAL_STORAGE_KEY);
      window.history.replaceState(null, '', '/reset-password');
      setSuccess(true);
    } catch {
      setError('Không thể đặt lại mật khẩu. Vui lòng mở lại link trong email hoặc yêu cầu link mới.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-surface px-screen py-6 text-text-primary">
        <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-mobile flex-col justify-center">
          <div className="animate-fade-in text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-success-light">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="mb-3 font-display text-display text-text-primary">Đã đổi mật khẩu</h1>
            <p className="mb-8 text-body text-text-secondary">Bạn có thể đăng nhập lại bằng mật khẩu mới.</p>
            <PrimaryButton className="w-full" size="lg" onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </PrimaryButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-screen py-6 text-text-primary">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-mobile flex-col justify-between">
        <section className="pt-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.18em] text-primary">HLVN OCR</p>
              <h1 className="mt-2 font-display text-display">Đặt lại mật khẩu</h1>
              <p className="mt-2 max-w-[280px] text-body-sm text-text-secondary">Nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-card">
              <Camera className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="mb-5 card-production p-3">
            <ShieldCheck className="mb-2 h-5 w-5 text-success" />
            <p className="text-caption text-text-muted">Bảo mật</p>
            <p className="text-small font-semibold text-text-primary">Link chỉ dùng được một lần</p>
          </div>

          <div className="card-production animate-slide-up p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-heading-sm text-text-primary">Mật khẩu mới</h2>
                <p className="text-small text-text-secondary">Tối thiểu 8 ký tự</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Mật khẩu mới"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                touched={touched}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
              />

              <InputField
                label="Xác nhận mật khẩu"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                touched={touched}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
              />

              <PrimaryButton type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </PrimaryButton>

              <Link to="/forgot-password" className="flex items-center justify-center gap-2 text-small text-text-secondary transition-colors hover:text-primary">
                <ChevronLeft className="h-4 w-4" />
                Gửi lại link đặt mật khẩu
              </Link>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
