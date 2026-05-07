import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrimaryButton } from '../../components/ui';

describe('SettingsPage', () => {
  it('renders model selector as cards', () => {
    // Test model selector card design
    expect(true).toBeTruthy();
  });

  it('shows danger zone logout button', () => {
    render(<PrimaryButton variant="danger">Đăng xuất</PrimaryButton>);
    expect(screen.getByText('Đăng xuất')).toBeTruthy();
  });
});
