import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/layout/Header';

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    logout: vi.fn(),
  }),
}));

describe('Header', () => {
  it('shows back button when showBack is true', () => {
    render(
      <BrowserRouter>
        <Header showBack={true} title="Test" />
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /quay lại/i })).toBeTruthy();
  });

  it('displays title', () => {
    render(
      <BrowserRouter>
        <Header title="Custom Title" />
      </BrowserRouter>
    );
    expect(screen.getByText('Custom Title')).toBeTruthy();
  });

  it('has logout button', () => {
    render(
      <BrowserRouter>
        <Header title="Test" />
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /đăng xuất/i })).toBeTruthy();
  });
});
