import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../components/layout/Header';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    logout: vi.fn(),
    user: {
      email: 'worker@example.com',
      displayName: 'Nguyen Van A',
    },
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });
  it('shows back button when showBack is true', () => {
    render(
      <MemoryRouter>
        <Header showBack={true} title="Test" />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /quay lại/i })).toBeTruthy();
  });

  it('displays title', () => {
    render(
      <MemoryRouter>
        <Header title="Custom Title" />
      </MemoryRouter>
    );
    expect(screen.getByText('Custom Title')).toBeTruthy();
  });

  it('has logout button', () => {
    render(
      <MemoryRouter>
        <Header title="Test" />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /đăng xuất/i })).toBeTruthy();
  });

  it('navigates to profile from avatar button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header title="Test" />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /mở hồ sơ cá nhân/i }));

    expect(navigateMock).toHaveBeenCalledWith('/profile');
  });
});
