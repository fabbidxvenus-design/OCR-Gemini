import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Camera, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { PrimaryButton, InputField, PasswordInput } from '@/components/ui';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  function validateEmail(value: string): string | undefined {
    if (!value) return 'Email là bắt buộc';
    if (!EMAIL_REGEX.test(value)) return 'Email không hợp lệ';
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return 'Mật khẩu là bắt buộc';
    return undefined;
  }

  function handleEmailBlur() {
    setTouched(prev => ({ ...prev, email: true }));
    setErrors(prev => ({ ...prev, email: validateEmail(email) }));
  }

  function handlePasswordBlur() {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    try {
      await login(email, password);
      navigate('/camera');
    } catch {
      setErrors({ email: 'Email hoặc mật khẩu không đúng' });
    }
  }

  return (
    <main className="min-h-screen bg-surface px-screen py-6 text-text-primary">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-mobile flex-col justify-between">
        <section className="pt-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.18em] text-primary">HLVN OCR</p>
              <h1 className="mt-2 font-display text-display">Đăng nhập</h1>
              <p className="mt-2 max-w-[260px] text-body-sm text-text-secondary">
                Công cụ quét hồ sơ vận hành bằng AI, tối ưu cho thiết bị di động.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-card">
              <Camera className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="card-production p-3">
              <Sparkles className="mb-2 h-5 w-5 text-ai" />
              <p className="text-caption text-text-muted">AI Model</p>
              <p className="text-small font-semibold text-text-primary">Gemini Pro</p>
            </div>
            <div className="card-production p-3">
              <ShieldCheck className="mb-2 h-5 w-5 text-success" />
              <p className="text-caption text-text-muted">Bảo mật</p>
              <p className="text-small font-semibold text-text-primary">Mã hóa phiên</p>
            </div>
          </div>

          <div className="card-production animate-slide-up p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-heading-sm text-text-primary">Truy cập hệ thống</h2>
                <p className="text-small text-text-secondary">Nhập tài khoản đã được cấp quyền</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                error={errors.email}
                touched={touched.email}
                placeholder="email@example.com"
                autoComplete="email"
                autoFocus
              />

              <PasswordInput
                label="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                error={errors.password}
                touched={touched.password}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />

              <div className="text-right">
                <Link to="/forgot-password" className="text-small font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <PrimaryButton type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </PrimaryButton>
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
