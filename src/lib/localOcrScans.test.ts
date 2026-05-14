import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScanRecord } from '@/db/schema';
import {
  cleanupExpiredLocalOcrScans,
  createLocalOcrScan,
  deleteLocalOcrScan,
  getLocalOcrScan,
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

  it('deletes a local scan after backend save succeeds', () => {
    const scanId = createLocalOcrScan(buildScan());

    deleteLocalOcrScan(scanId);

    expect(getLocalOcrScan(scanId)).toBeUndefined();
  });

  it('expires local scans after seven days', () => {
    const scanId = createLocalOcrScan(buildScan());

    vi.setSystemTime(new Date('2026-05-21T10:00:00.001Z'));
    cleanupExpiredLocalOcrScans();

    expect(getLocalOcrScan(scanId)).toBeUndefined();
  });
});
