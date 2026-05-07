import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterChip } from '../../components/ui';

describe('FilterChip', () => {
  it('shows active state correctly', () => {
    render(<FilterChip label="Active" isActive={true} />);
    const chip = screen.getByText('Active').closest('button');
    expect(chip?.className).toContain('border-primary');
    expect(chip?.className).toContain('bg-primary-light');
  });

  it('shows inactive state correctly', () => {
    render(<FilterChip label="Inactive" isActive={false} />);
    const chip = screen.getByText('Inactive').closest('button');
    expect(chip?.className).not.toContain('border-primary');
  });
});
