import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollapsibleSection } from '../../components/ui';

describe('OCRResultPage', () => {
  it('renders collapsible sections', () => {
    render(
      <>
        <CollapsibleSection title="THÔNG TIN CHÍNH" defaultExpanded>
          <div>Main Info</div>
        </CollapsibleSection>
        <CollapsibleSection title="THÔNG TIN KHÁC" defaultExpanded={false}>
          <div>Other Info</div>
        </CollapsibleSection>
      </>
    );
    expect(screen.getByText('Main Info')).toBeTruthy();
  });
});
