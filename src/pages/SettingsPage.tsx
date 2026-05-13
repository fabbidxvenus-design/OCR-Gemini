import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { MODEL_CONFIGS } from '@/lib/models';
import Layout from '@/components/layout/Layout';
import { Spinner, PrimaryButton, Toast } from '@/components/ui';
import { Check, Info, Shield, LogOut, Zap, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { settings, isLoading, updateModelTier } = useSettings();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Đã lưu thay đổi');

  const handleTierChange = async (tier: 'free' | 'default' | 'high') => {
    setIsSaving(true);
    try {
      await updateModelTier(tier);
      setToastMessage('Đã lưu thay đổi');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      setToastMessage('Lỗi khi lưu cài đặt');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Layout title="Cài đặt">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cài đặt">
      <div className="space-y-4 pb-24">
        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-text-muted" />
            <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Chất lượng OCR</h2>
            <Info className="h-4 w-4 text-text-muted" />
          </div>

          <div className="space-y-3">
            {(['free', 'default', 'high'] as const).map((tier) => {
              const config = MODEL_CONFIGS[tier];
              const isSelected = settings.selectedModelTier === tier;

              return (
                <button
                  key={tier}
                  onClick={() => handleTierChange(tier)}
                  disabled={isSaving}
                  className={`group w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-light shadow-md'
                      : 'border-card-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`font-display text-heading-sm ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                      {config.name}
                    </span>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-small leading-relaxed text-text-secondary">
                    {config.description}
                  </p>
                  <div className={`inline-block rounded-full px-3 py-1 text-caption font-semibold ${isSelected ? 'bg-primary/20 text-primary' : 'bg-surface text-text-muted'}`}>
                    ${config.pricing.input}/1M tokens
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-text-muted" />
            <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Thông tin hệ thống</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-surface p-3">
              <span className="text-small text-text-secondary">Phiên bản</span>
              <span className="font-mono text-small font-semibold text-text-primary">1.0.0-industrial</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface p-3">
              <span className="text-small text-text-secondary">Bảo mật</span>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success" />
                <span className="font-mono text-small font-semibold text-success">AES-256</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface p-3">
              <span className="text-small text-text-secondary">Thiết bị</span>
              <span className="font-mono text-small font-semibold text-text-primary">{navigator.platform}</span>
            </div>
          </div>
        </section>

        <section className="card-production animate-fade-in p-4">
          <div className="mb-3 flex items-center gap-2">
            <LogOut className="h-5 w-5 text-error" />
            <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Vùng nguy hiểm</h2>
          </div>
          <p className="mb-4 text-small text-text-secondary">
            Đăng xuất sẽ xóa phiên làm việc hiện tại. Dữ liệu cục bộ vẫn được giữ lại.
          </p>
          <PrimaryButton variant="danger" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-5 w-5" />
            Đăng xuất tài khoản
          </PrimaryButton>
        </section>

        <div className="text-center">
          <p className="text-caption text-text-muted">
            HLVN OCR • Industrial Utility Design • 2026
          </p>
        </div>

        {showToast && <Toast message={toastMessage} type={toastMessage.includes('Lỗi') ? 'error' : 'success'} onClose={() => setShowToast(false)} />}
      </div>
    </Layout>
  );
}
