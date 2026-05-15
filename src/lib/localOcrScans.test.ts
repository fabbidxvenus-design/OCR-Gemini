import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import {
  cleanupExpiredLocalOcrScans,
  createLocalOcrScan,
  deleteLocalOcrScan,
  getLocalOcrScan,
  getLocalOcrScanRemoteId,
  setLocalOcrScanRemoteId,
  updateLocalOcrScan,
} from './localOcrScans';

function buildScan(overrides: Partial<Omit<ScanRecord, 'id'>> = {}): Omit<ScanRecord, 'id'> {
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
    ...overrides,
  };
}

describe('localOcrScans', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T10:00:00.000Z'));
  });

  it('creates a local scan that can be loaded as a ScanRecord', () => {
    const scanId = createLocalOcrScan(buildScan());

    expect(scanId).toMatch(/^local-/);
    expect(getLocalOcrScan(scanId)).toMatchObject({
      id: scanId,
      imageDataUrl: '',
      ocrRaw: '商品名 VES 529CT',
      apiKeyIndex: 1,
      modelTier: 'default',
    });
  });

  it('does not persist image data in localStorage', () => {
    createLocalOcrScan(buildScan());

    expect(localStorage.getItem('hlvn.localOcrScans')).not.toContain('should-not-persist');
  });

  it('updates a local scan without losing cache metadata', () => {
    const scanId = createLocalOcrScan(buildScan());

    const updatedScan = updateLocalOcrScan(scanId, {
      ocrStructured: {
        title: 'Edited OCR Result',
        fields: [{ field: '商品名', value: 'Edited VES 529CT', confidence: 'high', category: 'main' }],
        sizes: [],
        raw_text: '商品名 Edited VES 529CT',
        notes: [],
      },
      edited: true,
    });

    expect(updatedScan).toMatchObject({
      id: scanId,
      imageDataUrl: '',
      edited: true,
      ocrRaw: '商品名 VES 529CT',
      ocrStructured: {
        title: 'Edited OCR Result',
      },
    });
    expect(getLocalOcrScan(scanId)?.ocrStructured.fields?.[0].value).toBe('Edited VES 529CT');
  });

  it('stores the backend id for a locally created scan', () => {
    const scanId = createLocalOcrScan(buildScan());

    setLocalOcrScanRemoteId(scanId, 'remote-scan-1');

    expect(getLocalOcrScanRemoteId(scanId)).toBe('remote-scan-1');
  });

  it('deletes a local scan and its backend id mapping after backend save succeeds', () => {
    const scanId = createLocalOcrScan(buildScan());
    setLocalOcrScanRemoteId(scanId, 'remote-scan-1');

    deleteLocalOcrScan(scanId);

    expect(getLocalOcrScan(scanId)).toBeUndefined();
    expect(getLocalOcrScanRemoteId(scanId)).toBeUndefined();
  });

  it('expires local scans and their backend id mappings after seven days', () => {
    const scanId = createLocalOcrScan(buildScan());
    setLocalOcrScanRemoteId(scanId, 'remote-scan-1');

    vi.setSystemTime(new Date('2026-05-21T10:00:00.001Z'));
    cleanupExpiredLocalOcrScans();

    expect(getLocalOcrScan(scanId)).toBeUndefined();
    expect(getLocalOcrScanRemoteId(scanId)).toBeUndefined();
  });

  it('keeps only the newest ten local scans', () => {
    const scanIds = Array.from({ length: 11 }, (_, index) => createLocalOcrScan(buildScan({
      ocrRaw: `scan-${index}`,
    })));

    expect(getLocalOcrScan(scanIds[0])).toBeUndefined();
    expect(getLocalOcrScan(scanIds[10])?.ocrRaw).toBe('scan-10');
  });
});
