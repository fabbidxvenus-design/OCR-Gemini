import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import { createLocalOcrScan, getLocalOcrScan, setLocalOcrScanRemoteId } from '@/lib/localOcrScans';
import { scansApi } from '@/lib/scansApi';
import { useAuthStore } from '@/store/authStore';
import { updateScan, useScan, useScansState } from './useScans';

vi.mock('@/lib/scansApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/scansApi')>();
  return {
    ...actual,
    scansApi: {
      ...actual.scansApi,
      getScans: vi.fn(),
      getScan: vi.fn(),
      updateScan: vi.fn(),
    },
  };
});

function buildScan(): Omit<ScanRecord, 'id'> {
  return {
    timestamp: new Date('2026-05-14T10:00:00.000Z'),
    imageDataUrl: 'data:image/png;base64,should-not-persist',
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
  };
}

function resetAuthStore() {
  useAuthStore.setState({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    error: null,
    isLoading: false,
  });
}

describe('useScansState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    resetAuthStore();
  });

  it('distinguishes loading from a loaded empty history', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    let resolveScans!: (value: []) => void;
    vi.mocked(scansApi.getScans).mockReturnValue(new Promise(resolve => {
      resolveScans = resolve;
    }));

    const { result } = renderHook(() => useScansState({ limit: 100, order: 'desc' }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.scans).toEqual([]);

    resolveScans([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.scans).toEqual([]);
  });

  it('maps backend imageUrl into imageDataUrl for history thumbnails', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    vi.mocked(scansApi.getScans).mockResolvedValue([
      {
        id: 'scan-1',
        timestamp: '2026-05-14T10:00:00.000Z',
        imageUrl: 'https://example.test/scan.jpg',
        ocrRaw: '商品名 VES 529CT',
        ocrStructured: {
          title: 'Mock OCR Result',
          fields: [{ field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' }],
          sizes: [],
          rawText: '商品名 VES 529CT',
          notes: [],
        },
        edited: false,
        tokenUsage: { input: 10, output: 20, cost: 0.001 },
        apiKeyIndex: 1,
        modelTier: 'default',
      },
      {
        id: 'scan-2',
        timestamp: '2026-05-14T09:00:00.000Z',
        imageUrl: null,
        ocrRaw: '商品名 VES 530CT',
        ocrStructured: {
          title: 'No Image OCR Result',
          fields: [],
          sizes: [],
          rawText: '商品名 VES 530CT',
          notes: [],
        },
        edited: false,
        tokenUsage: { input: 8, output: 16, cost: 0.001 },
        apiKeyIndex: 1,
        modelTier: 'default',
      },
    ]);

    const { result } = renderHook(() => useScansState({ limit: 100, order: 'desc' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.scans[0].imageDataUrl).toBe('https://example.test/scan.jpg');
    expect(result.current.scans[1].imageDataUrl).toBe('');
  });
});

describe('useScan local OCR results', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    resetAuthStore();
  });

  it('returns a local OCR scan without fetching from the backend', async () => {
    const scanId = createLocalOcrScan(buildScan());

    const { result } = renderHook(() => useScan(scanId));

    await waitFor(() => expect(result.current.scan?.id).toBe(scanId));
    expect(result.current.scan).toMatchObject({
      imageDataUrl: '',
      ocrRaw: '商品名 VES 529CT',
    });
    expect(result.current.isPendingMissing).toBe(false);
    expect(scansApi.getScan).not.toHaveBeenCalled();
  });

  it('returns missing state for an absent local OCR scan without fetching from the backend', async () => {
    const { result } = renderHook(() => useScan('local-missing'));

    await waitFor(() => expect(result.current.isPendingMissing).toBe(true));
    expect(result.current.scan).toBeUndefined();
    expect(scansApi.getScan).not.toHaveBeenCalled();
  });

  it('updates a local OCR scan without sending a backend update request', async () => {
    const scanId = createLocalOcrScan(buildScan());

    await updateScan(scanId, {
      ocrStructured: {
        title: 'Edited OCR Result',
        fields: [{ field: '商品名', value: 'Edited VES 529CT', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '商品名 Edited VES 529CT',
        notes: [],
      },
    });

    expect(getLocalOcrScan(scanId)).toMatchObject({
      edited: true,
      ocrStructured: {
        title: 'Edited OCR Result',
      },
    });
    expect(scansApi.updateScan).not.toHaveBeenCalled();
  });

  it('updates the remote and local scan when a local OCR scan already has a backend id', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    const scanId = createLocalOcrScan(buildScan());
    setLocalOcrScanRemoteId(scanId, 'remote-scan-1');

    await updateScan(scanId, {
      ocrStructured: {
        title: 'Edited Remote OCR Result',
        fields: [{ field: '商品名', value: 'Edited Remote VES 529CT', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '商品名 Edited Remote VES 529CT',
        notes: [],
      },
    });

    expect(getLocalOcrScan(scanId)).toMatchObject({
      edited: true,
      ocrStructured: {
        title: 'Edited Remote OCR Result',
      },
    });
    expect(scansApi.updateScan).toHaveBeenCalledWith(expect.any(String), 'remote-scan-1', {
      ocrStructured: {
        title: 'Edited Remote OCR Result',
        fields: [{ field: '商品名', value: 'Edited Remote VES 529CT', confidence: 'high', category: 'main' }],
        sizes: [],
        rawText: '商品名 Edited Remote VES 529CT',
        notes: [],
      },
    });
  });
});
