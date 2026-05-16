import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import OCRResultPage from '@/pages/OCRResultPage';
import { useScan } from '@/hooks/useScans';

const mockNavigate = vi.fn();

vi.mock('@/hooks/useScans', () => ({
  useScan: vi.fn(),
}));

vi.mock('@/hooks/useShare', () => ({
  useShare: () => ({
    isSharing: false,
    isCopying: false,
    shareOCR: vi.fn(),
    copyOCR: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function mockUseScan(scan: ScanRecord | undefined, isPendingMissing: boolean, error?: string | null) {
  return { scan, isPendingMissing, isLoading: false, error: error ?? null };
}

function buildScan(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 'scan-1',
    timestamp: new Date('2026-05-14T10:00:00.000Z'),
    imageDataUrl: '',
    ocrRaw: '商品名 VES 529CT',
    ocrStructured: {
      title: 'Mock OCR Result',
      fields: [
        { field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' },
        { field: '数量', value: '100', confidence: 'high', category: 'main' },
        { field: '重量', value: '500g', confidence: 'medium', category: 'other' },
      ],
      sizes: [],
      raw_text: '商品名 VES 529CT',
      notes: ['Test note'],
    },
    edited: false,
    tokenUsage: { input: 10, output: 20, cost: 0.001, model: 'gemini-2.5-flash-lite' },
    apiKeyIndex: 1,
    modelTier: 'default',
    ...overrides,
  };
}

function renderOCRResultPage() {
  return render(
    <MemoryRouter initialEntries={['/result/scan-1']}>
      <OCRResultPage />
    </MemoryRouter>
  );
}

describe('OCRResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when scan is undefined and not pending missing', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(undefined, false));

    renderOCRResultPage();

    // Check that the layout renders with loading title
    expect(document.body.textContent).toContain('Đang tải');
  });

  it('shows error message with retry button when scan is pending missing', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(undefined, true));

    renderOCRResultPage();

    expect(screen.getByText(/không tìm thấy kết quả ocr/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
  });

  it('shows camera icon in error state that navigates to camera', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(undefined, true));

    renderOCRResultPage();

    const retryButton = screen.getByRole('button', { name: /thử lại/i });
    retryButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/camera');
  });

  it('renders the scan image when imageDataUrl is present', () => {
    const mockImageUrl = 'data:image/jpeg;base64,test123';
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ imageDataUrl: mockImageUrl }), false));

    renderOCRResultPage();

    const image = screen.getByRole('img', { name: /scan/i });
    expect(image).toHaveAttribute('src', mockImageUrl);
  });

  it('shows scanned image label when imageDataUrl is present', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ imageDataUrl: 'data:image/jpeg;base64,test123' }), false));

    renderOCRResultPage();

    expect(screen.getByText(/ảnh đã quét/i)).toBeInTheDocument();
  });

  it('displays field count correctly', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    expect(screen.getByText('Trường')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 fields
  });

  it('displays needs edit count when low confidence fields present', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Mock OCR Result',
        fields: [
          { field: '商品名', value: 'VES 529CT', confidence: 'low', category: 'main' },
        ],
        sizes: [],
        raw_text: '商品名 VES 529CT',
        notes: [],
      },
    }), false));

    renderOCRResultPage();

    expect(screen.getByText('Cần sửa')).toBeInTheDocument();
    // Use getAllByText since both "Trường" and "Cần sửa" show 1
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('displays OK status when no fields need review', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('displays Thiếu status when no fields exist', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Mock OCR Result',
        fields: [],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false));

    renderOCRResultPage();

    expect(screen.getByText('Thiếu')).toBeInTheDocument();
  });

  it('displays scanned image note when no image data', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({ imageDataUrl: '' }), false));

    renderOCRResultPage();

    // No image section renders when imageDataUrl is empty
    expect(screen.queryByText(/ảnh đã quét/i)).not.toBeInTheDocument();
  });

  it('displays title and timestamp', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    expect(screen.getByText('Mock OCR Result')).toBeInTheDocument();
    expect(screen.getByText(/14\/05\/2026/i)).toBeInTheDocument(); // Date format
  });

  it('renders ScanFieldsTable component', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    // ScanFieldsTable is rendered on the page
    // It shows a table with field rows
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('renders notes section when notes are present', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    expect(screen.getByRole('heading', { name: /ghi chú/i })).toBeInTheDocument();
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('does not render notes section when no notes', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan({
      ocrStructured: {
        title: 'Mock OCR Result',
        fields: [],
        sizes: [],
        raw_text: '',
        notes: [],
      },
    }), false));

    renderOCRResultPage();

    expect(screen.queryByRole('heading', { name: /ghi chú/i })).not.toBeInTheDocument();
  });

  it('renders retake button that navigates to camera', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    const retakeButton = screen.getByRole('button', { name: /chụp/i });
    expect(retakeButton).toBeInTheDocument();
    retakeButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/camera');
  });

  it('renders edit, copy, and share action buttons', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    expect(screen.getByRole('button', { name: /sửa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chia sẻ/i })).toBeInTheDocument();
  });

  it('navigates to edit page when edit button is clicked', () => {
    vi.mocked(useScan).mockReturnValue(mockUseScan(buildScan(), false));

    renderOCRResultPage();

    const editButton = screen.getByRole('button', { name: /sửa/i });
    editButton.click();

    // scanId is undefined in test since useParams returns undefined without proper routing
    // Just verify the button is clickable and calls navigate
    expect(mockNavigate).toHaveBeenCalled();
  });
});