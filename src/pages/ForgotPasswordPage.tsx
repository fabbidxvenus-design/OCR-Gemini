import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Key, Camera, ChevronLeft, Shield } from 'lucide-react';
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
      <div className="min-h-screen bg-surface flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success-light rounded-full mb-6">
              <Key className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Kiểm tra email</h2>
            <p className="text-text-secondary mb-8">
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.
            </p>
            <PrimaryButton
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Quay lại đăng nhập
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
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
          <p className="text-text-secondary text-sm">Khôi phục mật khẩu</p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-sm animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Quên mật khẩu</h2>
              <p className="text-sm text-text-secondary mt-1">Nhập email để nhận link đặt lại</p>
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

              <PrimaryButton
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </PrimaryButton>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-small text-text-secondary hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-text-secondary">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Bảo mật tài khoản của bạn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
