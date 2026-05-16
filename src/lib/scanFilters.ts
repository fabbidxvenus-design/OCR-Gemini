import { ScanRecord } from '@/db/schema';
import scanDisplayName from './scanDisplayName';

export type ViewMode = 'list' | 'grid' | 'compact';

export type SortOption = 'date_desc' | 'date_asc' | 'name_az' | 'name_za' | 'fields_count';

export interface FilterState {
  search: string;
  chips: string[]; // 'today', 'this_week', 'edited', 'not_edited'
  dateRange: { from?: Date; to?: Date };
  modelTiers: ('free' | 'default' | 'high')[];
}

/**
 * Filter and sort scans based on search query, filters, and sort option
 */
export function filterAndSortScans(
  scans: ScanRecord[],
  filters: FilterState,
  sortBy: SortOption
): ScanRecord[] {
  let result = [...scans];

  // 1. Search filtering
  if (filters.search.trim()) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter((scan) => {
      const displayName = scanDisplayName(scan).toLowerCase();
      const rawText = (scan.ocrStructured?.raw_text || '').toLowerCase();

      // Search in display name
      if (displayName.includes(searchLower)) return true;

      // Search in fields
      const fieldMatch = scan.ocrStructured?.fields?.some(
        (f) => f.field.toLowerCase().includes(searchLower) || f.value.toLowerCase().includes(searchLower)
      );
      if (fieldMatch) return true;

      // Search in raw text
      if (rawText.includes(searchLower)) return true;

      return false;
    });
  }

  // 2. Chip filtering
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of week (Monday)
  const startOfWeek = new Date(startOfToday);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  if (filters.chips.includes('today')) {
    result = result.filter((s) => new Date(s.timestamp) >= startOfToday);
  }

  if (filters.chips.includes('this_week')) {
    result = result.filter((s) => new Date(s.timestamp) >= startOfWeek);
  }

  if (filters.chips.includes('edited')) {
    result = result.filter((s) => s.edited);
  }

  if (filters.chips.includes('not_edited')) {
    result = result.filter((s) => !s.edited);
  }

  // 3. Model tier filtering
  if (filters.modelTiers.length > 0) {
    result = result.filter((s) => s.modelTier && filters.modelTiers.includes(s.modelTier));
  }

  // 4. Date range filtering
  if (filters.dateRange.from) {
    result = result.filter((s) => new Date(s.timestamp) >= filters.dateRange.from!);
  }
  if (filters.dateRange.to) {
    const endOfDay = new Date(filters.dateRange.to);
    endOfDay.setHours(23, 59, 59, 999);
    result = result.filter((s) => new Date(s.timestamp) <= endOfDay);
  }

  // 5. Sorting
  result.sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'name_az':
        return scanDisplayName(a).localeCompare(scanDisplayName(b));
      case 'name_za':
        return scanDisplayName(b).localeCompare(scanDisplayName(a));
      case 'fields_count': {
        const countA = (a.ocrStructured?.fields?.length || 0) + (a.ocrStructured?.sizes?.length || 0);
        const countB = (b.ocrStructured?.fields?.length || 0) + (b.ocrStructured?.sizes?.length || 0);
        return countB - countA;
      }
      case 'date_desc':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return result;
}
