import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Lock, Camera, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg shadow-primary/25">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">OCR App</h1>
          <p className="text-text-secondary text-sm">Quét hóa đơn bằng AI</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-sm animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Đăng nhập</h2>
              <p className="text-sm text-text-secondary mt-1">Nhập email và mật khẩu</p>
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-small text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <PrimaryButton
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : 'Đăng nhập'}
              </PrimaryButton>
            </form>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <span className="text-text-secondary text-small">Chưa có tài khoản? </span>
            <Link to="/register" className="text-primary font-medium hover:underline">
              Đăng ký
            </Link>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-text-secondary">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Dữ liệu được mã hóa</span>
          </div>
        </div>
      </div>
    </div>
  );
}