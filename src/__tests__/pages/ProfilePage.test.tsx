import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '@/pages/ProfilePage';

const updateUserProfileMock = vi.fn();

const authState = {
  user: {
    id: 'user-1',
    email: 'worker@example.com',
    role: 'user' as const,
    createdAt: '2026-05-10T00:00:00.000Z',
    lastLogin: null,
    displayName: 'Nguyen Van A',
    description: 'Nhân viên kho',
    phone: '+84 900 000 000',
    jobTitle: 'Warehouse Operator',
    department: 'Kho thành phẩm',
    company: 'HLVN',
    avatarUrl: null,
  },
  updateUserProfile: updateUserProfileMock,
  isLoading: false,
};

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => authState,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    updateUserProfileMock.mockReset();
  });

  it('blocks invalid phone before calling the API', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText(/số điện thoại/i));
    await user.type(screen.getByLabelText(/số điện thoại/i), 'abc');
    await user.click(screen.getByRole('button', { name: /lưu/i }));

    expect(await screen.findByText('Số điện thoại không hợp lệ')).toBeInTheDocument();
    expect(updateUserProfileMock).not.toHaveBeenCalled();
  });

  it('saves valid profile edits', async () => {
    const user = userEvent.setup();
    updateUserProfileMock.mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText(/tên hiển thị/i));
    await user.type(screen.getByLabelText(/tên hiển thị/i), 'Tran Thi B');
    await user.click(screen.getByRole('button', { name: /lưu/i }));

    expect(updateUserProfileMock).toHaveBeenCalledWith(expect.objectContaining({
      displayName: 'Tran Thi B',
      phone: '+84 900 000 000',
    }));
    expect(await screen.findByText('Đã cập nhật hồ sơ')).toBeInTheDocument();
  });

  it('resets form values to persisted profile values', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/tên hiển thị/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed');
    await user.click(screen.getByRole('button', { name: /đặt lại/i }));

    expect(nameInput).toHaveValue('Nguyen Van A');
  });
});
