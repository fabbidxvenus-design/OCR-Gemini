import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../pages/LoginPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isAuthenticated: false,
  }),
}));

describe('LoginPage', () => {
  it('shows validation errors for empty form', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    expect(screen.getByText(/email là bắt buộc/i)).toBeTruthy();
    expect(screen.getByText(/mật khẩu là bắt buộc/i)).toBeTruthy();
  });

  it('shows error for invalid email format', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'notanemail');
    fireEvent.blur(emailInput);
    expect(screen.getByText(/email không hợp lệ/i)).toBeTruthy();
  });

  it('shows error for short password', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    const passwordInput = screen.getByPlaceholderText(/nhập mật khẩu/i);
    await userEvent.type(passwordInput, 'abc');
    fireEvent.blur(passwordInput);
  });
});
