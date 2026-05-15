import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const processOCRMock = vi.fn();
const compressImageForOCRMock = vi.fn();
const uploadScanThumbnailMock = vi.fn();
const createLocalOcrScanMock = vi.fn();
const createScanMock = vi.fn();
const updateScanMock = vi.fn();
const useSettingsMock = vi.fn();
const useAuthStoreMock = vi.fn();
const getStateMock = vi.fn();
const getLocalOcrScanMock = vi.fn();
const setLocalOcrScanRemoteIdMock = vi.fn();
const deleteLocalOcrScanMock = vi.fn();

vi.mock('@/lib/gemini', () => ({
  processOCR: (...args: unknown[]) => processOCRMock(...args),
}));

vi.mock('@/lib/compression', () => ({
  compressImageForOCR: (...args: unknown[]) => compressImageForOCRMock(...args),
}));

vi.mock('@/lib/scansApi', () => ({
  scansApi: {
    uploadScanThumbnail: (...args: unknown[]) => uploadScanThumbnailMock(...args),
  },
}));

vi.mock('@/hooks/useScans', () => ({
  createLocalOcrScan: (...args: unknown[]) => createLocalOcrScanMock(...args),
  createScan: (...args: unknown[]) => createScanMock(...args),
  updateScan: (...args: unknown[]) => updateScanMock(...args),
}));

vi.mock('@/lib/localOcrScans', () => ({
  deleteLocalOcrScan: (...args: unknown[]) => deleteLocalOcrScanMock(...args),
  getLocalOcrScan: (...args: unknown[]) => getLocalOcrScanMock(...args),
  setLocalOcrScanRemoteId: (...args: unknown[]) => setLocalOcrScanRemoteIdMock(...args),
}));

vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => useSettingsMock(),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: Object.assign((selector: (state: { accessToken: string }) => string) => selector(useAuthStoreMock()), {
    getState: () => getStateMock(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/components/layout/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/camera/CameraView', () => ({
  default: ({ onCapture }: { onCapture: (blob: Blob, dataUrl: string) => void }) => (
    <button
      onClick={() => onCapture(new Blob(['camera-image'], { type: 'image/jpeg' }), 'blob:mock-preview')}
      type="button"
    >
      mock-capture
    </button>
  ),
}));

vi.mock('@/components/camera/ImagePreview', () => ({
  default: ({ onConfirm }: { onConfirm: () => void }) => (
    <button onClick={onConfirm} type="button">
      mock-confirm
    </button>
  ),
}));

vi.mock('@/components/ui/ErrorMessage', () => ({
  default: () => <div>error</div>,
}));

vi.mock('@/components/layout/RootRedirect', () => ({ default: () => <div /> }));
vi.mock('@/components/ErrorBoundary', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('@/pages/LoginPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/RegisterPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/ForgotPasswordPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/ResetPasswordPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/OCRResultPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/EditPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/HistoryPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/HistoryDetailPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/AnalyticsPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/SettingsPage', () => ({ default: () => <div /> }));
vi.mock('@/pages/ProfilePage', () => ({ default: () => <div /> }));

function setup() {
  useSettingsMock.mockReturnValue({ settings: { selectedModelTier: 'default' } });
  useAuthStoreMock.mockReturnValue({ accessToken: 'access-token' });
  getStateMock.mockReturnValue({ accessToken: 'access-token' });
  getLocalOcrScanMock.mockReturnValue(undefined);

  processOCRMock.mockResolvedValue({
    ocrRaw: 'raw',
    structured: { title: 'title', fields: [], sizes: [], raw_text: 'raw', notes: [] },
    tokenUsage: { input: 1, output: 1, cost: 0.001 },
    apiKeyIndex: 0,
    modelTier: 'default',
  });

  const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
  compressImageForOCRMock.mockResolvedValue(compressedBlob);
  uploadScanThumbnailMock.mockResolvedValue({
    storagePath: 'scans/user-1/thumb.jpg',
    expiresAt: '2026-05-15T10:00:00.000Z',
  });

  createLocalOcrScanMock.mockReturnValue('local-1');
  createScanMock.mockResolvedValue('remote-1');
  updateScanMock.mockResolvedValue(undefined);
}

describe('CameraPage latency flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setup();
  });

  it('navigates to OCR result without waiting for thumbnail upload', async () => {
    window.history.pushState({}, '', '/camera');
    const { default: App } = await import('@/App');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'mock-capture' }));
    fireEvent.click(screen.getByRole('button', { name: 'mock-confirm' }));

    await waitFor(() => {
      expect(createLocalOcrScanMock).toHaveBeenCalledTimes(1);
    });

    const localScanPayload = createLocalOcrScanMock.mock.calls[0]?.[0] as { imageDataUrl: string };
    expect(localScanPayload.imageDataUrl).toMatch(/^data:image\/jpeg;base64,/);

    await waitFor(() => {
      expect(createScanMock).toHaveBeenCalledTimes(1);
    });
  });

  it('stores thumbnail in localStorage instead of uploading', async () => {
    window.history.pushState({}, '', '/camera');
    const { default: App } = await import('@/App');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'mock-capture' }));
    fireEvent.click(screen.getByRole('button', { name: 'mock-confirm' }));

    await waitFor(() => {
      expect(createLocalOcrScanMock).toHaveBeenCalledTimes(1);
    });

    const localScanPayload = createLocalOcrScanMock.mock.calls[0]?.[0] as { imageDataUrl: string };
    expect(localScanPayload.imageDataUrl).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('saves scan with imageDataUrl from localStorage', async () => {
    window.history.pushState({}, '', '/camera');
    const { default: App } = await import('@/App');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'mock-capture' }));
    fireEvent.click(screen.getByRole('button', { name: 'mock-confirm' }));

    await waitFor(() => {
      expect(createScanMock).toHaveBeenCalledTimes(1);
    });

    const savedScan = createScanMock.mock.calls[0]?.[0] as { imageDataUrl: string };
    expect(savedScan.imageDataUrl).toMatch(/^data:image\/jpeg;base64,/);
  });
});
