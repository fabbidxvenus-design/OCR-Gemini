import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleSection } from '../../components/ui';

describe('CollapsibleSection', () => {
  it('renders with proper structure', () => {
    render(
      <CollapsibleSection title="Section" count={5}>
        <div>Content</div>
      </CollapsibleSection>
    );
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(screen.getByText(/section/i)).toBeTruthy();
  });

  it('expands when clicked', () => {
    render(
      <CollapsibleSection title="Section" defaultExpanded={false}>
        <div>Content</div>
      </CollapsibleSection>
    );
    fireEvent.click(screen.getByRole('button', { name: /section/i }));
    expect(screen.getByText('Content')).toBeTruthy();
  });
});
