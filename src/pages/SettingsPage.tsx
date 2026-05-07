import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { MODEL_CONFIGS } from '@/lib/models';
import Layout from '@/components/layout/Layout';
import { Spinner, PrimaryButton, Toast } from '@/components/ui';
import { Check, Info, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { settings, isLoading, updateModelTier } = useSettings();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleTierChange = async (tier: 'free' | 'default' | 'high') => {
    setIsSaving(true);
    try {
      await updateModelTier(tier);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Failed to update tier:', error);
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
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cài đặt">
      <div className="p-screen space-y-section pb-24 bg-surface min-h-full">
        {/* Model Selection section */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-label font-bold uppercase tracking-widest text-text-secondary">Chất lượng OCR</h2>
            <Info className="w-4 h-4 text-text-placeholder" />
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
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                    isSelected
                      ? 'border-primary bg-primary-light ring-4 ring-primary/5'
                      : 'border-surface bg-surface hover:border-card-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-body ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                      {config.name}
                    </span>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-small text-text-secondary leading-snug mb-3">
                    {config.description}
                  </p>
                  <div className={`text-label font-medium px-2 py-1 rounded inline-block ${isSelected ? 'bg-primary/10 text-primary' : 'bg-card-border/50 text-text-secondary'}`}>
                    ${config.pricing.input}/1M tokens
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info section */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-secondary mb-1">
            <h2 className="text-label font-bold uppercase tracking-widest">Thông tin hệ thống</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-surface">
              <span className="text-small text-text-secondary">Phiên bản</span>
              <span className="text-small font-bold text-text-primary">1.0.0-industrial</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface">
              <span className="text-small text-text-secondary">Bảo mật</span>
              <div className="flex items-center gap-1 text-success">
                <Shield className="w-4 h-4" />
                <span className="text-small font-bold">AES-256</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="pt-4">
          <PrimaryButton variant="danger" className="w-full h-btn-primary" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-2" />
            Đăng xuất tài khoản
          </PrimaryButton>
          <p className="text-center text-label text-text-placeholder mt-4">
            Thiết bị: {navigator.platform} • v1.0.0
          </p>
        </div>

        {showToast && <Toast message="Đã lưu thay đổi" type="success" onClose={() => setShowToast(false)} />}
      </div>
    </Layout>
  );
}
