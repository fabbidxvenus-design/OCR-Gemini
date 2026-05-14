import type { OCRResponse, ScanRecord, TokenUsage } from '@/db/schema';

const LOCAL_OCR_SCANS_KEY = 'hlvn.localOcrScans';
const LOCAL_OCR_SCAN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_LOCAL_OCR_SCANS = 10;

interface LocalOcrScanRecord {
  id: `local-${string}`;
  timestamp: string;
  expiresAt: string;
  ocrRaw: string;
  ocrStructured: OCRResponse;
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
  } catch {
    return [];
  }
}

function writeLocalScans(scans: LocalOcrScanRecord[]): void {
  const boundedScans = scans.slice(-MAX_LOCAL_OCR_SCANS);
  try {
    localStorage.setItem(LOCAL_OCR_SCANS_KEY, JSON.stringify(boundedScans));
  } catch {
    try {
      const newestScans = boundedScans.slice(-1);
      localStorage.setItem(LOCAL_OCR_SCANS_KEY, JSON.stringify(newestScans));
    } catch {
      localStorage.removeItem(LOCAL_OCR_SCANS_KEY);
    }
  }
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
    imageDataUrl: '',
    ocrRaw: scan.ocrRaw,
    ocrStructured: scan.ocrStructured,
    edited: false,
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
    ocrRaw: data.ocrRaw,
    ocrStructured: data.ocrStructured,
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
  const scan = activeScans.find((localScan) => localScan.id === id);
  return scan ? toScanRecord(scan) : undefined;
}

export function deleteLocalOcrScan(id: string): void {
  writeLocalScans(readLocalScans().filter((scan) => scan.id !== id));
}

export function cleanupExpiredLocalOcrScans(): void {
  writeLocalScans(readLocalScans().filter((scan) => !isExpired(scan)));
}
