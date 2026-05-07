import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollapsibleSection } from '../../components/ui';

describe('OCRResultPage', () => {
  it('renders collapsible sections', () => {
    render(
      <>
        <CollapsibleSection title="THÔNG TIN CHÍNH" count={1} defaultExpanded>
          <div>Main Info</div>
        </CollapsibleSection>
        <CollapsibleSection title="THÔNG TIN KHÁC" count={0} defaultExpanded={false}>
          <div>Other Info</div>
        </CollapsibleSection>
      </>
    );
    expect(screen.getByText('Main Info')).toBeTruthy();
  });
});
