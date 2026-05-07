import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrimaryButton } from '../../components/ui';

describe('PrimaryButton', () => {
  it('renders with primary variant by default', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('has height 56px for lg size primary button', () => {
    render(<PrimaryButton variant="primary" size="lg">Primary</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-btn-primary');
  });

  it('has danger variant with red border', () => {
    render(<PrimaryButton variant="danger">Danger</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-error');
  });

  it('is disabled when disabled prop is true', () => {
    render(<PrimaryButton disabled>Disabled</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
  });
});
