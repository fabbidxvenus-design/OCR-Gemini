import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, UserPlus, ShieldCheck, Sparkles } from 'lucide-react';
import { PrimaryButton, InputField, PasswordInput, Checkbox } from '@/components/ui';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function getStrength(pass: string): 'weak' | 'medium' | 'strong' {
    if (pass.length < 6) return 'weak';
    if (pass.length < 10) return 'medium';
    return 'strong';
  }

  function validateEmail(value: string): string | undefined {
    if (!value) return 'Email là bắt buộc';
    if (!EMAIL_REGEX.test(value)) return 'Email không hợp lệ';
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return 'Mật khẩu là bắt buộc';
    if (value.length < MIN_PASSWORD_LENGTH) return `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
    return undefined;
  }

  function validateConfirmPassword(value: string, pass: string): string | undefined {
    if (!value) return 'Xác nhận mật khẩu là bắt buộc';
    if (value !== pass) return 'Mật khẩu không khớp';
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);
    const termsErr = !terms ? 'Bạn phải đồng ý với điều khoản' : undefined;

    setErrors({
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr,
      terms: termsErr
    });
    setTouched({ email: true, password: true, confirmPassword: true, terms: true });

    if (emailErr || passErr || confirmErr || termsErr) return;

    setLoading(true);

    try {
      const session = await authApi.register(email, password);
      useAuthStore.getState().setSession(session);
      navigate('/camera');
    } catch {
      setErrors({ email: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-screen py-6 text-text-primary">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-mobile flex-col justify-between">
        <section className="pt-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.18em] text-primary">HLVN OCR</p>
              <h1 className="mt-2 font-display text-display">Đăng ký</h1>
              <p className="mt-2 max-w-[260px] text-body-sm text-text-secondary">
                Tạo tài khoản mới để bắt đầu quét và quản lý hồ sơ.
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
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-heading-sm text-text-primary">Tạo tài khoản</h2>
                <p className="text-small text-text-secondary">Nhập thông tin của bạn</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                touched={touched.email}
                placeholder="email@example.com"
                autoComplete="email"
              />

              <PasswordInput
                label="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                touched={touched.password}
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                showStrength={password.length > 0}
                strengthLevel={getStrength(password)}
              />

              <PasswordInput
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />

              <div>
                <Checkbox
                  label="Tôi đồng ý với điều khoản dịch vụ"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                {errors.terms && touched.terms && (
                  <p className="mt-1 text-label text-error">{errors.terms}</p>
                )}
              </div>

              <PrimaryButton type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </PrimaryButton>
            </form>
          </div>
        </section>

        <footer className="pb-3 pt-6 text-center">
          <p className="text-small text-text-secondary">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
