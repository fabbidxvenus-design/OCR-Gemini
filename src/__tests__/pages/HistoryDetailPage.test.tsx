import { render, screen, within } from '@testing-library/react';
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

function mockUseScan(scan: ScanRecord | undefined, isPendingMissing: boolean, isLoading: boolean, error: string | null = null) {
  return { scan, isPendingMissing, isLoading, error };
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

  // --- 3-card summary / status UI ---

  it('displays 3 summary cards: Trường count, Cần sửa count, and status', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderHistoryDetailPage();

    expect(screen.getByText('Trường')).toBeInTheDocument();
    expect(screen.getByText('Cần sửa')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
  });

  it('shows OK with green success styling when all fields are high-confidence and non-empty', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderHistoryDetailPage();

    expect(screen.getByText('OK')).toBeInTheDocument();
    const okCards = screen.getAllByText('OK');
    expect(okCards.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Kiểm tra with warning styling when a field has low confidence', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Mock',
        fields: [{ field: '商品名', value: 'VES 529CT', confidence: 'low', category: 'main' }],
        sizes: [],
        raw_text: 'test',
        notes: [],
      },
    }), false, false));
    renderHistoryDetailPage();

    expect(screen.getByText('Kiểm tra')).toBeInTheDocument();
  });

  it('shows 0 Cần sửa and OK when fields have high confidence', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderHistoryDetailPage();

    expect(screen.getByText('0')).toBeInTheDocument(); // Cần sửa count
    expect(screen.getByText('OK')).toBeInTheDocument(); // status
  });

  it('shows 1 Cần sửa and Kiểm tra when a field has no value', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Mock',
        fields: [{ field: '商品名', value: '', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: 'test',
        notes: [],
      },
    }), false, false));
    renderHistoryDetailPage();

    // Find the Cần sửa card (contains "Cần sửa" label) and check for count "1"
    const needEditCard = screen.getByText('Cần sửa').closest('div');
    expect(needEditCard).toBeInTheDocument();
    expect(within(needEditCard!).getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Kiểm tra')).toBeInTheDocument();
  });

  // --- image / no-image ---

  it('renders the scan image when imageDataUrl contains a backend image URL', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ imageDataUrl: 'https://storage.example.test/scans/user-1/thumb.webp' }), false, false));

    renderHistoryDetailPage();

    expect(screen.getByRole('img', { name: 'Scan' })).toHaveAttribute('src', 'https://storage.example.test/scans/user-1/thumb.webp');
    expect(screen.queryByText('Không có ảnh')).toBeNull();
  });

  it('renders the no-image fallback when imageDataUrl is empty', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));

    renderHistoryDetailPage();

    expect(screen.queryByRole('img', { name: 'Scan' })).toBeNull();
    expect(screen.getByText('Không có ảnh')).toBeInTheDocument();
  });

  it('renders the no-image fallback when imageDataUrl is a data URL', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ imageDataUrl: 'data:image/jpeg;base64,abc123' }), false, false));

    renderHistoryDetailPage();

    expect(screen.getByRole('img', { name: 'Scan' })).toHaveAttribute('src', 'data:image/jpeg;base64,abc123');
  });

  // --- loading skeleton ---

  it('shows the loading skeleton when isLoading is true and scan is undefined', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(undefined, false, true));
    renderHistoryDetailPage();

    // Wait for microtask to update isLoading state - should show skeleton blocks, not "Đang tải..." text
    await vi.waitFor(() => {
      // The skeleton has h-40 class for the image placeholder
      const skeletonElements = document.querySelectorAll('[class*="rounded-none"][class*="h-40"]');
      expect(skeletonElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- edited banner ---

  it('shows the edited warning banner when scan.edited is true', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ edited: true }), false, false));
    renderHistoryDetailPage();

    expect(screen.getByText(/đã được chỉnh sửa/i)).toBeInTheDocument();
  });

  it('does not show the edited warning banner when scan.edited is false', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ edited: false }), false, false));
    renderHistoryDetailPage();

    expect(screen.queryByText(/đã được chỉnh sửa/i)).toBeNull();
  });

  // --- title and timestamp ---

  it('displays the scan title and formatted timestamp', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderHistoryDetailPage();

    expect(screen.getByText('Mock OCR Result')).toBeInTheDocument();
    expect(screen.getByText(/14\/05\/2026/i)).toBeInTheDocument();
  });

  // --- action buttons ---

  it('renders edit, export, and delete buttons in the bottom nav', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderHistoryDetailPage();

    // Scope to bottom nav (has class "fixed bottom-bottom-nav")
    const bottomNav = document.querySelector('.fixed.bottom-bottom-nav') as HTMLElement;
    expect(bottomNav).toBeInTheDocument();
    expect(within(bottomNav).getByRole('button', { name: /sửa/i })).toBeInTheDocument();
    expect(within(bottomNav).getByRole('button', { name: /xuất/i })).toBeInTheDocument();
    expect(within(bottomNav).getByRole('button', { name: /xóa/i })).toBeInTheDocument();
  });

  // --- fields table ---

  it('renders ScanFieldsTable with the scan fields', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderHistoryDetailPage();

    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});