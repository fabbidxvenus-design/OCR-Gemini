import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordInput } from '../../components/ui';

describe('PasswordInput', () => {
  it('renders eye icon for toggling visibility', () => {
    render(<PasswordInput label="Password" />);
    expect(screen.getByRole('button')).toBeTruthy(); // The toggle button
  });

  it('shows strength bar when showStrength is true', () => {
    render(<PasswordInput label="Password" showStrength={true} strengthLevel="weak" />);
    expect(screen.getByText('Yếu')).toBeTruthy();
  });

  it('shows medium strength', () => {
    render(<PasswordInput label="Password" showStrength={true} strengthLevel="medium" />);
    expect(screen.getByText('Trung bình')).toBeTruthy();
  });

  it('shows strong strength', () => {
    render(<PasswordInput label="Password" showStrength={true} strengthLevel="strong" />);
    expect(screen.getByText('Mạnh')).toBeTruthy();
  });
});
