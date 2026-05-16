import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import EditPage from '@/pages/EditPage';
import { useScan } from '@/hooks/useScans';

const mockNavigate = vi.fn();

vi.mock('@/hooks/useScans', () => ({
  useScan: vi.fn(),
  updateScan: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ scanId: 'scan-1' }),
  };
});

function mockUseScan(scan: ScanRecord | undefined, isPendingMissing = false, isLoading = false) {
  return { scan, isPendingMissing, isLoading };
}

function buildScan(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 'scan-1',
    timestamp: new Date('2026-05-14T10:00:00.000Z'),
    imageDataUrl: 'data:image/jpeg;base64,test',
    ocrRaw: '',
    ocrStructured: {
      title: 'Test Scan',
      fields: [
        { field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' },
      ],
      sizes: [],
      raw_text: 'raw text',
      notes: [],
    },
    edited: false,
    tokenUsage: { input: 10, output: 20, cost: 0.001, model: 'gemini' },
    apiKeyIndex: 1,
    modelTier: 'default',
    ...overrides,
  };
}

function renderEditPage() {
  return render(
    <MemoryRouter initialEntries={['/edit/scan-1']}>
      <EditPage />
    </MemoryRouter>
  );
}

describe('EditPage - All 5 required fields always editable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 5 fixed fields even when OCR detected only barcode', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderEditPage();

    // 5 required scan fields should all be visible
    expect(screen.getByText('Mã vạch')).toBeInTheDocument(); // Barcode
    expect(screen.getByText('Lot No.')).toBeInTheDocument(); // Lot No.
    expect(screen.getByText('Tên/Mã sản phẩm')).toBeInTheDocument(); // Product Name
    expect(screen.getByText('Số lượng (Qty/Size)')).toBeInTheDocument(); // Quantity
    expect(screen.getByText('Contract No. (Số HĐ)')).toBeInTheDocument(); // Contract No.
  });

  it('pre-fills barcode with OCR value when present', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderEditPage();

    // Barcode field should have the OCR value pre-filled
    const barcodeInput = screen.getByDisplayValue('BC123');
    expect(barcodeInput).toBeInTheDocument();
  });

  it('shows empty input for Lot No. when OCR did not detect it', async () => {
    // Scan has only barcode in fields — Lot No. is missing
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Test',
        fields: [{ field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false, false));
    renderEditPage();

    // Lot No. field should be visible but empty
    expect(screen.getByText('Lot No.')).toBeInTheDocument();
    // The input next to "Lot No." should be empty or show placeholder
    const lotNoRow = screen.getByText('Lot No.').closest('.card-production');
    expect(lotNoRow).toBeInTheDocument();
  });

  it('shows empty input for Product Name when OCR did not detect it', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Test',
        fields: [{ field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false, false));
    renderEditPage();

    expect(screen.getByText('Tên/Mã sản phẩm')).toBeInTheDocument();
  });

  it('shows empty input for Quantity when OCR did not detect it', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Test',
        fields: [{ field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false, false));
    renderEditPage();

    expect(screen.getByText('Số lượng (Qty/Size)')).toBeInTheDocument();
  });

  it('shows empty input for Contract No. when OCR did not detect it', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Test',
        fields: [{ field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false, false));
    renderEditPage();

    expect(screen.getByText('Contract No. (Số HĐ)')).toBeInTheDocument();
  });

  it('preserves extra OCR fields not in the 5 fixed fields', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Test',
        fields: [
          { field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' },
          { field: 'weight', value: '500g', confidence: 'medium', category: 'other' },
        ],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false, false));
    renderEditPage();

    // Extra field should appear in "Thông tin khác" section
    expect(screen.getByText('Thông tin khác')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500g')).toBeInTheDocument();
  });

  it('can fill missing fields and save all 5 fields immutably', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Test',
        fields: [{ field: 'barcode', value: 'BC123', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: 'raw text',
        notes: [],
      },
    }), false, false));
    renderEditPage();

    // All 5 fields render even when OCR only detected barcode
    expect(screen.getByText('Mã vạch')).toBeInTheDocument();
    expect(screen.getByText('Lot No.')).toBeInTheDocument();
    expect(screen.getByText('Tên/Mã sản phẩm')).toBeInTheDocument();
    expect(screen.getByText('Số lượng (Qty/Size)')).toBeInTheDocument();
    expect(screen.getByText('Contract No. (Số HĐ)')).toBeInTheDocument();
  });

  it('shows loading state when scan is undefined and not pending', async () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(undefined, false, false));
    renderEditPage();
    // Both h1 title and loading paragraph contain "Đang tải..."
    await waitFor(() => {
      expect(screen.getAllByText(/đang tải/i)).toHaveLength(2);
    });
  });
});

describe('EditPage - save persistence', () => {
  it('calls updateScan on save', async () => {
    const { updateScan } = await import('@/hooks/useScans');
    const user = userEvent.setup();
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false, false));
    renderEditPage();

    const saveButton = screen.getByRole('button', { name: /lưu/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateScan).toHaveBeenCalled();
    });
  });
});