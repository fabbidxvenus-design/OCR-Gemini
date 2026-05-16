import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import HistoryPage from '@/pages/HistoryPage';
import { useScansState } from '@/hooks/useScans';

vi.mock('@/hooks/useScans', () => ({
  useScansState: vi.fn(),
}));

vi.mock('@/hooks/useExport', () => ({
  useExport: () => ({
    isExporting: false,
    exportMultiple: vi.fn(),
  }),
}));

function renderHistoryPage() {
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );
}

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

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading feedback instead of an empty result while history loads', () => {
    vi.mocked(useScansState).mockReturnValue({ scans: [], isLoading: true, error: null });

    renderHistoryPage();

    expect(screen.getByText('Đang tải lịch sử')).toBeTruthy();
    expect(screen.getAllByTestId('history-skeleton-card')).toHaveLength(4);
    expect(screen.queryByText('Không có kết quả')).toBeNull();
    expect(screen.queryByText('0 lượt quét')).toBeNull();
  });

  it('shows the loaded empty state only after loading completes', () => {
    vi.mocked(useScansState).mockReturnValue({ scans: [], isLoading: false, error: null });

    renderHistoryPage();

    expect(screen.queryByText('Đang tải lịch sử')).toBeNull();
    expect(screen.getByText('0 lượt quét')).toBeTruthy();
    expect(screen.getByText('Chưa có lượt quét')).toBeTruthy();
  });

  it('renders a history thumbnail when a scan has image data', async () => {
    vi.mocked(useScansState).mockReturnValue({
      scans: [buildScan({ imageDataUrl: 'https://example.test/scan.jpg' })],
      isLoading: false,
      error: null,
    });

    renderHistoryPage();

    expect(screen.getByTestId('history-scan-thumbnail')).toHaveAttribute('src', 'https://example.test/scan.jpg');
  });

  it('uses the fallback visual when a scan has no image', () => {
    vi.mocked(useScansState).mockReturnValue({ scans: [buildScan()], isLoading: false, error: null });

    renderHistoryPage();

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByTestId('history-scan-image-fallback')).toBeTruthy();
  });
});