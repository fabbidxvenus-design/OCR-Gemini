import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

describe('BottomNav', () => {
  it('renders all 4 navigation items', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    );
    expect(screen.getByText('Chụp ảnh')).toBeTruthy();
    expect(screen.getByText('Lịch sử')).toBeTruthy();
    expect(screen.getByText('Thống kê')).toBeTruthy();
    expect(screen.getByText('Cài đặt')).toBeTruthy();
  });

  it('has links to all routes', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    );
    expect(screen.getByRole('link', { name: /chụp ảnh/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /lịch sử/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /thống kê/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /cài đặt/i })).toBeTruthy();
  });
});
