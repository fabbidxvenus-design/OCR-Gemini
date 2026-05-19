import { useMemo } from 'react';
import type { ScanRecord } from '@/db/schema';
import scanDisplayName from '@/lib/scanDisplayName';

export type SortOption = 'date_desc' | 'date_asc' | 'name_az' | 'name_za';
export type FilterType = 'all' | 'needs_review' | 'edited' | 'error';

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}

export function needsReview(scan: ScanRecord): boolean {
  return scan.ocrStructured?.fields?.some(field => field.confidence === 'low' || !field.value) ?? false;
}

export interface UseFilteredScansOptions {
  query?: string;
  filter?: FilterType;
  sort?: SortOption;
}

export function useFilteredScans(
  scans: ScanRecord[],
  options: UseFilteredScansOptions = {}
): ScanRecord[] {
  const { query = '', filter = 'all', sort = 'date_desc' } = options;

  return useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    const filtered = scans.filter(scan => {
      const matchesSearch = !lowerQuery
        || scanDisplayName(scan).toLowerCase().includes(lowerQuery)
        || scan.ocrStructured?.fields?.some(
          field => `${field.field} ${field.value}`.toLowerCase().includes(lowerQuery)
        );

      if (!matchesSearch) return false;
      if (filter === 'needs_review') return needsReview(scan);
      if (filter === 'edited') return scan.edited;
      if (filter === 'error') return !scan.ocrStructured;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sort === 'name_az') return scanDisplayName(a).localeCompare(scanDisplayName(b), 'vi');
      if (sort === 'name_za') return scanDisplayName(b).localeCompare(scanDisplayName(a), 'vi');
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [scans, query, filter, sort]);
}