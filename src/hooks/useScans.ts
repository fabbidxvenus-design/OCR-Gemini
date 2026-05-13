import { useEffect, useState } from 'react';
import type { OCRResponse, ScanRecord } from '@/db/schema';
import { scansApi } from '@/lib/scansApi';
import { useAuthStore } from '@/store/authStore';
import type { BackendScanRecord } from '@/lib/apiTypes';

function toMobileScan(scan: BackendScanRecord): ScanRecord {
  return {
    id: scan.id,
    timestamp: new Date(scan.timestamp),
    imageDataUrl: scan.imageUrl ?? '',
    ocrRaw: scan.ocrRaw,
    ocrStructured: {
      title: scan.ocrStructured.title,
      fields: scan.ocrStructured.fields || [],
      sizes: scan.ocrStructured.sizes || [],
      raw_text: scan.ocrStructured.rawText ?? scan.ocrRaw,
      notes: scan.ocrStructured.notes || [],
    },
    edited: scan.edited,
    tokenUsage: scan.tokenUsage,
    apiKeyIndex: scan.apiKeyIndex,
    modelTier: scan.modelTier,
  };
}

function toBackendOCR(ocr: OCRResponse) {
  return {
    title: ocr.title,
    fields: ocr.fields || [],
    sizes: ocr.sizes || [],
    rawText: ocr.raw_text,
    notes: ocr.notes || [],
  };
}

function getAccessToken(): string {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error('Bạn cần đăng nhập để xem dữ liệu scan');
  return accessToken;
}

export function useScans(options?: { limit?: number; order?: 'asc' | 'desc' }): ScanRecord[] | undefined {
  const { limit = 100, order = 'desc' } = options || {};
  const accessToken = useAuthStore((state) => state.accessToken);
  const [scans, setScans] = useState<ScanRecord[] | undefined>();

  useEffect(() => {
    if (!accessToken) {
      setScans([]);
      return;
    }

    let cancelled = false;

    async function loadScans() {
      if (!accessToken) return;
      try {
        const data = await scansApi.getScans(accessToken, { limit });
        const mapped = data.map(toMobileScan);
        const ordered = order === 'desc'
          ? mapped.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          : mapped.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        if (!cancelled) setScans(ordered);
      } catch (err) {
        console.error('Failed to load scans:', err);
        if (!cancelled) setScans([]);
      }
    }

    loadScans();

    return () => {
      cancelled = true;
    };
  }, [accessToken, limit, order]);

  return scans;
}

export function useScan(scanId?: string): ScanRecord | undefined {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [scan, setScan] = useState<ScanRecord | undefined>();

  useEffect(() => {
    if (!scanId || !accessToken) {
      setScan(undefined);
      return;
    }

    let cancelled = false;

    async function loadScan() {
      if (!accessToken || !scanId) return;
      try {
        const data = await scansApi.getScan(accessToken, scanId);
        if (!cancelled) setScan(toMobileScan(data));
      } catch (err) {
        console.error('Failed to load scan:', err);
        if (!cancelled) setScan(undefined);
      }
    }

    loadScan();

    return () => {
      cancelled = true;
    };
  }, [accessToken, scanId]);

  return scan;
}

export function useSearchScans(query: string): ScanRecord[] | undefined {
  const scans = useScans({ limit: 100, order: 'desc' });

  if (!query) return [];
  if (!scans) return undefined;

  const lowerQuery = query.toLowerCase();
  return scans.filter((scan) => {
    const title = scan.ocrStructured?.title;
    const fields = scan.ocrStructured?.fields;
    const rawText = scan.ocrStructured?.raw_text;

    return Boolean(
      title?.toString().toLowerCase().includes(lowerQuery) ||
      fields?.some((field) => field.value != null && field.value.toString().toLowerCase().includes(lowerQuery)) ||
      rawText?.toString().toLowerCase().includes(lowerQuery)
    );
  });
}

export async function createScan(data: Omit<ScanRecord, 'id'>): Promise<string> {
  const created = await scansApi.createScan(getAccessToken(), {
    imageUrl: data.imageDataUrl,
    timestamp: data.timestamp.toISOString(),
    ocrRaw: data.ocrRaw,
    ocrStructured: toBackendOCR(data.ocrStructured),
    tokenUsage: data.tokenUsage,
    apiKeyIndex: data.apiKeyIndex,
    edited: data.edited,
  });
  return created.id;
}

export async function getApiKeyUsageStats(): Promise<{ key1Count: number; key2Count: number; key1Cost: number; key2Cost: number }> {
  return scansApi.getApiKeyUsageStats(getAccessToken());
}

export async function updateScan(scanId: string, updates: Partial<ScanRecord>): Promise<void> {
  if (!updates.ocrStructured) return;
  await scansApi.updateScan(getAccessToken(), scanId, {
    ocrStructured: toBackendOCR(updates.ocrStructured),
  });
}

export async function deleteScan(scanId: string): Promise<void> {
  await scansApi.deleteScan(getAccessToken(), scanId);
}
