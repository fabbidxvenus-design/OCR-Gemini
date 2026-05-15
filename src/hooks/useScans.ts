import { useEffect, useState } from 'react';
import type { OCRResponse, ScanRecord } from '@/db/schema';
import { scansApi } from '@/lib/scansApi';
import { useAuthStore } from '@/store/authStore';
import type { BackendScanRecord } from '@/lib/apiTypes';
import { cleanupExpiredLocalOcrScans, createLocalOcrScan, getLocalOcrScan, getLocalOcrScanRemoteId, updateLocalOcrScan } from '@/lib/localOcrScans';

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

const PENDING_SCAN_TTL_MS = 10 * 60 * 1000;
const pendingScans = new Map<string, { scan: ScanRecord; expiresAt: number }>();

function getAccessToken(): string {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error('Bạn cần đăng nhập để xem dữ liệu scan');
  return accessToken;
}

export function createPendingScan(data: Omit<ScanRecord, 'id'>): string {
  const scanId = `pending-${crypto.randomUUID()}`;
  const scan: ScanRecord = { ...data, id: scanId, imageDataUrl: '' };
  pendingScans.set(scanId, {
    scan,
    expiresAt: Date.now() + PENDING_SCAN_TTL_MS,
  });
  return scanId;
}

export { createLocalOcrScan };

function getPendingScan(scanId: string): ScanRecord | undefined {
  const pending = pendingScans.get(scanId);
  if (!pending) return undefined;

  if (pending.expiresAt <= Date.now()) {
    pendingScans.delete(scanId);
    return undefined;
  }

  return pending.scan;
}


export interface UseScansStateResult {
  scans: ScanRecord[];
  isLoading: boolean;
}

export function useScansState(options?: { limit?: number; order?: 'asc' | 'desc' }): UseScansStateResult {
  const { limit = 100, order = 'desc' } = options || {};
  const accessToken = useAuthStore((state) => state.accessToken);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(accessToken));

  useEffect(() => {
    if (!accessToken) {
      queueMicrotask(() => {
        setScans([]);
        setIsLoading(false);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      setIsLoading(true);
    });

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
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadScans();

    return () => {
      cancelled = true;
    };
  }, [accessToken, limit, order]);

  return { scans, isLoading };
}

export function useScans(options?: { limit?: number; order?: 'asc' | 'desc' }): ScanRecord[] | undefined {
  const { scans, isLoading } = useScansState(options);
  return isLoading ? undefined : scans;
}

export interface UseScanResult {
  scan: ScanRecord | undefined;
  isPendingMissing: boolean;
}

export function useScan(scanId?: string): UseScanResult {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [scan, setScan] = useState<ScanRecord | undefined>();
  const [isPendingMissing, setIsPendingMissing] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsPendingMissing(false);
    });

    if (!scanId) {
      queueMicrotask(() => {
        setScan(undefined);
      });
      return;
    }

    if (scanId.startsWith('local-')) {
      cleanupExpiredLocalOcrScans();
      const localScan = getLocalOcrScan(scanId);
      queueMicrotask(() => {
        setScan(localScan);
        setIsPendingMissing(!localScan);
      });
      return;
    }

    if (scanId.startsWith('pending-')) {
      const pendingScan = getPendingScan(scanId);
      queueMicrotask(() => {
        setScan(pendingScan);
        setIsPendingMissing(!pendingScan);
      });
      return;
    }

    if (!accessToken) {
      queueMicrotask(() => {
        setScan(undefined);
      });
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

  return { scan, isPendingMissing };
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
    timestamp: data.timestamp.toISOString(),
    imageDataUrl: data.imageDataUrl || undefined,
    ocrRaw: data.ocrRaw,
    ocrStructured: toBackendOCR(data.ocrStructured),
    tokenUsage: data.tokenUsage,
    apiKeyIndex: data.apiKeyIndex,
    edited: data.edited,
    modelTier: data.modelTier,
  });
  return created.id;
}

export async function getApiKeyUsageStats(): Promise<{ key1Count: number; key2Count: number; key1Cost: number; key2Cost: number }> {
  return scansApi.getApiKeyUsageStats(getAccessToken());
}

export async function updateScan(scanId: string, updates: Partial<ScanRecord>): Promise<void> {
  if (!updates.ocrStructured) return;

  if (scanId.startsWith('local-')) {
    const remoteScanId = getLocalOcrScanRemoteId(scanId);
    updateLocalOcrScan(scanId, {
      ocrStructured: updates.ocrStructured,
      edited: true,
    });
    if (!remoteScanId) return;
    scanId = remoteScanId;
  }

  await scansApi.updateScan(getAccessToken(), scanId, {
    ocrStructured: toBackendOCR(updates.ocrStructured),
  });
}

export async function deleteScan(scanId: string): Promise<void> {
  await scansApi.deleteScan(getAccessToken(), scanId);
}
