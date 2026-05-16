import type { OCRResponse, ScanRecord, TokenUsage } from '@/db/schema';

const LOCAL_OCR_SCANS_KEY = 'hlvn.localOcrScans';
const LOCAL_OCR_SCAN_REMOTE_IDS_KEY = 'hlvn.localOcrScanRemoteIds';
const LOCAL_OCR_SCAN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_LOCAL_OCR_SCANS = 10;

interface LocalOcrScanRecord {
  id: `local-${string}`;
  timestamp: string;
  expiresAt: string;
  imageDataUrl?: string;
  ocrRaw: string;
  ocrStructured: OCRResponse;
  edited: boolean;
  tokenUsage: TokenUsage;
  apiKeyIndex: number;
  modelTier?: 'free' | 'default' | 'high';
}

function readLocalScans(): LocalOcrScanRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_OCR_SCANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isLocalOcrScanRecord) : [];
  } catch (err) {
    console.warn('[LocalOcrScans] Failed to read local scans from storage:', err);
    return [];
  }
}

function writeLocalScans(scans: LocalOcrScanRecord[]): void {
  const boundedScans = scans.slice(-MAX_LOCAL_OCR_SCANS);
  try {
    localStorage.setItem(LOCAL_OCR_SCANS_KEY, JSON.stringify(boundedScans));
  } catch (err) {
    console.warn('[LocalOcrScans] Full write failed, attempting single-scan fallback:', err);
    try {
      const newestScans = boundedScans.slice(-1);
      localStorage.setItem(LOCAL_OCR_SCANS_KEY, JSON.stringify(newestScans));
    } catch (fallbackErr) {
      console.warn('[LocalOcrScans] Even single-scan write failed; data may be corrupted or storage is full:', fallbackErr);
      // Do NOT removeItem here — that would delete ALL saved data on quota error.
      // Return silently to preserve existing data; next read will gracefully fall back.
    }
  }
}

function readLocalRemoteIds(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_OCR_SCAN_REMOTE_IDS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([localId, remoteId]) => localId.startsWith('local-') && typeof remoteId === 'string')
    );
  } catch (err) {
    console.warn('[LocalOcrScans] Failed to read local scan remote-id map:', err);
    return {};
  }
}

function writeLocalRemoteIds(remoteIds: Record<string, string>): void {
  try {
    localStorage.setItem(LOCAL_OCR_SCAN_REMOTE_IDS_KEY, JSON.stringify(remoteIds));
  } catch (err) {
    console.warn('[LocalOcrScans] Failed to persist remote-id map; storage may be full:', err);
  }
}

function pruneLocalRemoteIds(activeScans: LocalOcrScanRecord[]): void {
  const activeIds = new Set<string>(activeScans.map((scan) => scan.id));
  const prunedRemoteIds = Object.fromEntries(
    Object.entries(readLocalRemoteIds()).filter(([localId]) => activeIds.has(localId))
  );
  writeLocalRemoteIds(prunedRemoteIds);
}

function isLocalOcrScanRecord(value: unknown): value is LocalOcrScanRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<LocalOcrScanRecord>;
  return (
    typeof record.id === 'string' &&
    record.id.startsWith('local-') &&
    typeof record.timestamp === 'string' &&
    typeof record.expiresAt === 'string' &&
    typeof record.ocrRaw === 'string' &&
    Boolean(record.ocrStructured) &&
    Boolean(record.tokenUsage) &&
    typeof record.apiKeyIndex === 'number'
  );
}

function isExpired(scan: LocalOcrScanRecord): boolean {
  return Date.parse(scan.expiresAt) <= Date.now();
}

function toScanRecord(scan: LocalOcrScanRecord): ScanRecord {
  return {
    id: scan.id,
    timestamp: new Date(scan.timestamp),
    imageDataUrl: scan.imageDataUrl || '',
    ocrRaw: scan.ocrRaw,
    ocrStructured: scan.ocrStructured,
    edited: scan.edited,
    tokenUsage: scan.tokenUsage,
    apiKeyIndex: scan.apiKeyIndex,
    modelTier: scan.modelTier,
  };
}

export function createLocalOcrScan(data: Omit<ScanRecord, 'id'>): string {
  const id = `local-${crypto.randomUUID()}` as const;
  const scan: LocalOcrScanRecord = {
    id,
    timestamp: data.timestamp.toISOString(),
    expiresAt: new Date(Date.now() + LOCAL_OCR_SCAN_TTL_MS).toISOString(),
    imageDataUrl: data.imageDataUrl,
    ocrRaw: data.ocrRaw,
    ocrStructured: data.ocrStructured,
    edited: data.edited,
    tokenUsage: data.tokenUsage,
    apiKeyIndex: data.apiKeyIndex,
    modelTier: data.modelTier,
  };
  const activeScans = readLocalScans().filter((localScan) => !isExpired(localScan));
  writeLocalScans([...activeScans.filter((localScan) => localScan.id !== id), scan]);
  return id;
}

export function getLocalOcrScan(id: string): ScanRecord | undefined {
  const activeScans = readLocalScans().filter((scan) => !isExpired(scan));
  writeLocalScans(activeScans);
  pruneLocalRemoteIds(activeScans);
  const scan = activeScans.find((localScan) => localScan.id === id);
  return scan ? toScanRecord(scan) : undefined;
}

export function updateLocalOcrScan(id: string, updates: Partial<Pick<ScanRecord, 'ocrRaw' | 'ocrStructured' | 'edited'>>): ScanRecord | undefined {
  const activeScans = readLocalScans().filter((scan) => !isExpired(scan));
  const updatedScans = activeScans.map((scan) => (
    scan.id === id
      ? {
        ...scan,
        ocrRaw: updates.ocrRaw ?? scan.ocrRaw,
        ocrStructured: updates.ocrStructured ?? scan.ocrStructured,
        edited: updates.edited ?? scan.edited,
      }
      : scan
  ));
  writeLocalScans(updatedScans);
  const updatedScan = updatedScans.find((scan) => scan.id === id);
  return updatedScan ? toScanRecord(updatedScan) : undefined;
}

export function deleteLocalOcrScan(id: string): void {
  const remainingScans = readLocalScans().filter((scan) => scan.id !== id);
  writeLocalScans(remainingScans);
  pruneLocalRemoteIds(remainingScans);
}

export function setLocalOcrScanRemoteId(localId: string, remoteId: string): void {
  writeLocalRemoteIds({
    ...readLocalRemoteIds(),
    [localId]: remoteId,
  });
}

export function getLocalOcrScanRemoteId(localId: string): string | undefined {
  return readLocalRemoteIds()[localId];
}

export function clearLocalOcrScans(): void {
  localStorage.removeItem(LOCAL_OCR_SCANS_KEY);
  localStorage.removeItem(LOCAL_OCR_SCAN_REMOTE_IDS_KEY);
}

export function cleanupExpiredLocalOcrScans(): void {
  const activeScans = readLocalScans().filter((scan) => !isExpired(scan));
  writeLocalScans(activeScans);
  pruneLocalRemoteIds(activeScans);
}
