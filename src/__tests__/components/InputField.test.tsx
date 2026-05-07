import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputField } from '../../components/ui';

describe('InputField', () => {
  it('renders label with uppercase styling', () => {
    render(<InputField label="Email" />);
    const label = screen.getByText('Email');
    expect(label.className).toContain('uppercase');
  });

  it('shows error message when provided and touched', () => {
    render(<InputField label="Email" error="Invalid email" touched={true} />);
    expect(screen.getByText('Invalid email')).toBeTruthy();
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-error');
  });

  it('does not show error when not touched', () => {
    render(<InputField label="Email" error="Invalid email" touched={false} />);
    expect(screen.queryByText('Invalid email')).toBeNull();
  });
});
