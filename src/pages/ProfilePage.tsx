import { useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { InputField, PrimaryButton, Toast } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import type { ProfileUpdatePayload, UserProfile } from '@/lib/authApi';
import { Briefcase, RotateCcw, Save, UserRound } from 'lucide-react';

interface ProfileFormState {
  displayName: string;
  description: string;
  phone: string;
  jobTitle: string;
  department: string;
  company: string;
  avatarUrl: string;
}

const DESCRIPTION_LIMIT = 280;
const PHONE_LIMIT = 32;
const PHONE_RE = /^[+()\d\s.-]+$/;

function profileToForm(user: UserProfile | null): ProfileFormState {
  return {
    displayName: user?.displayName ?? '',
    description: user?.description ?? '',
    phone: user?.phone ?? '',
    jobTitle: user?.jobTitle ?? '',
    department: user?.department ?? '',
    company: user?.company ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  };
}

function buildPayload(form: ProfileFormState): ProfileUpdatePayload {
  return {
    displayName: form.displayName,
    description: form.description,
    phone: form.phone,
    jobTitle: form.jobTitle,
    department: form.department,
    company: form.company,
    avatarUrl: form.avatarUrl,
  };
}

function validateProfile(form: ProfileFormState): Partial<Record<keyof ProfileFormState, string>> {
  const errors: Partial<Record<keyof ProfileFormState, string>> = {};
  if (form.description.length > DESCRIPTION_LIMIT) {
    errors.description = `Mô tả không được vượt quá ${DESCRIPTION_LIMIT} ký tự`;
  }
  if (form.phone.length > PHONE_LIMIT) {
    errors.phone = `Số điện thoại không được vượt quá ${PHONE_LIMIT} ký tự`;
  } else if (form.phone.trim() && !PHONE_RE.test(form.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  if (form.avatarUrl.trim() && !form.avatarUrl.startsWith('https://') && !/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(form.avatarUrl)) {
    errors.avatarUrl = 'Ảnh đại diện phải là HTTPS hoặc data image hợp lệ';
  }
  return errors;
}

export default function ProfilePage() {
  const { user, updateUserProfile, isLoading } = useAuthStore();
  const persistedForm = useMemo(() => profileToForm(user), [user]);
  const [form, setForm] = useState<ProfileFormState>(persistedForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const initials = (user?.displayName || user?.email || 'U').trim().slice(0, 1).toUpperCase();

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleReset = () => {
    setForm(persistedForm);
    setErrors({});
    setToast({ message: 'Đã khôi phục thông tin đã lưu', type: 'success' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateUserProfile(buildPayload(form));
      setToast({ message: 'Đã cập nhật hồ sơ', type: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ';
      setToast({ message, type: 'error' });
    }
  };

  return (
    <Layout title="Hồ sơ" showBack>
      <form className="space-y-4 pb-28" onSubmit={handleSubmit} noValidate>
        <section className="card-production animate-fade-in overflow-hidden">
          <div className="bg-gradient-to-br from-primary-light via-card to-surface p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-heading-lg font-bold text-white shadow-card">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-caption font-semibold uppercase tracking-[0.16em] text-primary">Tài khoản người dùng</p>
                <h2 className="truncate font-display text-heading-lg text-text-primary">
                  {user?.displayName || user?.email || 'Người dùng HLVN'}
                </h2>
                <p className="truncate text-small text-text-secondary">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card-production animate-fade-in space-y-4 p-4">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-text-muted" />
            <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Thông tin cá nhân</h2>
          </div>
          <InputField label="Tên hiển thị" value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} />
          <div>
            <label htmlFor="profile-description" className="mb-2 block text-label uppercase tracking-wide text-text-secondary">
              Mô tả
            </label>
            <textarea
              id="profile-description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`min-h-28 w-full rounded-sm border bg-card px-4 py-3 text-body text-text-primary placeholder:text-text-placeholder transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.description ? 'border-error ring-2 ring-error/20 focus:border-error focus:ring-error/20' : 'border-card-border focus:border-primary focus:ring-primary/20'
              }`}
              aria-describedby="profile-description-help"
            />
            <div id="profile-description-help" className="mt-2 flex items-center justify-between text-caption">
              <span className={errors.description ? 'text-error-text' : 'text-text-muted'}>{errors.description ?? 'Giới thiệu ngắn về vai trò hoặc ca làm việc'}</span>
              <span className="text-text-muted">{form.description.length}/{DESCRIPTION_LIMIT}</span>
            </div>
          </div>
          <InputField label="Số điện thoại" value={form.phone} error={errors.phone} touched={Boolean(errors.phone)} onChange={(event) => updateField('phone', event.target.value)} />
          <InputField label="Ảnh đại diện URL" value={form.avatarUrl} error={errors.avatarUrl} touched={Boolean(errors.avatarUrl)} onChange={(event) => updateField('avatarUrl', event.target.value)} />
        </section>

        <section className="card-production animate-fade-in space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-text-muted" />
            <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Công việc</h2>
          </div>
          <InputField label="Chức danh" value={form.jobTitle} onChange={(event) => updateField('jobTitle', event.target.value)} />
          <InputField label="Phòng ban" value={form.department} onChange={(event) => updateField('department', event.target.value)} />
          <InputField label="Công ty" value={form.company} onChange={(event) => updateField('company', event.target.value)} />
        </section>

        <section className="card-production sticky bottom-[68px] z-50 grid grid-cols-2 gap-3 p-3 md:bottom-4">
          <PrimaryButton type="button" variant="secondary" onClick={handleReset} disabled={isLoading}>
            <RotateCcw className="mr-2 h-5 w-5" />
            Đặt lại
          </PrimaryButton>
          <PrimaryButton type="submit" disabled={isLoading}>
            <Save className="mr-2 h-5 w-5" />
            {isLoading ? 'Đang lưu' : 'Lưu'}
          </PrimaryButton>
        </section>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
