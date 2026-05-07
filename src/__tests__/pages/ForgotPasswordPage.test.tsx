import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage';
import { BrowserRouter } from 'react-router-dom';

describe('ForgotPasswordPage', () => {
  it('renders page title', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Quên mật khẩu')).toBeTruthy();
  });

  it('has link back to login', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/quay lại đăng nhập/i)).toBeTruthy();
  });
});
