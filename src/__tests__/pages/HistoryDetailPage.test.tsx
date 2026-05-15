import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import HistoryDetailPage from '@/pages/HistoryDetailPage';
import { useScan } from '@/hooks/useScans';

vi.mock('@/hooks/useScans', () => ({
  useScan: vi.fn(),
  deleteScan: vi.fn(),
}));

vi.mock('@/hooks/useExport', () => ({
  useExport: () => ({
    isExporting: false,
    exportScan: vi.fn(),
  }),
}));

function buildScan(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 'scan-1',
    timestamp: new Date('2026-05-14T10:00:00.000Z'),
    imageDataUrl: '',
    ocrRaw: '商品名 VES 529CT',
    ocrStructured: {
      title: 'Mock OCR Result',
      fields: [{ field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' }],
      sizes: [],
      raw_text: '商品名 VES 529CT',
      notes: [],
    },
    edited: false,
    tokenUsage: { input: 10, output: 20, cost: 0.001, model: 'gemini-2.5-flash-lite' },
    apiKeyIndex: 1,
    modelTier: 'default',
    ...overrides,
  };
}

function renderHistoryDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/history/scan-1']}>
      <HistoryDetailPage />
    </MemoryRouter>
  );
}

describe('HistoryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the scan image when imageDataUrl contains a backend image URL', () => {
    vi.mocked(useScan).mockReturnValue({
      scan: buildScan({ imageDataUrl: 'https://storage.example.test/scans/user-1/thumb.webp' }),
      isPendingMissing: false,
    });

    renderHistoryDetailPage();

    expect(screen.getByRole('img', { name: 'Scan' })).toHaveAttribute('src', 'https://storage.example.test/scans/user-1/thumb.webp');
    expect(screen.queryByText('Không có ảnh')).toBeNull();
  });

  it('renders the no-image fallback when imageDataUrl is empty', () => {
    vi.mocked(useScan).mockReturnValue({ scan: buildScan(), isPendingMissing: false });

    renderHistoryDetailPage();

    expect(screen.queryByRole('img', { name: 'Scan' })).toBeNull();
    expect(screen.getByText('Không có ảnh')).toBeTruthy();
  });
});
