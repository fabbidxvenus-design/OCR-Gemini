import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Key, ChevronLeft, ShieldCheck, Mail } from 'lucide-react';
import { PrimaryButton, InputField } from '@/components/ui';
import { authApi } from '@/lib/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function validateEmail(value: string): string | undefined {
    if (!value) return 'Email là bắt buộc';
    if (!EMAIL_REGEX.test(value)) return 'Email không hợp lệ';
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    setError(emailErr);
    setTouched(true);

    if (emailErr) return;

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
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
              <Mail className="h-10 w-10 text-success" />
            </div>
            <h1 className="mb-3 font-display text-display text-text-primary">Kiểm tra email</h1>
            <p className="mb-8 text-body text-text-secondary">
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className="text-text-primary">{email}</strong>. Vui lòng kiểm tra hộp thư.
            </p>
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
              <h1 className="mt-2 font-display text-display">Quên mật khẩu</h1>
              <p className="mt-2 max-w-[260px] text-body-sm text-text-secondary">
                Nhập email để nhận link đặt lại mật khẩu.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-card">
              <Camera className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="mb-5 card-production p-3">
            <ShieldCheck className="mb-2 h-5 w-5 text-success" />
            <p className="text-caption text-text-muted">Bảo mật</p>
            <p className="text-small font-semibold text-text-primary">Link có hiệu lực 1 giờ</p>
          </div>

          <div className="card-production animate-slide-up p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-heading-sm text-text-primary">Khôi phục tài khoản</h2>
                <p className="text-small text-text-secondary">Nhập email đã đăng ký</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                touched={touched}
                placeholder="email@example.com"
                autoComplete="email"
              />

              <PrimaryButton type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </PrimaryButton>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-small text-text-secondary transition-colors hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </form>
          </div>
        </section>

        <footer className="pb-3 pt-6 text-center">
          <p className="text-small text-text-secondary">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Đăng ký
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
