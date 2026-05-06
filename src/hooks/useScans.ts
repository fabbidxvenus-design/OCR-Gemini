import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ScanRecord } from '@/db/schema';

// Get all scans with optional pagination
export function useScans(options?: { limit?: number; order?: 'asc' | 'desc' }): ScanRecord[] | undefined {
  const { limit = 100, order = 'desc' } = options || {};

  return useLiveQuery(async () => {
    const scans = await db.scans
      .orderBy('timestamp')
      .limit(limit)
      .toArray();

    return order === 'desc' ? scans.reverse() : scans;
  }, [limit, order]);
}

// Get a single scan by ID
export function useScan(scanId?: string): ScanRecord | undefined {
  return useLiveQuery(
    async () => {
      if (!scanId) return undefined;
      return await db.scans.get(scanId);
    },
    [scanId]
  );
}

// Search scans by text
export function useSearchScans(query: string): ScanRecord[] | undefined {
  return useLiveQuery(
    async () => {
      if (!query) return [];

      const allScans = await db.scans.toArray();
      const lowerQuery = query.toLowerCase();

      return allScans.filter((scan) => {
        const title = scan.ocrStructured?.title;
        const fields = scan.ocrStructured?.fields;
        const rawText = scan.ocrStructured?.raw_text;

        // Search in title
        if (title && title.toString().toLowerCase().includes(lowerQuery)) {
          return true;
        }
        // Search in fields (safely handle null/undefined values)
        if (fields?.some((f) => f.value != null && f.value.toString().toLowerCase().includes(lowerQuery))) {
          return true;
        }
        // Search in raw text
        if (rawText && rawText.toString().toLowerCase().includes(lowerQuery)) {
          return true;
        }
        return false;
      });
    },
    [query]
  );
}

// Create a new scan
export async function createScan(data: Omit<ScanRecord, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await db.scans.add({ id, ...data });
  return id;
}

// Get API key usage statistics
export async function getApiKeyUsageStats(): Promise<{ key1Count: number; key2Count: number; key1Cost: number; key2Cost: number }> {
  const scans = await db.scans.toArray();

  const key1Scans = scans.filter(s => s.apiKeyIndex === 1);
  const key2Scans = scans.filter(s => s.apiKeyIndex === 2);

  const key1Cost = key1Scans.reduce((sum, s) => sum + (s.tokenUsage?.cost || 0), 0);
  const key2Cost = key2Scans.reduce((sum, s) => sum + (s.tokenUsage?.cost || 0), 0);

  return {
    key1Count: key1Scans.length,
    key2Count: key2Scans.length,
    key1Cost,
    key2Cost,
  };
}

// Get API key usage statistics
export async function getApiKeyUsageStats(): Promise<{ key1Count: number; key2Count: number; key1Cost: number; key2Cost: number }> {
  const scans = await db.scans.toArray();

  const key1Scans = scans.filter(s => s.apiKeyIndex === 1);
  const key2Scans = scans.filter(s => s.apiKeyIndex === 2);

  const key1Cost = key1Scans.reduce((sum, s) => sum + (s.tokenUsage?.cost || 0), 0);
  const key2Cost = key2Scans.reduce((sum, s) => sum + (s.tokenUsage?.cost || 0), 0);

  return {
    key1Count: key1Scans.length,
    key2Count: key2Scans.length,
    key1Cost,
    key2Cost,
  };
}

// Update a scan
export async function updateScan(scanId: string, updates: Partial<ScanRecord>): Promise<void> {
  await db.scans.update(scanId, updates);
}

// Mark scan as edited
export async function markScanAsEdited(scanId: string): Promise<void> {
  await db.scans.update(scanId, { edited: true });
}

// Delete a scan
export async function deleteScan(scanId: string): Promise<void> {
  await db.scans.delete(scanId);
}

// Cleanup old scans (90 days)
export async function cleanupOldScans(): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const oldScans = await db.scans
    .where('timestamp')
    .below(cutoff)
    .toArray();

  const ids = oldScans.map((s) => s.id!);
  await db.scans.bulkDelete(ids);

  return ids.length;
}