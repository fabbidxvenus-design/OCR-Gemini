import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserPlus, Camera, Shield } from 'lucide-react';
import { PrimaryButton, InputField, PasswordInput, Checkbox } from '@/components/ui';

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
  const { login } = useAuthStore();

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
      // Simulate registration
      const passwordHash = btoa(email + password);
      localStorage.setItem('ocr_credentials', JSON.stringify({
        storedEmail: email,
        storedPasswordHash: passwordHash,
      }));

      login();
      navigate('/camera');
    } catch {
      setErrors({ email: 'Đã xảy ra lỗi khi đăng ký' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg shadow-primary/25">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">OCR App</h1>
          <p className="text-text-secondary text-sm">Tạo tài khoản mới</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-sm animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Đăng ký</h2>
              <p className="text-sm text-text-secondary mt-1">Nhập thông tin của bạn</p>
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

              <Checkbox
                label="Tôi đồng ý với điều khoản dịch vụ"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-2"
              />
              {errors.terms && touched.terms && (
                <p className="text-label text-error mt-1">{errors.terms}</p>
              )}

              <PrimaryButton
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </PrimaryButton>
            </form>
          </div>

          <div className="text-center mt-6">
            <span className="text-text-secondary text-small">Đã có tài khoản? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-text-secondary">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Dữ liệu được bảo mật</span>
          </div>
        </div>
      </div>
    </div>
  );
}
