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
        // Search in title
        if (scan.ocrStructured.title?.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        // Search in fields
        if (scan.ocrStructured.fields?.some(
          (f) => f.value.toLowerCase().includes(lowerQuery)
        )) {
          return true;
        }
        // Search in raw text
        if (scan.ocrStructured.raw_text?.toLowerCase().includes(lowerQuery)) {
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