import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import { createLocalOcrScan } from '@/lib/localOcrScans';
import { scansApi } from '@/lib/scansApi';
import { useScan } from './useScans';

vi.mock('@/lib/scansApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/scansApi')>();
  return {
    ...actual,
    scansApi: {
      ...actual.scansApi,
      getScan: vi.fn(),
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

describe('useScan local OCR results', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
});
