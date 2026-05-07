import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterPage from '../../pages/RegisterPage';
import { BrowserRouter } from 'react-router-dom';

describe('RegisterPage', () => {
  it('renders page title', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /đăng ký/i })).toBeTruthy();
  });
});
